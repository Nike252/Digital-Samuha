import React, { useState, useEffect } from 'react';
import Sidebar from '../features/dashboard/Sidebar';
import { ROLE_CONFIG } from '../config/dashboardConfig';
import { LogOut, User, Bell, Menu } from 'lucide-react';
import { ProfileMenu, NotificationMenu } from '../features/dashboard/HeaderDropdowns';
import { notificationsAPI } from '../utils/api';

const MainLayout = ({ userRole = 'member', children, onLogout, user, onNavigate, currentPath, isDark }) => {
  const config = ROLE_CONFIG[userRole] || ROLE_CONFIG.member;
  
  // Dropdown States
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const res = await notificationsAPI.getNotifications();
      const unread = res.data.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  // Sync count when notif menu closes (user might have read some)
  useEffect(() => {
    if (!isNotifOpen) {
      fetchUnreadCount();
    }
  }, [isNotifOpen]);

  // Get user name safely
  const userName = user?.full_name || user?.first_name || 'User Name';

  const containerClass = isDark ? 'bg-[#0f1115] text-gray-100' : 'bg-gray-50 text-gray-900';
  const headerClass = isDark ? 'bg-[#15181e] border-gray-800' : 'bg-white border-gray-200';
  const dividerClass = isDark ? 'bg-gray-800' : 'bg-gray-200';

  return (
    <div className={`min-h-screen ${containerClass} font-sans transition-colors duration-300`}>
      {/* Sidebar */}
      <Sidebar 
        menuItems={config.sidebarMenu} 
        onNavigate={onNavigate} 
        currentPath={currentPath} 
        isDark={isDark} 
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Wrapper */}
      <div className="ml-0 lg:ml-64 flex flex-col min-h-screen transition-all duration-300">
        
        {/* Topbar */}
        <header className={`h-16 ${headerClass} border-b sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between shadow-sm transition-colors duration-300`}>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className={`lg:hidden p-2 -ml-2 rounded-lg transition-colors ${
                isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold text-gray-700 hidden sm:block"></h2>
          </div>
          
          <div className="flex items-center gap-6">
             
             {/* Notification Bell */}
             <div className="relative">
                <button 
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className={`relative p-2 rounded-full transition-all duration-200 ${
                    isNotifOpen 
                      ? (isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600') 
                      : (isDark ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50')
                  }`}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white animate-in zoom-in-50 duration-300">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                <NotificationMenu isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} isDark={isDark} />
             </div>
             
             <div className={`h-8 w-px ${dividerClass}`}></div>

             {/* Profile Dropdown */}
             <div className="relative">
               <button 
                 onClick={() => setIsProfileOpen(!isProfileOpen)}
                 className={`flex items-center gap-3 p-1.5 pr-3 rounded-full transition-colors group focus:outline-none ${
                   isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                 }`}
               >
                 <div className="flex flex-col text-right hidden sm:flex">
                   <span className={`text-sm font-medium ${isDark ? 'text-gray-200 group-hover:text-indigo-400' : 'text-gray-900 group-hover:text-indigo-700'} transition-colors capitalize`}>{userName}</span>
                   <span className="text-xs text-gray-500 capitalize">{user?.samuha?.name || 'Digital Samuha'} ({userRole.replace('_', ' ')})</span>
                 </div>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border transition-all duration-200 ${
                   isProfileOpen 
                     ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105' 
                     : (isDark ? 'bg-indigo-900/30 text-indigo-400 border-indigo-500/30' : 'bg-indigo-100 text-indigo-700 border-indigo-200')
                 }`}>
                   <User size={20} />
                 </div>
               </button>
               
               <ProfileMenu 
                 isOpen={isProfileOpen} 
                 onClose={() => setIsProfileOpen(false)} 
                 userRole={userRole}
                 userName={userName}
                 samuhaName={user?.samuha?.name || 'Digital Samuha'}
                 onLogout={onLogout}
                 isDark={isDark}
               />
             </div>

          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;