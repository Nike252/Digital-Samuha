import React from 'react';
import { X, User, Calendar, CreditCard, Banknote, BadgeCheck, AlertCircle, Clock } from 'lucide-react';

const LoanDetailsModal = ({ isOpen, onClose, loan }) => {
  if (!isOpen || !loan) return null;

  // Compute calculated metrics according to requirements
  const principalAmount = parseFloat(loan.principal_amount) || 0;
  let remainingPrincipal = parseFloat(loan.remaining_principal) || 0;
  
  // If not disbursed (active) or paid, there is no remaining or paid principal
  if (['pending', 'approved', 'rejected'].includes(loan.status)) {
    remainingPrincipal = 0;
  }
  
  const paidPrincipal = ['active', 'paid'].includes(loan.status) ? principalAmount - remainingPrincipal : 0;
  const interestPaid = parseFloat(loan.total_interest_paid) || 0;

  const STATUS_COLORS = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-blue-100 text-blue-700',
    active: 'bg-indigo-100 text-indigo-700',
    rejected: 'bg-red-100 text-red-700',
    paid: 'bg-emerald-100 text-emerald-700'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden scale-in animate-in zoom-in-95 duration-200 flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="px-5 md:px-8 py-4 md:py-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
          <div className="pr-4">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 flex items-start md:items-center gap-2 md:gap-3 leading-tight">
              <CreditCard className="text-indigo-600 shrink-0 mt-0.5 md:mt-0" size={24} /> 
              <span>Loan Record Details</span>
            </h2>
            <p className="text-sm font-medium text-gray-500 mt-1 pl-1 md:pl-0">Ref ID: L-{loan.id.toString().padStart(4, '0')}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 text-gray-500 rounded-full transition-colors shrink-0">
            <X size={24} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 md:p-8 space-y-6 md:space-y-8 overflow-y-auto">
          
          {/* Top Info Banner - Borrower & Status */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:p-5 bg-indigo-50 border border-indigo-100 rounded-2xl gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                {loan.user_details?.full_name ? loan.user_details.full_name.charAt(0).toUpperCase() : <User />}
              </div>
              <div>
                <p className="text-xs font-black uppercase text-indigo-400 tracking-wider">Borrower</p>
                <p className="text-lg font-bold text-indigo-900">{loan.user_details?.full_name || 'Unknown Member'}</p>
                {loan.user_details?.phone && <p className="text-sm text-indigo-600 font-medium">{loan.user_details.phone}</p>}
              </div>
            </div>
            <div className="text-left md:text-right w-full md:w-auto">
              <p className="text-xs font-black uppercase text-indigo-400 tracking-wider mb-1">Status</p>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${STATUS_COLORS[loan.status] || 'bg-gray-100 text-gray-600'}`}>
                {loan.status}
              </span>
            </div>
          </div>

          {/* Dates Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-2xl">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl"><Calendar size={20} /></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Applied Date</p>
                <p className="font-bold text-gray-800">{new Date(loan.applied_date).toLocaleDateString()}</p>
              </div>
            </div>
            {(loan.disbursed_date || loan.approved_date) && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl"><BadgeCheck size={20} /></div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{loan.disbursed_date ? 'Disbursed Date' : 'Approved Date'}</p>
                  <p className="font-bold text-gray-800">{new Date(loan.disbursed_date || loan.approved_date).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </div>

          {/* Financial Breakdown */}
          <div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Banknote size={16} className="text-indigo-600" /> Financial Breakdown
            </h3>
            
            <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-b">
                <div className="p-4 md:p-5">
                  <p className="text-sm font-semibold text-gray-500 mb-1">Total Principal</p>
                  <p className="text-2xl font-black text-gray-900">NPR {principalAmount.toLocaleString()}</p>
                </div>
                <div className="p-5">
                  <p className="text-sm font-semibold text-gray-500 mb-1">Interest Rate</p>
                  <p className="text-2xl font-black text-gray-900">{parseFloat(loan.interest_rate)}% <span className="text-sm font-medium text-gray-400 align-middle">/mo</span></p>
                </div>
              </div>
              
              <div className="bg-gray-50/50 p-4 md:p-5 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x border-b border-gray-100">
                <div className="pt-4 md:pt-0">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1 flex items-center gap-1"><BadgeCheck size={14} /> Principal Paid</p>
                  <p className="text-xl font-bold text-gray-800">NPR {paidPrincipal.toLocaleString()}</p>
                </div>
                <div className="pt-4 md:pt-0 md:pl-6">
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1 flex items-center gap-1"><Banknote size={14} /> Interest Paid</p>
                  <p className="text-xl font-bold text-gray-800">NPR {interestPaid.toLocaleString()}</p>
                </div>
                <div className="pt-4 md:pt-0 md:pl-6">
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1 flex items-center gap-1"><AlertCircle size={14} /> Remaining</p>
                  <p className="text-xl font-black text-gray-900">NPR {remainingPrincipal.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            {loan.purpose && (
              <div className="mt-5 p-4 bg-gray-50 rounded-xl text-sm text-gray-600 border border-gray-100">
                <span className="font-bold text-gray-800">Stated Purpose:</span> {loan.purpose}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoanDetailsModal;
