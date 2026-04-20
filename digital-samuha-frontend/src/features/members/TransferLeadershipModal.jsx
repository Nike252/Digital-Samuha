import React, { useState, useEffect } from 'react';
import { Crown, AlertTriangle, X, ShieldAlert, Mail, CreditCard } from 'lucide-react';

const TransferLeadershipModal = ({ isOpen, onClose, successor, onConfirm, isProcessing }) => {
  const [email, setEmail] = useState('');
  const [citizenshipNo, setCitizenshipNo] = useState('');
  const [error, setError] = useState('');

  // Reset local state when modal opens with a new successor
  useEffect(() => {
    if (isOpen && successor) {
      setEmail(successor.email || '');
      setCitizenshipNo(successor.citizenship_no || '');
      setError('');
    }
  }, [isOpen, successor]);

  if (!isOpen || !successor) return null;

  const isEmailMissing = !successor.email;
  const isCitNoMissing = !successor.citizenship_no;

  const handleConfirm = () => {
    setError('');
    
    // Validation
    if (isEmailMissing && (!email || !email.includes('@'))) {
      setError('A valid email address is required for the new leader.');
      return;
    }

    if (isCitNoMissing && !citizenshipNo) {
      setError('Citizenship number is required for the new leader.');
      return;
    }

    // Pass data back - only pass what's newly added or changed
    onConfirm(successor.membership_id, email !== successor.email ? email : null, citizenshipNo !== successor.citizenship_no ? citizenshipNo : null);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
        
        {/* Header with Warning Icon */}
        <div className="bg-rose-50 pt-10 pb-6 px-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 bg-rose-500/10 rounded-3xl animate-ping" />
            <Crown size={44} className="text-rose-600 relative z-10" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Transfer presidency?</h2>
          <p className="text-gray-500 text-sm mt-2 font-medium">Finalizing leadership transition to {successor.full_name}.</p>
        </div>

        <div className="p-8 space-y-6">
          {/* Successor Card */}
          <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-200">
              {successor.full_name.charAt(0)}
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Selected Successor</p>
              <p className="font-bold text-gray-900">{successor.full_name}</p>
            </div>
          </div>

          {/* Conditional Information Input */}
          {(isEmailMissing || isCitNoMissing) && (
            <div className="space-y-4 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
              <p className="text-xs font-bold text-indigo-800 flex items-center gap-2">
                <AlertTriangle size={14} /> IMPORTANT: Missing Information Required
              </p>
              
              {isEmailMissing && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Assign Official Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="email"
                      placeholder="Enter new leader's email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-indigo-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {isCitNoMissing && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Confirm Citizenship No.</label>
                  <div className="relative">
                    <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text"
                      placeholder="Enter citizenship number"
                      value={citizenshipNo}
                      onChange={(e) => setCitizenshipNo(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-indigo-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 flex items-center gap-2">
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          {/* Warning Message */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 italic">
            <ShieldAlert size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              By proceeding, your roles will be <span className="font-bold">swapped</span>. This member will become the absolute Adhakshya and you will lose all administrative power immediately.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className={`w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-2xl shadow-xl shadow-rose-200 transition-all flex items-center justify-center gap-2 ${isProcessing ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Crown size={18} />
                  Approve Role Swap
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="w-full py-4 text-gray-400 font-bold hover:text-gray-600 transition-colors"
            >
              Cancel Transfer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferLeadershipModal;
