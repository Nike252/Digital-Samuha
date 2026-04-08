import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import useSettings from './useSettings';
import SettingsSidebar from './SettingsSidebar';
import ProfileTab from './ProfileTab';
import RulesTab from './RulesTab';
import PremiumTab from './PremiumTab';
import SecurityTab from './SecurityTab';
import { subscriptionsAPI } from '../../utils/api';
import { useUI } from '../../context/UIContext';

const Settings = ({ user: initialUser, onLogout, onNavigate, currentPath }) => {
  const {
    user, activeTab, setActiveTab, isPremium, subscription, showTransactionHistory, 
    setShowTransactionHistory, loading, settingsLoading, errors, successMessage,
    profileData, passwordData, samuhaSettings, setSamuhaSettings, handleProfileChange,
    handlePasswordChange, handleSettingsChange, handleProfileUpdate,
    handlePasswordUpdate, handleSettingsUpdate, isAdhakshya, navigate
  } = useSettings(initialUser);

  const isSuperAdmin = user?.is_superuser;
  const userRole = isSuperAdmin ? 'super_admin' : (user?.role || 'member');
  const isDark = isSuperAdmin;
  const { showToast } = useUI();

  const handleEsewaUpgrade = async () => {
    try {
      const plansRes = await subscriptionsAPI.getAvailablePlans();
      const premiumPlan = plansRes.data.find(p => p.name === 'premium');
      if (!premiumPlan) throw new Error("Premium plan not found");

      const res = await subscriptionsAPI.initiateEsewa(premiumPlan.id);
      navigate(`/pay-direct/esewa/${user.samuha.id}`, { 
        state: { 
          amount: premiumPlan.price, 
          total_amount: res.data.total_amount, // Use the server-normalized amount
          type: 'UP', 
          signature: res.data.signature, 
          transaction_uuid: res.data.transaction_uuid 
        } 
      });
    } catch (err) { showToast("Failed to initiate upgrade. Please try again.", "error"); }
  };

  return (
    <MainLayout userRole={userRole} onLogout={onLogout} user={user} onNavigate={onNavigate} currentPath={currentPath} isDark={isDark}>
      <div className="max-w-6xl mx-auto py-4">
        <div className="mb-10">
          <h1 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Account Settings</h1>
          <p className={`mt-2 text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Manage your personal identity, organization rules and security preferences.</p>
        </div>

        {successMessage && (
          <div className="mb-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
            <CheckCircle2 size={20} className="text-emerald-500" />
            <span className="text-emerald-800 font-medium">{successMessage}</span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-10">
          <SettingsSidebar {...{ activeTab, setActiveTab, isAdhakshya, isDark }} />
          <main className="flex-1 min-w-0">
            {activeTab === 'profile' && <ProfileTab {...{ profileData, handleProfileChange, handleProfileUpdate, loading, isDark }} />}
            {activeTab === 'rules' && <RulesTab {...{ samuhaSettings, handleSettingsChange, handleSettingsUpdate, setSamuhaSettings, settingsLoading, loading }} />}
            {activeTab === 'premium' && <PremiumTab {...{ isPremium, subscription, loading, user, navigate, showTransactionHistory, setShowTransactionHistory, handleEsewaUpgrade }} />}
            {activeTab === 'security' && <SecurityTab {...{ user, passwordData, handlePasswordChange, handlePasswordUpdate, loading, isDark }} />}
          </main>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;