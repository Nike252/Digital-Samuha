import React from 'react';
import { User, Shield, Settings as SettingsIcon, Zap } from 'lucide-react';

const SettingsSidebar = ({ activeTab, setActiveTab, isAdhakshya, isDark }) => {
  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: User, color: 'text-blue-500', bg: 'bg-blue-50' },
    ...(isAdhakshya ? [
        { id: 'rules', label: 'Samuha Rules', icon: SettingsIcon, color: 'text-purple-500', bg: 'bg-purple-50' },
        { id: 'premium', label: 'Premium Plan', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' }
    ] : []),
    { id: 'security', label: 'Security & Password', icon: Shield, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  ];

  return (
    <aside className="lg:w-72 flex-shrink-0">
      <nav className={`flex flex-row overflow-x-auto custom-scrollbar lg:flex-col gap-2 p-1 rounded-2xl border backdrop-blur-sm sticky top-6 ${
        isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50/50 border-gray-100/50'
      }`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center shrink-0 whitespace-nowrap gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
              activeTab === tab.id
                ? (isDark ? 'bg-white/10 text-indigo-400 shadow-lg border border-white/10' : 'bg-white text-indigo-600 shadow-sm border border-gray-100')
                : (isDark ? 'text-gray-400 hover:bg-white/5' : 'text-gray-500 hover:bg-white/60')
            }`}
          >
            <div className={`p-2 rounded-lg transition-transform duration-200 group-hover:scale-110 ${
              activeTab === tab.id 
                ? (isDark ? 'bg-indigo-500/20' : tab.bg) 
                : (isDark ? 'bg-white/5' : 'bg-gray-100')
            }`}>
              <tab.icon size={18} className={activeTab === tab.id ? (isDark ? 'text-indigo-400' : tab.color) : 'text-gray-400'} />
            </div>
            <span className={`font-semibold text-sm ${
              activeTab === tab.id 
                ? (isDark ? 'text-white' : 'text-gray-900') 
                : (isDark ? 'text-gray-500 group-hover:text-gray-300' : 'text-gray-500 group-hover:text-gray-700')
            }`}>
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-full" />
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default SettingsSidebar;
