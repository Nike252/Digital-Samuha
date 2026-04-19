import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui';

const ExitRequestModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a reason for leaving.');
      return;
    }
    onSubmit(reason);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-indigo-600/80 backdrop-blur-md p-8 text-white flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-1/2 -left-1/4 w-full h-full bg-white/10 rounded-full blur-3xl rotate-12" />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-black tracking-tight">Request to Leave</h2>
            <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mt-1 opacity-80">Settlement & Closure</p>
          </div>
          <button onClick={onClose} className="relative z-10 p-2 hover:bg-white/10 rounded-full transition-all hover:rotate-90">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="bg-amber-500/10 backdrop-blur-sm border border-amber-200/50 rounded-2xl p-5 flex gap-4 text-amber-900 text-sm shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
               <AlertCircle className="text-amber-600" size={20} />
            </div>
            <p className="font-medium leading-relaxed">
              Your membership will be closed permanently. 
              Outstanding fines will be deducted from your savings.
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1">
              Reason for Leaving <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              className={`w-full px-5 py-4 rounded-2xl border ${error ? 'border-red-500 bg-red-50/50' : 'border-white/50 bg-white/40'} focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600/30 outline-none transition-all resize-none shadow-inner`}
              rows={4}
              placeholder="Please share your reason..."
              required
            />
            {error && <p className="text-xs text-red-600 font-bold mt-2 ml-1 animate-pulse">{error}</p>}
          </div>

          <div className="flex gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-2xl h-14 font-bold border-gray-200 hover:bg-gray-50 active:scale-95 transition-all text-gray-600 shadow-sm"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1 rounded-2xl h-14 font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95 transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                 <div className="flex items-center gap-2">
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   Sending...
                 </div>
              ) : 'Send Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExitRequestModal;
