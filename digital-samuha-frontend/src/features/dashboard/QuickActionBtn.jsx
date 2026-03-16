import React from 'react';
import * as LucideIcons from 'lucide-react';

const QuickActionBtn = ({ label, onClick, icon }) => {
  // Dynamically get icon component
  const IconComponent = icon && LucideIcons[icon] ? LucideIcons[icon] : null;

  return (
    <button 
      onClick={onClick}
      className="group relative overflow-hidden flex items-center gap-3 px-6 py-4 bg-white border border-gray-100/50 text-gray-700 font-medium rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full sm:w-auto"
    >
      {/* Background Gradient on Hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative flex items-center gap-3">
        {IconComponent && (
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-sm">
            <IconComponent size={20} strokeWidth={2.5} />
          </div>
        )}
        <span className="text-base tracking-tight font-semibold text-gray-700 group-hover:text-indigo-900 duration-300">{label}</span>
      </div>
    </button>
  );
};

export default QuickActionBtn;
