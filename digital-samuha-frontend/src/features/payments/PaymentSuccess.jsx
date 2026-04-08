import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import usePaymentVerification from './usePaymentVerification';

const PaymentSuccess = ({ user, onLogout }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { status } = usePaymentVerification(searchParams);

  const StatusIcon = {
    'verifying': () => <div className="w-24 h-24 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-8 shadow-xl shadow-indigo-100" />,
    'success': () => <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"><CheckCircle2 className="text-emerald-500" size={48} /></div>,
    'failed': () => <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"><XCircle className="text-rose-500" size={48} /></div>
  }[status];

  const StatusContent = {
    'verifying': { title: 'Verifying Payment', desc: 'Securing your transaction details...' },
    'success': { title: 'Payment Confirmed', desc: "Excellent! Your payment has been securely verified and recorded. Your Samuha's status has been updated." },
    'failed': { title: 'Verification Failed', desc: "We couldn't verify this transaction automatically. If funds were deducted, please contact your Adhakshya for manual verification." }
  }[status];

  return (
    <MainLayout user={user} onLogout={onLogout} userRole={user?.role}>
      <div className="max-w-xl mx-auto min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 w-full text-center border border-indigo-50/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 animate-in fade-in zoom-in duration-500">
            <StatusIcon />
            <h2 className={`text-4xl font-black text-gray-900 mb-3 tracking-tight ${status === 'success' ? 'animate-in slide-in-from-bottom-2' : ''}`}>{StatusContent.title}</h2>
            <p className="text-gray-500 font-medium mb-10 leading-relaxed text-lg px-4">{StatusContent.desc}</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className={`group flex items-center justify-center gap-3 w-full py-5 rounded-2xl font-black text-lg transition-all active:scale-[0.98] ${
                status === 'success' 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-2xl hover:shadow-indigo-200' 
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {status === 'success' ? 'Back to Dashboard' : 'Return Home'}
              {status === 'success' && <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PaymentSuccess;
