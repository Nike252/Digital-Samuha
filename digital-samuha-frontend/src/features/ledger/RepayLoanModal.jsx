import React, { useState, useEffect } from 'react';
import { X, Receipt, AlertCircle } from 'lucide-react';
import { useUI } from '../../context/UIContext';

const RepayLoanModal = ({ isOpen, onClose, onSubmit, loan, loading }) => {
  const { showToast } = useUI();
  const [repaymentAmount, setRepaymentAmount] = useState('');

  // Update default repayment amount when loan changes
  useEffect(() => {
    if (loan) {
      setRepaymentAmount(loan.remaining_principal || loan.principal_amount || '');
    }
  }, [loan]);

  if (!isOpen || !loan) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!repaymentAmount || repaymentAmount <= 0) {
      showToast("Enter a valid repayment amount.", "error");
      return;
    }
    const totalDues = parseFloat(loan.remaining_principal || 0) + parseFloat(loan.accrued_interest || 0);
    if (parseFloat(repaymentAmount) > totalDues) {
      showToast("Amount cannot exceed the total dues (Principal + Interest).", "error");
      return;
    }
    onSubmit(loan.id, { amount: repaymentAmount });
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
              <Receipt size={20} />
            </div>
            <h2 className="text-xl font-black text-gray-900">Repay Loan</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Principal Balance</span>
                <span className="font-bold text-gray-900">NPR {parseFloat(loan.remaining_principal || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Accrued Interest</span>
                <span className="font-bold text-indigo-600">+ NPR {parseFloat(loan.accrued_interest || 0).toLocaleString()}</span>
              </div>
              <div className="h-px bg-gray-200 my-1" />
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Total Dues Today</span>
                <span className="text-lg font-black text-rose-600 underline">
                  NPR {(parseFloat(loan.remaining_principal || 0) + parseFloat(loan.accrued_interest || 0)).toLocaleString()}
                </span>
              </div>
            </div>

           <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3 text-amber-700">
             <AlertCircle size={20} className="shrink-0" />
             <p className="text-xs font-bold leading-relaxed">
               Partial repayments are allowed. Ensure the correct amount is collected before submitting.
             </p>
           </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Repayment Amount (NPR)</label>
            <input 
              type="number"
              value={repaymentAmount}
              onChange={(e) => setRepaymentAmount(e.target.value)}
              className="w-full p-4 bg-gray-50 border-none rounded-xl text-gray-900 font-bold focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all outline-none text-xl"
              placeholder="e.g. 5000"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all mt-4"
          >
            Confirm Repayment
          </button>
        </form>
      </div>
    </div>
  );
};

export default RepayLoanModal;
