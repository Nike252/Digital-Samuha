import React from 'react';
import MainLayout from '../../layouts/MainLayout';
import RecentTransactions from './RecentTransactions';
import NoticeBoard from './NoticeBoard';
import useDashboard from './useDashboard';
import SummaryStats from './SummaryStats';
import DashboardActions from './DashboardActions';
import MeetingCard from './MeetingCard';
import UpgradeCTA from './UpgradeCTA';
import ExitRequestModal from '../members/ExitRequestModal';
import { toast } from 'react-hot-toast';
import { samuhaAPI } from '../../utils/api';

export const Dashboard = ({ role, user, onLogout, onNavigate, currentPath }) => {
  const {
    nextMeeting, samuhaSettings, recentTransactions,
    subscription, loading, config, userName, welcomeMsg,
    formatTime, stats, handleQuickAction: originalHandleQuickAction,
    dashboardStats
  } = useDashboard(role, user, onNavigate);

  const [isExitModalOpen, setIsExitModalOpen] = React.useState(false);
  const [isSubmittingExit, setIsSubmittingExit] = React.useState(false);

  const handleQuickAction = async (action) => {
    if (action === 'request_exit') {
      // 1. Check for active loans using dashboard stats
      const loanAmount = dashboardStats?.active_loans_total || 0;
      if (loanAmount > 0) {
        toast.error(`Unable to leave the Samuha. You have pending loan dues of Rs. ${loanAmount.toLocaleString()}.`, {
          duration: 5000,
          icon: '🛑',
          style: {
            borderRadius: '12px',
            background: '#333',
            color: '#fff',
          },
        });
        return;
      }
      setIsExitModalOpen(true);
      return;
    }
    originalHandleQuickAction(action);
  };

  const handleExitSubmit = async (reason) => {
    setIsSubmittingExit(true);
    try {
      await samuhaAPI.submitExitRequest(reason);
      toast.success('Your exit request has been submitted to the Adhakshya for review.', {
        icon: '🚪',
        style: { borderRadius: '12px' }
      });
      setIsExitModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to submit exit request.');
    } finally {
      setIsSubmittingExit(false);
    }
  };

  return (
    <MainLayout userRole={role} onLogout={onLogout} user={user} onNavigate={onNavigate} currentPath={currentPath}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, <span className="font-semibold text-gray-800">{userName}</span>. {welcomeMsg.split('. ')[1] || "Here is your overview."}</p>
      </div>

      <SummaryStats stats={stats} />
      <DashboardActions {...{ config, handleQuickAction, recentTransactions }} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
         <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <RecentTransactions transactions={recentTransactions} />
         </div>
         <div className="flex flex-col gap-8">
            <MeetingCard {...{ loading, nextMeeting, samuhaSettings, formatTime, subscription, user, onNavigate }} />
            {role === 'adhakshya' && !subscription?.is_premium && !loading && (
              <UpgradeCTA onUpgrade={() => onNavigate('/settings#subscription')} />
            )}
         </div>
      </div>

      <div className="mt-8"><NoticeBoard userRole={role} currentUserId={user?.id} /></div>

      <ExitRequestModal 
        isOpen={isExitModalOpen} 
        onClose={() => setIsExitModalOpen(false)} 
        onSubmit={handleExitSubmit}
        isSubmitting={isSubmittingExit}
      />
    </MainLayout>
  );
};
