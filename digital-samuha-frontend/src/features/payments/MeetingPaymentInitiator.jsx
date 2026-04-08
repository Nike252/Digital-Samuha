import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { subscriptionsAPI } from '../../utils/api';
import MainLayout from '../../layouts/MainLayout';
import { ShieldCheck, ArrowRight, AlertCircle, CreditCard, Loader2 } from 'lucide-react';
import { useUI } from '../../context/UIContext';

const MeetingPaymentInitiator = ({ user, onLogout }) => {
  const { samuhaId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useUI();
  
  const [loading, setLoading] = useState(true);
  const [feeData, setFeeData] = useState(null);
  const [error, setError] = useState(null);
  const [alreadyPaid, setAlreadyPaid] = useState(false);
  const [initiating, setInitiating] = useState(false);

  useEffect(() => {
    fetchFeeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFeeData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Backend automatically checks the active meeting and user's attendance for fines
      const response = await subscriptionsAPI.calculateMeetingFee();
      setFeeData(response.data);
    } catch (err) {
      console.error("Fee calculation error:", err);
      // Wait, let's see if the backend returns specific messages. If there is no active meeting, what does it do?
      // Actually, eSewaMeetingInitiateView enforces the active meeting check. We can check that later.
      setError(err.message || 'Failed to calculate your meeting fees.');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!feeData) return;
    try {
      setInitiating(true);
      const res = await subscriptionsAPI.initiateMeetingEsewa(feeData.total_amount);
      
      const { signature, transaction_uuid, total_amount, product_code, success_url, failure_url } = res.data;

      // Create and submit eSewa form dynamically
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

      const fields = {
          amount: String(total_amount),
          tax_amount: "0",
          total_amount: String(total_amount),
          transaction_uuid: transaction_uuid,
          product_code: product_code,
          product_delivery_charge: "0",
          product_service_charge: "0",
          success_url: success_url,
          failure_url: failure_url,
          signed_field_names: "total_amount,transaction_uuid,product_code",
          signature: signature
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
    } catch (err) {
      setInitiating(false);
      console.error(err);
      if (err.response?.data?.already_paid) {
        setAlreadyPaid(true);
        showToast(err.response.data.detail, 'success');
      } else {
        showToast(err.message || 'Payment initiation failed', 'error');
      }
    }
  };

  if (loading) {
    return (
      <MainLayout user={user} onLogout={onLogout}>
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
          <p className="text-gray-500 font-medium">Calculating details...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout user={user} onLogout={onLogout}>
      <div className="max-w-xl mx-auto py-8">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <CreditCard size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Meeting Savings</h1>
          <p className="text-gray-500 mt-2">Fund your Samuha directly from your mobile.</p>
        </div>

        {alreadyPaid ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-center animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="text-emerald-600" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Savings Active! ✨</h2>
            <p className="text-gray-600 mt-2 max-w-sm mx-auto">
              You have already successfully deposited your savings for this meeting cycle.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-8 px-6 py-3 bg-white text-emerald-700 font-bold rounded-xl border border-emerald-200 hover:bg-emerald-50 transition-colors shadow-sm"
            >
              Return to Dashboard
            </button>
          </div>
        ) : error ? (
           <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center">
            <AlertCircle className="text-rose-600 mx-auto mb-4" size={40} />
            <h2 className="text-xl font-bold text-gray-900">{error}</h2>
            <p className="text-gray-500 mt-2">There might not be an active meeting right now, or you are not a member.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-6 px-6 py-3 bg-white text-rose-700 font-bold rounded-xl border border-rose-200 hover:bg-rose-50 transition-colors"
            >
              Go Back
            </button>
          </div>
        ) : feeData ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-100 bg-gray-50/50">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Paying To</p>
              <h3 className="text-xl font-bold text-gray-900">{feeData.samuha_name}</h3>
            </div>
            
            <div className="p-8">
              <h4 className="text-sm font-bold text-gray-900 mb-4 border-b pb-2">Breakdown</h4>
              <ul className="space-y-3 mb-8">
                {feeData.breakdown.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center text-gray-600">
                    <span className="font-medium">{item.label}</span>
                    <span className="font-mono text-gray-900 font-semibold">NPR {item.amount.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex justify-between items-center mb-8">
                <span className="text-indigo-900 font-bold">Total Payable</span>
                <span className="text-3xl font-extrabold text-indigo-700 font-mono tracking-tight">NPR {feeData.total_amount.toFixed(2)}</span>
              </div>

              <button
                onClick={handlePay}
                disabled={initiating}
                className="w-full flex items-center justify-center gap-2 py-4 bg-[#60BB46] hover:bg-[#52a13b] text-white font-bold rounded-xl transition-all shadow-lg shadow-green-200 disabled:opacity-50"
              >
                {initiating ? 'Connecting to eSewa...' : (
                  <>Pay with eSewa <ArrowRight size={20} /></>
                )}
              </button>
            </div>
          </div>
        ) : null}

      </div>
    </MainLayout>
  );
};

export default MeetingPaymentInitiator;
