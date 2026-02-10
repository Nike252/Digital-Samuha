import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

const BotHeader = ({ samuhaName }) => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-t-3xl shadow-sm border-b border-gray-100 mb-4 flex flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0 relative">
          <Bot size={24} className="text-white" />
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center">
            <Sparkles size={8} className="text-white" />
          </div>
        </div>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight truncate">Samuha Bot</h1>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full animate-pulse shrink-0"></div>
            <p className="text-gray-400 text-[10px] sm:text-xs truncate">Knowledge Base: {samuhaName || 'Group'} Data</p>
          </div>
        </div>
      </div>
      <div className="bg-indigo-50 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full border border-indigo-100 shrink-0 whitespace-nowrap">
        <span className="text-[9px] sm:text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Premium Access</span>
      </div>
    </div>
  );
};

export default BotHeader;
