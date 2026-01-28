import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

const MeetingSidebar = ({ meetings, selectedMeeting, handleSelectMeeting, loading }) => {
  return (
    <div className="lg:col-span-1 space-y-4">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Recent Meetings</h3>
      <div className="space-y-2">
        {meetings.length === 0 && !loading && (
          <p className="text-gray-400 text-xs px-2 italic">No meetings recorded yet.</p>
        )}
        {meetings.map(m => (
          <button
            key={m.id}
            onClick={() => handleSelectMeeting(m)}
            className={`w-full text-left p-4 rounded-2xl border transition-all ${
              selectedMeeting?.id === m.id 
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
              : 'bg-white border-gray-100 text-gray-600 hover:border-indigo-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <CalendarIcon size={18} className={selectedMeeting?.id === m.id ? 'text-indigo-200' : 'text-indigo-600'} />
              <div>
                <div className="font-bold text-sm tracking-tight">{new Date(m.date).toLocaleDateString()}</div>
                <div className={`text-[10px] font-bold uppercase tracking-wider ${selectedMeeting?.id === m.id ? 'text-indigo-100' : 'text-gray-400'}`}>{m.title}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MeetingSidebar;
