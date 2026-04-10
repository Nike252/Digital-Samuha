import React from 'react';
import { Calendar as CalendarIcon, UserCheck, Clock, X, Save, Plus, AlertCircle, Info, Trash2 } from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import { toBS } from '../../utils/nepaliDateUtils';
import useAttendance from './useAttendance_Snappy';
import MeetingSidebar from './MeetingSidebar';
import AttendanceTable from './AttendanceTable';
import CreateMeetingModal from './CreateMeetingModal';

const STATUS_OPTIONS = [
  { value: 'present', label: 'Present', color: 'text-emerald-600 bg-emerald-50', icon: UserCheck },
  { value: 'late', label: 'Late', color: 'text-amber-600 bg-amber-50', icon: Clock },
  { value: 'absent', label: 'Absent', color: 'text-red-600 bg-red-50', icon: X },
];

const Attendance = ({ user, onLogout }) => {
  const {
    meetings, selectedMeeting, handleSelectMeeting, attendance,
    loading, saving, showCreateModal, setShowCreateModal,
    samuhaRules, nextMeeting, newMeeting, setNewMeeting,
    handleStatusChange, handleFineChange, handleSaveAttendance,
    handleCreateMeeting, handleDeleteMeeting, hasUnsavedChanges
  } = useAttendance(user);

  const meetingDate = selectedMeeting ? new Date(selectedMeeting.date) : null;
  if (meetingDate) meetingDate.setHours(0,0,0,0);
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const isPastOrToday = meetingDate && meetingDate <= today;
  const isAdhakshya = user.role === 'adhakshya' || user.role === 'co_adhakshya';
  const isLatest = meetings.length > 0 && selectedMeeting?.id === meetings[0].id;
  const isLocked = !isLatest && meetings.length > 1;
  const canEdit = isPastOrToday && isAdhakshya && !isLocked;

  return (
    <MainLayout user={user} onLogout={onLogout} userRole={user.role}>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Meeting Attendance</h1>
          <p className="text-gray-500 mt-1">Record and manage member presence and fines.</p>
        </div>
        {isAdhakshya && (
          <button onClick={() => { setNewMeeting(prev => ({ ...prev, date: nextMeeting?.ad ? nextMeeting.ad.toISOString().split('T')[0] : new Date().toISOString().split('T')[0], start_time: samuhaRules?.default_meeting_time || '10:00' })); setShowCreateModal(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
            <Plus size={20} /> New Meeting
          </button>
        )}
      </div>

      {samuhaRules && (
        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-white rounded-xl shadow-sm"><CalendarIcon className="text-indigo-600" size={24} /></div>
          <div>
            <p className="text-sm font-bold text-indigo-900">Next Scheduled Meeting</p>
            <p className="text-indigo-600 font-medium">{nextMeeting ? `${samuhaRules.meeting_schedule_type === 'weekly' ? `Every ${samuhaRules.meeting_day}` : 'Custom Schedule'} • Next: ${nextMeeting.bs} (${nextMeeting.weekday})` : 'Loading schedule...'}</p>
          </div>
          <div className="ml-auto flex gap-4 text-xs font-bold uppercase tracking-wider text-indigo-400"><span>Absent Fine: NPR {samuhaRules.absent_fine}</span><span>Late Fine: NPR {samuhaRules.late_fine}</span></div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <MeetingSidebar {...{ meetings, selectedMeeting, handleSelectMeeting, loading }} />
        <div className="lg:col-span-3">
          {selectedMeeting ? (
            <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${isLocked ? 'border-indigo-100' : (!isPastOrToday && !isAdhakshya ? 'border-amber-100' : 'border-gray-100')}`}>
              {isLocked && <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-3 flex items-center gap-3 text-indigo-700"><Info size={18} /><span className="text-sm font-bold">This meeting is LOCKED because a newer meeting exists. Attendance cannot be modified retroactively.</span></div>}
              {hasUnsavedChanges && !isLocked && (
                <div className="bg-blue-600 px-6 py-2.5 flex items-center justify-between text-white animate-in slide-in-from-top duration-300">
                  <div className="flex items-center gap-3">
                    <Save size={16} className="animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-widest">Unsaved Changes Detected</span>
                  </div>
                  <span className="text-[10px] font-bold opacity-80">Please click "Save Record" to finalize fines and attendance.</span>
                </div>
              )}
              {!canEdit && !isLocked && <div className="bg-amber-50 border-b border-amber-100 px-6 py-3 flex items-center gap-3 text-amber-700"><AlertCircle size={18} /><span className="text-sm font-bold">{!isPastOrToday ? `Attendance will be enabled on ${toBS(selectedMeeting.date)} at ${selectedMeeting.start_time || '10:00'}.` : "Permission denied for this action."}</span></div>}
              <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                <div><div className="flex items-center gap-2"><h2 className="text-xl font-bold text-gray-900">{selectedMeeting.title}</h2><span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full uppercase tracking-tighter border border-indigo-100">ID: #{selectedMeeting.id}</span></div><p className="text-sm text-gray-500 font-medium">{toBS(selectedMeeting.date)}</p></div>
                <div className="flex items-center gap-3">
                  {isAdhakshya && (
                    <button onClick={() => handleDeleteMeeting(selectedMeeting.id)} className="flex items-center gap-2 px-4 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-all border border-transparent hover:border-rose-100" title="Delete Meeting">
                      <Trash2 size={18} /><span className="hidden md:inline">Delete Meeting</span>
                    </button>
                  )}
                  <button 
                    onClick={handleSaveAttendance} 
                    disabled={saving || !canEdit} 
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg ${
                      hasUnsavedChanges 
                        ? 'bg-indigo-600 text-white shadow-indigo-100 ring-4 ring-indigo-50 animate-pulse' 
                        : 'bg-emerald-600 text-white shadow-emerald-100'
                    }`}
                  >
                    <Save size={18} />
                    {saving ? 'Saving...' : (hasUnsavedChanges ? 'Save Changes' : 'Save Record')}
                  </button>
                </div>
              </div>
              {loading ? <div className="py-20 flex flex-col items-center justify-center gap-3"><div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full" /><p className="text-gray-400 font-medium">Loading attendance...</p></div> : <AttendanceTable {...{ attendance, STATUS_OPTIONS, canEdit, handleStatusChange, handleFineChange }} />}
            </div>
          ) : <div className="bg-white rounded-3xl border border-gray-100 shadow-sm py-32 flex flex-col items-center justify-center text-gray-400"><div className="p-6 bg-indigo-50 rounded-full mb-6"><CalendarIcon size={48} className="text-indigo-200" /></div><p className="text-xl font-bold text-gray-900 mb-2">Ready to start today's meeting?</p><p className="text-gray-400 text-center max-w-xs px-6">Select a previous meeting from the list or create a new one to record attendance.</p></div>}
        </div>
      </div>
      <CreateMeetingModal showCreateModal={showCreateModal} setShowCreateModal={setShowCreateModal} newMeeting={newMeeting} setNewMeeting={setNewMeeting} handleCreateMeeting={handleCreateMeeting} />
    </MainLayout>
  );
};

export default Attendance;
