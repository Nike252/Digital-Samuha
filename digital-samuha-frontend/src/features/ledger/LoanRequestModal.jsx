import React, { useState } from 'react';
import { X, HandCoins, AlertCircle } from 'lucide-react';
import { useUI } from '../../context/UIContext';

const LoanRequestModal = ({ isOpen, onClose, onSubmit, userRole }) => {
  const { showToast } = useUI();
  const [formData, setFormData] = useState({
    loan_amount: '',
    loan_purpose: '',
    loan_term_months: 12,
    monthly_income: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (parseFloat(formData.loan_amount) <= 0) {
       showToast("Enter a valid loan amount.", "error");
       return;
    }
    // Convert monthly to annual for backend
    const submissionData = {
        ...formData,
        annual_income: parseFloat(formData.monthly_income) * 12
    };
    onSubmit(submissionData);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-amber-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
              <HandCoins size={20} />
            </div>
            <h2 className="text-xl font-black text-gray-900">Request Loan</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
           <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 text-blue-700">
             <AlertCircle size={20} className="shrink-0" />
             <p className="text-xs font-bold leading-relaxed">
               Loans are subject to approval by the Adhakshya. Our <span className="text-indigo-600">AI Risk Predictor</span> will analyze your request.
             </p>
           </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Requested Amount</label>
              <div className="relative">
                <input 
                  type="number"
                  value={formData.loan_amount}
                  onChange={(e) => setFormData({...formData, loan_amount: e.target.value})}
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-amber-50 focus:bg-white transition-all outline-none"
                  placeholder="50000"
                  required
                />
                <span className="absolute right-4 top-4 text-xs font-bold text-gray-300">NPR</span>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Term (Months)</label>
              <select 
                value={formData.loan_term_months}
                onChange={(e) => setFormData({...formData, loan_term_months: e.target.value})}
                className="w-full p-4 bg-gray-50 border-none rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-amber-50 focus:bg-white transition-all outline-none appearance-none"
              >
                {[3, 6, 12, 18, 24].map(m => <option key={m} value={m}>{m} Months</option>)}
              </select>
            </div>
          </div>

          <div className="pt-2">
            <h4 className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-4 border-b border-indigo-50 pb-2">Financial Standing</h4>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-2">Estimated Monthly Income</label>
              <div className="relative">
                <input 
                  type="number"
                  value={formData.monthly_income}
                  onChange={(e) => setFormData({...formData, monthly_income: e.target.value})}
                  className="w-full px-4 py-4 bg-indigo-50/30 border-none rounded-xl text-gray-900 font-bold focus:ring-2 focus:ring-indigo-100 outline-none"
                  placeholder="e.g. 50000"
                  required
                />
                <span className="absolute right-4 top-4 text-xs font-bold text-indigo-300">NPR</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 italic px-1">
                * Our AI will use this alongside your **Samuha Savings History** to assess risk.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Purpose of Loan</label>
            <textarea 
              value={formData.loan_purpose}
              onChange={(e) => setFormData({...formData, loan_purpose: e.target.value})}
              className="w-full p-4 bg-gray-50 border-none rounded-2xl text-gray-900 font-medium focus:ring-4 focus:ring-amber-50 focus:bg-white transition-all outline-none resize-none h-24"
              placeholder="Explain why you need this loan..."
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black shadow-lg shadow-amber-200 hover:bg-amber-600 active:scale-95 transition-all mt-4 flex items-center justify-center gap-3"
          >
            <HandCoins size={20} />
            Submit Application
          </button>

        </form>
      </div>
    </div>
  );
};

export default LoanRequestModal;
