import React from 'react';
import { Plus, HandCoins, TrendingUp, Receipt } from 'lucide-react';

const LoansTab = ({
  loans,
  user,
  setShowLoanModal,
  isAdhakshya,
  handleLoanAction,
  handlePredict,
  predictingId,
  subscription,
  loanPredictions,
  setSelectedLoanForRepay,
  setRepayModalOpen
}) => {
  const currentUserId = user?.id;

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Loan Center</h3>
          <p className="text-sm text-gray-500 mt-1">Manage applications and repayments.</p>
        </div>
        <button
          onClick={() => setShowLoanModal(true)}
          className="flex items-center justify-center w-full sm:w-auto gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-100"
        >
          <Plus size={18} />
          Apply for Loan
        </button>
      </div>

      <div className="space-y-4">
        {loans.map(loan => (
          <div key={loan.id} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 group">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="flex gap-5">
                <div className="p-4 bg-white rounded-2xl shadow-sm self-start">
                  <HandCoins className="text-amber-500" size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-bold text-gray-900 text-lg">NPR {loan.principal_amount}</h4>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
                      loan.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                      loan.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {loan.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded uppercase tracking-wider">Borrower</span>
                    <p className="text-sm text-gray-900 font-black">{loan.user_details.full_name}</p>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mb-4 italic">"{loan.purpose}"</p>

                  <div className="flex flex-wrap gap-4 mt-2">
                    {['active', 'paid'].includes(loan.status) ? (
                      <>
                        <div className="text-[10px] bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                          <p className="font-bold text-gray-700">{loan.interest_rate}% Monthly Rate</p>
                          <p className="text-[9px] text-indigo-500 font-black mt-0.5">NPR {loan.monthly_interest_amount} Interest/mo</p>
                        </div>
                        <div className="text-[10px] bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 shadow-sm">
                          <p className="text-emerald-500 font-bold mb-0.5 uppercase tracking-tighter">Total Repaid</p>
                          <p className="font-black text-emerald-700">NPR {loan.total_repayments?.toLocaleString()}</p>
                        </div>
                        <div className="text-[10px] bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 shadow-sm">
                          <p className="text-amber-500 font-bold mb-0.5 uppercase tracking-tighter">Remaining</p>
                          <p className="font-black text-amber-700">NPR {loan.remaining_principal?.toLocaleString()}</p>
                        </div>
                      </>
                    ) : (
                      <div className="text-[10px] bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 text-gray-400 font-bold uppercase tracking-widest">
                        Loan Not Disbursed
                      </div>
                    )}
                    {isAdhakshya && loan.status === 'pending' && (
                      <>
                        <div className="text-[10px] bg-indigo-50/50 px-3 py-1.5 rounded-lg border border-indigo-100 shadow-sm">
                          <p className="text-indigo-400 font-bold mb-0.5 uppercase tracking-tighter">वार्षिक आम्दानी</p>
                          <p className="font-bold text-indigo-700">NPR {loan.annual_income?.toLocaleString() || 'N/A'}</p>
                        </div>
                        <div className="text-[10px] bg-indigo-50/50 px-3 py-1.5 rounded-lg border border-indigo-100 shadow-sm">
                          <p className="text-indigo-400 font-bold mb-0.5 uppercase tracking-tighter">कर्जा अनुपात</p>
                          <p className="font-bold text-indigo-700">{loan.dti_ratio}%</p>
                        </div>
                        <div className="text-[10px] bg-indigo-50/50 px-3 py-1.5 rounded-lg border border-indigo-100 shadow-sm">
                          <p className="text-indigo-400 font-bold mb-0.5 uppercase tracking-tighter">ऋण अवधि</p>
                          <p className="font-bold text-indigo-700">{loan.loan_term_months} महिना</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {isAdhakshya && loan.status === 'pending' && (
                <div className="flex flex-col items-end gap-3 self-end md:self-center">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleLoanAction(loan.id, 'reject')}
                      className="px-4 py-2 bg-white text-rose-600 border border-rose-100 rounded-xl text-sm font-bold hover:bg-rose-50 transition-all"
                    >
                      अस्विकार (Reject)
                    </button>
                    <button
                      onClick={() => handlePredict(loan.id)}
                      disabled={predictingId === loan.id || !subscription?.is_premium}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        loanPredictions[loan.id]
                          ? 'bg-blue-50 text-blue-600 border border-blue-100'
                          : !subscription?.is_premium
                            ? 'bg-gray-50 text-gray-400 border border-gray-100 cursor-not-allowed opacity-70'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={!subscription?.is_premium ? "Premium Subscription Required" : ""}
                    >
                      {predictingId === loan.id ? (
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <TrendingUp size={16} />
                      )}
                      {loanPredictions[loan.id] ? 'फेरी जाँच्नुहोस् (Re-Predict)' : !subscription?.is_premium ? 'Premium 💎' : 'एआई विश्लेषण (Predict)'}
                    </button>
                    <button
                      onClick={() => handleLoanAction(loan.id, 'approve')}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
                    >
                      स्विकृत (Approve)
                    </button>
                  </div>

                  {loanPredictions[loan.id] && (
                    <div className={`mt-3 p-4 rounded-2xl border transition-all animate-in slide-in-from-top-2 duration-300 ${
                      loanPredictions[loan.id].risk_score > 50
                        ? 'bg-rose-50 border-rose-100'
                        : 'bg-emerald-50 border-emerald-100'
                    }`}>
                      <div className="flex items-center justify-between mb-3 border-b border-white/50 pb-2">
                        <p className={`text-xs font-black uppercase tracking-widest ${
                          loanPredictions[loan.id].risk_score > 50 ? 'text-rose-600' : 'text-emerald-600'
                        }`}>
                          AI Result: {loanPredictions[loan.id].grade} Grade
                        </p>
                        <span className="text-[10px] font-bold text-gray-400">Default Prob: {loanPredictions[loan.id].ai_analysis.default_probability}</span>
                      </div>
                      
                      <p className="text-sm font-black text-gray-800 mb-3 underline decoration-indigo-200 underline-offset-4 decoration-2">
                        {loanPredictions[loan.id].recommendation}
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/60 backdrop-blur-sm p-2 rounded-xl">
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">Savings Record</p>
                          <p className="text-xs font-black text-gray-900">{loanPredictions[loan.id].ai_analysis.savings_consistency}</p>
                        </div>
                        <div className="bg-white/60 backdrop-blur-sm p-2 rounded-xl">
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">Loyalty</p>
                          <p className="text-xs font-black text-gray-900">{loanPredictions[loan.id].ai_analysis.membership_age}</p>
                        </div>
                        <div className="bg-white/60 backdrop-blur-sm p-2 rounded-xl">
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">Collateral</p>
                          <p className="text-xs font-black text-gray-900">{loanPredictions[loan.id].ai_analysis.collateral_coverage}</p>
                        </div>
                        <div className="bg-white/60 backdrop-blur-sm p-2 rounded-xl">
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">Risk Score</p>
                          <p className="text-xs font-black text-indigo-600">{loanPredictions[loan.id].risk_score}/100</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(isAdhakshya || loan.user_details.id === currentUserId) && loan.status === 'active' && (
                <div className="flex flex-col items-end gap-3 self-end md:self-center">
                  <button
                    onClick={() => {
                      setSelectedLoanForRepay(loan);
                      setRepayModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                  >
                    <Receipt size={18} />
                    Repay Loan
                  </button>
                  {loan.user_details.id !== currentUserId && <span className="text-[10px] text-gray-400 font-bold px-2">Adhakshya Override</span>}
                </div>
              )}

              {isAdhakshya && loan.status === 'approved' && (
                <button
                  onClick={() => handleLoanAction(loan.id, 'disburse')}
                  className="self-center px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                >
                  Disburse Funds
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoansTab;
