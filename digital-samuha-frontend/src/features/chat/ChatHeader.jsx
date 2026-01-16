import React from 'react';
import { MessageCircle, Phone, Video } from 'lucide-react';

const ChatHeader = ({ samuhaName, onStartCall }) => {
  return (
    <div className="bg-white px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-100 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 sm:gap-5 min-w-0">
        <div className="relative shrink-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg transform rotate-3">
            <MessageCircle size={26} className="text-white -rotate-3 sm:scale-110" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
        </div>
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight truncate">{samuhaName || 'Group Hub'}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-1">
             <span className="text-[9px] sm:text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-bold uppercase tracking-wider shrink-0">Multimedia Active</span>
             <p className="text-[10px] sm:text-xs text-gray-400 truncate hidden sm:block">Team communication</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-all border border-slate-100">
          <Phone size={18} className="sm:scale-110" />
        </button>
        <button 
          onClick={() => onStartCall('broadcast')}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 group shadow-sm"
        >
          <Video size={18} className="group-hover:scale-110 transition-transform sm:scale-110" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
