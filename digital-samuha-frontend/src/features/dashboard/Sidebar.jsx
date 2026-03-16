import React from 'react';
import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';

import logo from '../../assets/Photos/ds_logo.png';

const Sidebar = ({ menuItems, onNavigate, currentPath, isDark, isOpen, onClose }) => {
  const bgClass = isDark ? 'bg-[#15181e] border-gray-800' : 'bg-white border-gray-200';
  const logoTextClass = isDark ? 'text-white' : 'text-gray-800';
  const itemBaseClass = isDark ? 'text-gray-400 hover:bg-[#1f232b] hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900';
  const itemActiveClass = isDark ? 'bg-indigo-500/10 text-indigo-400 font-medium shadow-sm' : 'bg-indigo-50 text-indigo-700 font-medium shadow-sm';
  const helpBgClass = isDark ? 'bg-[#1a1d23]' : 'bg-gray-50';
  const helpTitleClass = isDark ? 'text-gray-500' : 'text-gray-500';
  const helpTextClass = isDark ? 'text-gray-400' : 'text-gray-600';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" 
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`w-64 ${bgClass} border-r h-screen fixed left-0 top-0 flex flex-col font-sans transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-800/50' : 'border-gray-100'} flex items-center justify-between`}>
          <img src={logo} alt="Digital Samuha" className="h-12 object-contain" />
          {/* Mobile Close Button */}
          <button 
            onClick={onClose}
            className={`lg:hidden p-1.5 rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <X size={20} />
          </button>
        </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive ? itemActiveClass : itemBaseClass
              }`
            }
          >
            <item.icon size={20} className="group-hover:scale-110 transition-transform" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {!isDark && (
        <div className={`p-4 border-t ${isDark ? 'border-gray-800/50' : 'border-gray-100'}`}>
          <NavLink to="/ai-chat" className={`block ${helpBgClass} rounded-lg p-3 transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-900/20 group`}>
            <p className={`text-xs ${helpTitleClass} font-medium uppercase tracking-wider mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400`}>Help & Support</p>
            <p className={`text-sm ${helpTextClass} group-hover:text-gray-900 dark:group-hover:text-gray-200`}>Need help? Chat with our AI.</p>
          </NavLink>
        </div>
      )}
    </aside>
    </>
  );
};

export default Sidebar;
