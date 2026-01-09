import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Wallet, ShieldCheck, ArrowRight } from 'lucide-react';
import { samuhaAPI } from '../../utils/api';
import MainLayout from '../../layouts/MainLayout';
import { useUI } from '../../context/UIContext';

const QuickDepositForm = ({ user, onLogout }) => {
  const { showToast } = useUI();
  const { samuhaId } = useParams();
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('saving');
  const [samuhaSettings, setSamuhaSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await samuhaAPI.getSettings();
        setSamuhaSettings(res.data);
        setAmount(res.data.saving_amount);
      } catch (err) {
        console.error("Failed to fetch settings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'saving' && samuhaSettings) {
      setAmount(samuhaSettings.saving_amount);
    } else if (newType !== 'saving') {
      setAmount('');
    }
  };

  const handleDeposit = (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }
    
    // Redirect to the Esewa handler
    navigate('/esewa-redirect', { state: { amount, type } });
  };

  return (
    <MainLayout user={user} onLogout={onLogout} userRole={user?.role}>
      <div className="max-w-xl mx-auto mt-12 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wallet size={32} />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Quick eSewa Deposit</h2>
          <p className="text-gray-500 text-sm mt-2">Instantly add funds to your Samuha Ledger using eSewa.</p>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center">
             <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
             <p className="text-xs text-gray-400 mt-4 font-bold uppercase tracking-widest">Loading Settings...</p>
          </div>
        ) : (
          <form onSubmit={handleDeposit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Deposit Type</label>
              <select 
                value={type} 
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full p-4 bg-gray-50 border-none rounded-xl text-gray-900 font-medium focus:ring-4 focus:ring-emerald-50 focus:bg-white transition-all outline-none"
              >
                <option value="saving">Monthly Saving</option>
                <option value="loan_repayment">Loan Repayment</option>
                <option value="fine">Pay Fine</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Amount (NPR)</label>
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={type === 'saving' ? `Standard: ${samuhaSettings?.saving_amount || 500}` : "Enter amount"}
                className="w-full p-4 bg-gray-50 border-none rounded-xl text-gray-900 font-bold focus:ring-4 focus:ring-emerald-50 focus:bg-white transition-all outline-none text-xl placeholder:text-base placeholder:font-normal"
              />
            </div>

            <button 
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-4 bg-[#60bb46] text-white rounded-xl font-black shadow-lg shadow-emerald-200/50 hover:bg-[#4d9f36] active:scale-95 transition-all"
            >
              Pay with eSewa
              <ArrowRight size={20} />
            </button>
          </form>
        )}

        <div className="mt-8 flex justify-center items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest bg-gray-50 py-3 rounded-lg">
          <ShieldCheck size={16} /> 100% Secure Transaction
        </div>
      </div>
    </MainLayout>
  );
};

export default QuickDepositForm;
