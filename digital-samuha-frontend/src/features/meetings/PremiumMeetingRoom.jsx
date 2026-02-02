import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { AlertTriangle, CreditCard, Loader2, CheckCircle, ArrowRight, X, Minimize2 } from 'lucide-react';
import { useCall } from '../../context/CallContext';
import { subscriptionsAPI, attendanceAPI } from '../../utils/api';
import { useUI } from '../../context/UIContext';

const PremiumMeetingRoom = ({ user, onLogout }) => {
  const { roomID } = useParams();
  const navigate = useNavigate();
  const { showToast } = useUI();
  const { active, loading, error, getVideoElement, joinCall, minimizeCall, endCall } = useCall();

  // Only show payment features for scheduled premium meetings (samuha_*), not group chat calls
  const isPremiumMeeting = roomID?.startsWith('samuha_');

  // Host div for the full-screen video
  const fullScreenHostRef = useRef(null);

  // Payment panel state
  const [showPayPanel, setShowPayPanel] = useState(false);
  const [feeData, setFeeData] = useState(null);
  const [feeLoading, setFeeLoading] = useState(false);
  const [feeError, setFeeError] = useState(null);
  const [initiating, setInitiating] = useState(false);
  const [alreadyPaid, setAlreadyPaid] = useState(false);

  // Join call on mount & check payment status
  useEffect(() => {
    if (!active && roomID && user) {
      joinCall(roomID, user, navigate);
    }
    
    // Check payment status on mount if it's a premium meeting
    if (isPremiumMeeting) {
      subscriptionsAPI.calculateMeetingFee()
        .then(res => {
          if (res.data.already_paid) {
            setAlreadyPaid(true);
          }
          setFeeData(res.data);
          
          // Auto-mark present if they are in the room and we have a meeting ID
          if (res.data.meeting_id) {
            attendanceAPI.markPresent(res.data.meeting_id)
              .catch(err => console.error("Error marking attendance present:", err));
          }
        })
        .catch(err => console.error("Error checking initial payment status:", err));
    }
  }, [roomID, user, isPremiumMeeting]);

  // Move the persistent video element into the full-screen host
  useEffect(() => {
    if (active && fullScreenHostRef.current) {
      const videoEl = getVideoElement();
      if (videoEl && fullScreenHostRef.current !== videoEl.parentNode) {
        fullScreenHostRef.current.appendChild(videoEl);
      }
    }
  }, [active, loading, getVideoElement]);

  const openPayPanel = useCallback(async () => {
    setShowPayPanel(true);
    setFeeLoading(true);
    setFeeError(null);
    try {
      const res = await subscriptionsAPI.calculateMeetingFee();
      setFeeData(res.data);
      if (res.data.already_paid) {
        setAlreadyPaid(true);
      }
    } catch (err) {
      setFeeError(err.message || 'Could not load payment details.');
    } finally {
      setFeeLoading(false);
    }
  }, []);

  const handlePayWithEsewa = async () => {
    if (!feeData) return;
    try {
      setInitiating(true);
      const res = await subscriptionsAPI.initiateMeetingEsewa(feeData.total_amount);
      const { signature, transaction_uuid, total_amount, product_code, success_url, failure_url } = res.data;

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
      form.target = '_blank'; // OPEN IN NEW TAB TO KEEP CALL ACTIVE

      const fields = {
        amount: String(total_amount), tax_amount: "0", total_amount: String(total_amount),
        transaction_uuid, product_code, product_delivery_charge: "0", product_service_charge: "0",
        success_url, failure_url, signed_field_names: "total_amount,transaction_uuid,product_code", signature
      };

      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      
      // Cleanup: remove form and reset loading state immediately
      document.body.removeChild(form);
      setInitiating(false);
    } catch (err) {
      setInitiating(false);
      if (err.response?.data?.already_paid) {
        setAlreadyPaid(true);
        showToast(err.response.data.detail, 'success');
      } else {
        showToast(err.message || 'Payment initiation failed', 'error');
      }
    }
  };

  const handleMinimize = () => {
    minimizeCall();
    navigate('/dashboard');
  };

  return (
    <MainLayout user={user} onLogout={onLogout} userRole={user?.role}>
      <div className="h-[calc(100vh-100px)] flex gap-4">
        
        {/* === VIDEO CALL SECTION === */}
        <div className={`bg-gray-900 rounded-3xl overflow-hidden shadow-2xl relative border border-gray-800 transition-all duration-500 ${showPayPanel ? 'flex-1' : 'w-full'}`}>
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-[9999]">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-white font-medium">Entering Virtual Office...</p>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-[10000] p-6 text-center">
              <AlertTriangle size={64} className="text-rose-500 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
              <p className="text-gray-400 max-w-md">{error}</p>
              <button onClick={() => navigate('/dashboard')} className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">Return to Dashboard</button>
            </div>
          )}

          {/* Full-screen host for the persistent video element */}
          <div ref={fullScreenHostRef} className="w-full h-full" />

          {/* Controls overlay */}
          {!loading && !error && (
            <div className="absolute top-4 right-4 z-[100] flex items-center gap-2">
              <button
                onClick={handleMinimize}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/80 hover:bg-gray-700 text-white font-bold rounded-xl backdrop-blur-sm transition-all active:scale-95"
                title="Minimize to PiP"
              >
                <Minimize2 size={18} />
                <span className="hidden md:inline">Minimize</span>
              </button>
              {isPremiumMeeting && (
                alreadyPaid ? (
                  <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 font-bold rounded-xl shadow-sm">
                    <CheckCircle size={18} />
                    <span>Paid</span>
                  </div>
                ) : (
                  <button
                    onClick={openPayPanel}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
                  >
                    <CreditCard size={18} />
                    Pay Savings
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {/* === PAYMENT SIDE PANEL === */}
        {showPayPanel && (
          <div className="w-[360px] flex-shrink-0 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-y-auto animate-in slide-in-from-right-8 duration-500">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 text-white relative">
              <button onClick={() => setShowPayPanel(false)} className="absolute top-3 right-3 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X size={16} /></button>
              <div className="mx-auto w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-3"><CreditCard size={28} /></div>
              <h3 className="text-xl font-bold text-center">Monthly Savings</h3>
              <p className="text-indigo-200 text-sm text-center mt-1">Pay while in the meeting</p>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 rounded-xl p-4 mb-6 flex items-center gap-3 border border-gray-100">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{user?.full_name}</p>
                  <p className="text-xs text-gray-400">Paying as logged-in user</p>
                </div>
              </div>

              {alreadyPaid ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="text-emerald-600" size={40} /></div>
                  <h4 className="text-xl font-bold text-gray-900">Savings Deposited! ✨</h4>
                  <p className="text-gray-500 text-sm mt-2">Your payment has been recorded.</p>
                </div>
              ) : feeLoading ? (
                <div className="flex flex-col items-center py-12"><Loader2 className="animate-spin text-indigo-600 mb-3" size={36} /><p className="text-gray-400 text-sm">Calculating dues...</p></div>
              ) : feeError ? (
                <div className="text-center py-8">
                  <AlertTriangle className="text-amber-500 mx-auto mb-3" size={36} />
                  <p className="text-gray-700 font-bold mb-1">Cannot Load</p>
                  <p className="text-gray-400 text-sm">{feeError}</p>
                  <button onClick={openPayPanel} className="mt-4 px-5 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-bold text-sm">Retry</button>
                </div>
              ) : feeData ? (
                <>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Breakdown</h4>
                  <ul className="space-y-2.5 mb-6">
                    {feeData.breakdown.map((item, idx) => (
                      <li key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 font-medium">{item.label}</span>
                        <span className="font-mono font-bold text-gray-900">NPR {item.amount.toFixed(0)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex justify-between items-center mb-6">
                    <span className="text-indigo-900 font-bold">Total</span>
                    <span className="text-2xl font-extrabold text-indigo-700 font-mono">NPR {feeData.total_amount.toFixed(0)}</span>
                  </div>
                  <button onClick={handlePayWithEsewa} disabled={initiating} className="w-full flex items-center justify-center gap-2 py-4 bg-[#60BB46] hover:bg-[#52a13b] text-white font-bold rounded-xl transition-all shadow-lg shadow-green-200/50 disabled:opacity-50 active:scale-[0.98]">
                    {initiating ? (<><Loader2 size={20} className="animate-spin" /> Connecting...</>) : (<>Pay via eSewa <ArrowRight size={20} /></>)}
                  </button>
                  <p className="text-[11px] text-gray-400 text-center mt-4">Securely processed through eSewa under your name.</p>
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PremiumMeetingRoom;
