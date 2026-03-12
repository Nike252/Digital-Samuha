import React from 'react';
import MainLayout from '../../layouts/MainLayout';
import RecentTransactions from './RecentTransactions';
import NoticeBoard from './NoticeBoard';
import useDashboard from './useDashboard';
import SummaryStats from './SummaryStats';
import DashboardActions from './DashboardActions';
import MeetingCard from './MeetingCard';
import UpgradeCTA from './UpgradeCTA';

export const Dashboard = ({ role, user, onLogout, onNavigate, currentPath }) => {
  const {
    nextMeeting, samuhaSettings, recentTransactions,
    subscription, loading, config, userName, welcomeMsg,
    formatTime, stats, handleQuickAction
  } = useDashboard(role, user, onNavigate);

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
    </MainLayout>
  );
};
