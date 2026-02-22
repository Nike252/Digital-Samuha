import React from 'react';
import { History, Users, ChevronRight } from 'lucide-react';

const MeetingsSection = ({ meetings, viewReport }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meetings.map((meeting) => (
          <div key={meeting.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                <History size={24} />
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">
                {new Date(meeting.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>
            <h4 className="text-xl font-black text-gray-900 mb-2 truncate">{meeting.title}</h4>
            <p className="text-sm text-gray-500 font-medium mb-6 line-clamp-2">
              {meeting.description || "Official records and minutes for this session."}
            </p>
            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                <Users size={16} />
                <span>Attendance Logged</span>
              </div>
              <button 
                onClick={() => viewReport(meeting.id)}
                className="flex items-center gap-2 text-indigo-600 font-black text-sm hover:gap-3 transition-all"
              >
                View Report
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MeetingsSection;
