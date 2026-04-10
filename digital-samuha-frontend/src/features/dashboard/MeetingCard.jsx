import React from 'react';
import { toBS } from '../../utils/nepaliDateUtils';

const MeetingCard = ({ 
  loading, 
  nextMeeting, 
  samuhaSettings, 
  formatTime, 
  subscription, 
  user, 
  onNavigate 
}) => {
  return (
    <div className="bg-indigo-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
      <div className="relative z-10">
          <h3 className="text-lg font-semibold mb-4 text-indigo-100">Upcoming Meeting</h3>
          {loading ? (
             <div className="animate-pulse bg-white/5 rounded-lg p-6 h-32 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
             </div>
          ) : nextMeeting ? (
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 mb-4 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-indigo-500 rounded-lg p-2"><span className="text-xl">📅</span></div>
                    <div><p className="font-bold text-lg">{nextMeeting.bs}</p><p className="text-indigo-200 text-sm">{nextMeeting.weekday}, {formatTime(samuhaSettings?.default_meeting_time)}</p></div>
                </div>
                <p className="text-sm text-indigo-100 mt-2 pl-12 border-l-2 border-indigo-400">{toBS(nextMeeting.ad)}</p>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center border border-white/10">
                <p className="text-indigo-200 text-sm italic">No upcoming meeting scheduled</p>
            </div>
          )}
          
          {subscription?.is_premium ? (() => {
              const isMeetingToday = nextMeeting && new Date(nextMeeting.ad).toDateString() === new Date().toDateString();
              return (
                  <button 
                      disabled={!isMeetingToday}
                      onClick={() => onNavigate(`/premium-meeting/samuha_${user.samuha?.id || user.samuha}`)}
                      className={`w-full py-3 font-bold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 ${isMeetingToday ? "bg-emerald-500 text-white hover:bg-emerald-400 shadow-emerald-900/20 active:scale-95" : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed grayscale"}`}
                  >
                      <span>{isMeetingToday ? "📹" : "🔒"}</span> {isMeetingToday ? "Enter Virtual Office" : "Locked (Upcoming)"}
                  </button>
              );
          })() : <button disabled={!nextMeeting} className="w-full py-3 bg-white text-indigo-600 font-bold rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50">View Agenda</button>}
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-900/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>
    </div>
  );
};

export default MeetingCard;
