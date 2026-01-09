import React from 'react';
import { Wallet, PiggyBank, HandCoins } from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import LoanRequestModal from './LoanRequestModal';
import RepayLoanModal from './RepayLoanModal';
import useLedger from './useLedger_Snappy';
import LedgerStatCard from './LedgerStatCard';
import LedgerOverviewTab from './LedgerOverviewTab';
import SavingsTab from './SavingsTab';
import LoansTab from './LoansTab';

const Ledger = ({ user, onLogout }) => {
  const ledger = useLedger(user) || {};
  
  const {
    activeTab, setActiveTab, loading, stats, transactions, loans, subscription,
    loanPredictions, predictingId, members, meetings, selectedMeetingId,
    setSelectedMeetingId, meetingAttendance, prevMeetingAttendance,
    showLoanModal, setShowLoanModal, savingBatch, setSavingBatch,
    highlightedTxId, txRefs, repayModalOpen, setRepayModalOpen,
    selectedLoanForRepay, setSelectedLoanForRepay, isAdhakshya,
    handleBatchSaving, handleLoanAction, handlePredict,
    handleDeleteTransaction, handleRepaymentSubmit, handleLoanRequest,
    samuhaSettings
  } = ledger;

  if (loading) {
    return (
      <MainLayout user={user} onLogout={onLogout} userRole={user.role}>
        <div className="py-32 flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-50 shadow-sm animate-in fade-in duration-700">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-400 font-bold tracking-tight uppercase text-xs">Synchronizing Ledger...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout user={user} onLogout={onLogout} userRole={user.role}>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Financial Ledger</h1>
        <p className="text-gray-500 mt-1">Manage savings, loans, and Samuha funds.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <LedgerStatCard 
          label="Total Samuha Fund" 
          value={`NPR ${(stats?.total_fund ?? 0).toLocaleString()}`} 
          icon={<Wallet className="text-indigo-600" />} 
          trend="+5.2%" color="bg-indigo-50" 
        />
        <LedgerStatCard 
          label="My Total Savings" 
          value={`NPR ${(stats?.my_savings ?? 0).toLocaleString()}`} 
          icon={<PiggyBank className="text-emerald-600" />} 
          color="bg-emerald-50" 
        />
        <LedgerStatCard 
          label="Active Loans" 
          value={`NPR ${(stats?.active_loans_total ?? 0).toLocaleString()}`} 
          icon={<HandCoins className="text-amber-600" />} 
          color="bg-amber-50" 
        />
      </div>

      <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl mb-8 w-fit">
        {['overview', 'savings', 'loans'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)} 
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
        {activeTab === 'overview' && (
          <LedgerOverviewTab 
            transactions={transactions} 
            highlightedTxId={highlightedTxId} 
            txRefs={txRefs} 
            userRole={user.role} 
            onDeleteTransaction={handleDeleteTransaction} 
          />
        )}
        {activeTab === 'savings' && (
          <SavingsTab 
            meetings={meetings}
            selectedMeetingId={selectedMeetingId}
            setSelectedMeetingId={setSelectedMeetingId}
            setSavingBatch={setSavingBatch}
            savingBatch={savingBatch}
            isAdhakshya={isAdhakshya}
            handleBatchSaving={handleBatchSaving}
            meetingAttendance={meetingAttendance}
            prevMeetingAttendance={prevMeetingAttendance}
            members={members}
            transactions={transactions}
            samuhaSettings={samuhaSettings}
          />
        )}
        {activeTab === 'loans' && (
          <LoansTab 
            loans={loans}
            user={user}
            setShowLoanModal={setShowLoanModal}
            isAdhakshya={isAdhakshya}
            handleLoanAction={handleLoanAction}
            handlePredict={handlePredict}
            predictingId={predictingId}
            subscription={subscription}
            loanPredictions={loanPredictions}
            setSelectedLoanForRepay={setSelectedLoanForRepay}
            setRepayModalOpen={setRepayModalOpen}
          />
        )}
      </div>

      <LoanRequestModal isOpen={showLoanModal} onClose={() => setShowLoanModal(false)} onSubmit={handleLoanRequest} userRole={user.role} />
      <RepayLoanModal isOpen={repayModalOpen} onClose={() => setRepayModalOpen(false)} onSubmit={handleRepaymentSubmit} loan={selectedLoanForRepay} />
    </MainLayout>
  );
};

export default Ledger;
