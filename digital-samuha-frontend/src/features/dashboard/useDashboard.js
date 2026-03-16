import { useState, useEffect } from 'react';
import { samuhaAPI, ledgerAPI, subscriptionsAPI } from '../../utils/api';
import { getNextMeetingDate } from '../../utils/nepaliDateUtils';
import { ROLE_CONFIG } from '../../config/dashboardConfig';

const useDashboard = (role, user, onNavigate) => {
  const [nextMeeting, setNextMeeting] = useState(null);
  const [samuhaSettings, setSamuhaSettings] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  const config = ROLE_CONFIG[role] || ROLE_CONFIG.member;
  const userName = user?.full_name || user?.first_name || 'User';
  const welcomeMsg = config?.welcomeMsg?.replace(/Adhakshya|Co-Adhakshya|Member/i, userName) || '';

  const formatTime = (timeStr) => {
    if (!timeStr) return "10:00 AM";
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [settingsRes, statsRes, txRes, subRes] = await Promise.all([
            samuhaAPI.getSettings().catch(() => ({ data: null })), 
            ledgerAPI.getStats().catch(() => ({ data: null })),
            ledgerAPI.getTransactions().catch(() => ({ data: [] })),
            subscriptionsAPI.getCurrentSubscription().catch(() => ({ data: null }))
        ]);

        if (settingsRes.data) {
            setSamuhaSettings(settingsRes.data);
            const next = getNextMeetingDate(settingsRes.data);
            setNextMeeting(next);
        }

        if (statsRes.data) setDashboardStats(statsRes.data);
        if (txRes.data) setRecentTransactions(txRes.data);
        if (subRes.data) setSubscription(subRes.data);

      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = config?.stats.map(stat => {
    if (stat.label === 'Next Meeting') {
       return { ...stat, value: nextMeeting ? nextMeeting.bs : 'Not Scheduled' };
    }
    if (dashboardStats) {
        if (stat.label === 'Total Savings') return { ...stat, value: `Rs. ${dashboardStats.my_savings?.toLocaleString() || '0'}` };
        if (stat.label === 'Active Loan') return { ...stat, value: `Rs. ${dashboardStats.active_loans_total?.toLocaleString() || '0'}` };
        if (stat.label === 'Total Members') return { ...stat, value: dashboardStats.total_members?.toString() || '0' };
        if (stat.label === 'Pending Samuhas') return { ...stat, value: '0' };
        if (stat.label === 'Active Samuhas') return { ...stat, value: '0' };
    }
    return stat;
  });

  const handleQuickAction = (action) => {
    switch (action) {
      case 'create_meeting':
      case 'record_meeting': onNavigate('/attendance'); break;
      case 'add_saving': onNavigate('/ledger', { state: { activeTab: 'savings' } }); break;
      case 'approve_loan': onNavigate('/ledger', { state: { activeTab: 'loans' } }); break;
      case 'members': onNavigate('/members'); break;
      default: console.log(`Action trigger: ${action}`);
    }
  };

  return {
    nextMeeting, samuhaSettings, dashboardStats, recentTransactions,
    subscription, loading, config, userName, welcomeMsg,
    formatTime, stats, handleQuickAction
  };
};

export default useDashboard;
