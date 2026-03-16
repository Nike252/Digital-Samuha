import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { samuhaAPI, notificationsAPI } from '../../utils/api';
import { 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  MessageSquare, 
  Info, 
  CreditCard, 
  X, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Video 
} from 'lucide-react';

// --- Reusable Glass Dropdown Wrapper ---
const GlassDropdown = ({ isOpen, onClose, children, className = "", isDark }) => {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      <div className={`fixed left-4 right-4 top-16 sm:left-auto sm:right-0 sm:absolute sm:top-12 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top sm:origin-top-right ${className}`}>
        <div className={`rounded-[2rem] border shadow-2xl backdrop-blur-xl ${
          isDark 
            ? 'bg-slate-900/90 border-slate-800 shadow-slate-950/50' 
            : 'bg-white/95 border-gray-100 shadow-gray-200/50'
        }`}>
          {children}
        </div>
      </div>
    </>
  );
};

// --- Notification Menu ---
export const NotificationMenu = ({ isOpen, onClose, isDark }) => {
  const [notifications, setNotifications] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationsAPI.getNotifications();
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  const handleNotifClick = async (notif) => {
    if (!notif.is_read) {
       try {
         await notificationsAPI.markAsRead(notif.id);
         setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
       } catch (err) {
         console.error("Failed to mark as read:", err);
       }
    }
    if (notif.link) {
      window.location.hash = `#${notif.link}`;
      onClose();
    }
  };

  return (
    <GlassDropdown isOpen={isOpen} onClose={onClose} className="sm:w-80" isDark={isDark}>
      <div className={`p-5 flex items-center justify-between border-b ${isDark ? 'border-indigo-500/10' : 'border-gray-50'}`}>
        <div>
          <h3 className={`font-black text-[10px] uppercase tracking-[0.2em] ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Notifications</h3>
          <p className={`text-[9px] mt-0.5 font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Stay updated with your Samuha</p>
        </div>
        {notifications.some(n => !n.is_read) && (
          <button 
            onClick={markAllRead} 
            className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all active:scale-95 ${
              isDark ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            Clear All
          </button>
        )}
      </div>

      <div className="max-h-[26rem] overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-16 text-center">
            <div className={`w-10 h-10 border-[3px] border-t-transparent rounded-full animate-spin mx-auto ${isDark ? 'border-indigo-500' : 'border-indigo-600'}`} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center mb-5 ${isDark ? 'bg-slate-800/50 text-slate-700' : 'bg-gray-50 text-gray-200'}`}>
              <Bell size={28} />
            </div>
            <p className={`text-xs font-black tracking-tight ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No New Alerts</p>
            <p className={`text-[10px] mt-2 font-medium leading-relaxed max-w-[12rem] mx-auto ${isDark ? 'text-gray-700' : 'text-gray-400'}`}>
              Your digital office is perfectly quiet right now.
            </p>
          </div>
        ) : (
          <div className="py-2">
            {notifications
              .filter(notif => notif.type !== 'video')
              .map((notif) => (
              <button 
                key={notif.id}
                onClick={() => handleNotifClick(notif)}
                className={`w-full p-4 flex gap-4 text-left transition-all relative border-l-4 ${
                  !notif.is_read 
                    ? (isDark ? 'bg-indigo-500/5 border-indigo-500' : 'bg-indigo-50/50 border-indigo-600') 
                    : (isDark ? 'border-transparent hover:bg-white/5' : 'border-transparent hover:bg-slate-50/50')
                }`}
              >
                <div className={`w-11 h-11 rounded-2xl shrink-0 flex items-center justify-center shadow-sm relative ${
                   notif.type === 'loan' ? (isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600') :
                   notif.type === 'meeting' ? (isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600') :
                   (isDark ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500')
                }`}>
                   {!notif.is_read && (
                     <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
                   )}
                   {notif.type === 'loan' ? <CreditCard size={20} /> : 
                    notif.type === 'meeting' ? <Clock size={20} /> : 
                    <Info size={20} />}
                </div>
                <div className="min-w-0">
                  <p className={`text-[13px] font-black truncate leading-tight ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{notif.title}</p>
                  <p className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{notif.message}</p>
                  <div className="flex items-center gap-2 mt-2.5">
                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400/60">{new Date(notif.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400/60">{new Date(notif.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className={`p-4 border-t ${isDark ? 'border-indigo-500/10' : 'border-gray-50'}`}>
        <button className={`text-[10px] uppercase tracking-[0.2em] font-black w-full py-3 rounded-2xl transition-all border ${
          isDark ? 'text-gray-500 border-indigo-500/10 hover:bg-indigo-500/5' : 'text-gray-400 border-gray-100 hover:bg-gray-50'
        }`}>
          Older Notifications
        </button>
      </div>
    </GlassDropdown>
  );
};

// --- Profile Menu ---
export const ProfileMenu = ({ isOpen, onClose, userRole, userName, samuhaName, onLogout, isDark }) => {
  const navigate = useNavigate();
  const handleEditProfile = () => {
    navigate('/settings');
    onClose();
  };

  return (
    <GlassDropdown isOpen={isOpen} onClose={onClose} className="sm:w-80" isDark={isDark}>
      {/* Premium Header Profile Card */}
      <div className="relative overflow-hidden">
        {/* Background Decorative Gradient */}
        <div className={`absolute inset-0 opacity-20 transition-all ${
          isDark 
            ? 'bg-gradient-to-br from-indigo-500 via-fuchsia-600 to-indigo-800' 
            : 'bg-gradient-to-br from-indigo-600/10 via-amber-500/10 to-emerald-500/10'
        }`} />
        
        <div className="relative p-6 flex flex-col items-center">
          {/* Avatar Section */}
          <div className="relative mb-4 group">
            <div className={`absolute -inset-1 rounded-[2rem] opacity-75 blur-sm transition duration-500 group-hover:opacity-100 ${
              isDark ? 'bg-indigo-500' : 'bg-indigo-300'
            }`} />
            <div className={`relative w-20 h-20 rounded-[1.8rem] flex items-center justify-center border-2 border-white shadow-xl ${
              isDark ? 'bg-slate-900 text-indigo-400' : 'bg-white text-indigo-600'
            }`}>
              <User size={40} strokeWidth={1.5} />
            </div>
          </div>

          <div className="text-center space-y-1">
            <h3 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {userName}
            </h3>
            <div className="flex flex-col items-center gap-2">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border ${
                isDark 
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' 
                  : 'bg-white text-indigo-600 border-indigo-50'
              }`}>
                {samuhaName || 'Personal Workspace'}
              </span>
              <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                isDark 
                  ? 'bg-slate-800 text-gray-500 border-gray-700 hover:border-gray-600' 
                  : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-gray-200'
              }`}>
                {(userRole || 'Member').replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Links */}
      <div className={`p-3 space-y-1 bg-gradient-to-b ${isDark ? 'from-white/0 to-white/5' : 'from-gray-50/50 to-white'}`}>
        <button 
          onClick={handleEditProfile} 
          className={`w-full group flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
            isDark 
              ? 'text-gray-400 hover:bg-white/5 hover:text-white' 
              : 'text-gray-600 hover:bg-indigo-50/50 hover:text-indigo-700'
          }`}
        >
          <div className={`p-2 rounded-xl transition-all ${
            isDark ? 'bg-slate-800 text-gray-500 group-hover:text-indigo-400' : 'bg-white shadow-sm text-gray-400 group-hover:text-indigo-600'
          }`}>
            <Settings size={18} />
          </div>
          <span>Account Settings</span>
        </button>
        
        <div className={`h-px mx-4 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
        
        <button 
          onClick={onLogout} 
          className={`w-full group flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
            isDark 
              ? 'text-rose-500/70 hover:bg-rose-500/10 hover:text-rose-400' 
              : 'text-rose-600 hover:bg-rose-50 hover:text-rose-700'
          }`}
        >
          <div className={`p-2 rounded-xl transition-all ${
            isDark ? 'bg-rose-500/10 text-rose-500/70 group-hover:text-rose-400' : 'bg-white shadow-sm text-rose-400 group-hover:text-rose-600'
          }`}>
            <LogOut size={18} />
          </div>
          <span>Sign Out</span>
        </button>
      </div>

      <div className={`p-3 border-t ${isDark ? 'border-indigo-500/10' : 'border-gray-50'} text-center`}>
        <p className={`text-[8px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>
          Digital Samuha Core v2.4
        </p>
      </div>
    </GlassDropdown>
  );
};
