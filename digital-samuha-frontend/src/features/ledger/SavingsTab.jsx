import React from 'react';
import { Calendar, Info, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toBS } from '../../utils/nepaliDateUtils';

const SavingsTab = ({
  meetings,
  selectedMeetingId,
  setSelectedMeetingId,
  setSavingBatch,
  savingBatch,
  isAdhakshya,
  handleBatchSaving,
  meetingAttendance,
  prevMeetingAttendance,
  members,
  transactions,
  samuhaSettings
}) => {
  const selectedMeeting = meetings.find(m => m.id === parseInt(selectedMeetingId));
  const mDate = selectedMeeting ? new Date(selectedMeeting.date) : null;
  if (mDate) mDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isFuture = mDate && mDate > today;
  const hasAttendance = meetingAttendance.length > 0;
  const isLatest = meetings.length > 0 && selectedMeeting?.id === meetings[0].id;
  const isLocked = !isLatest && meetings.length > 1;

  const formatDate = (dateStr) => {
    return toBS(dateStr, 'monthDay');
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Monthly Savings Manager</h3>
          <p className="text-sm text-gray-500 mt-1">Record saving contributions aligned with meetings.</p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-center w-full md:w-auto">
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100 w-full sm:w-auto overflow-hidden">
            <Calendar size={18} className="text-gray-400 ml-2 shrink-0" />
            <select
              value={selectedMeetingId}
              onChange={(e) => {
                setSelectedMeetingId(e.target.value);
                setSavingBatch(prev => ({ ...prev, meeting_id: e.target.value, savings: [] }));
              }}
              className="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 outline-none pr-8 w-full truncate"
            >
              <option value="">Select Meeting</option>
              {meetings.map((m) => (
                <option key={m.id} value={m.id}>
                  {toBS(m.date)} - {m.title.replace(/\s*-\s*[A-Za-z]+\s+\d{4}$/, '')}
                </option>
              ))}
            </select>
          </div>

          {isAdhakshya && (
            <button
              onClick={handleBatchSaving}
              disabled={savingBatch.savings.length === 0}
              className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:shadow-none"
            >
              Confirm Payments ({savingBatch.savings.length})
            </button>
          )}
        </div>
      </div>

      {isLocked && (
        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-3 text-indigo-700">
          <Info size={20} />
          <p className="text-sm font-bold">
            This meeting is LOCKED. Payments for missed meetings must be handled in the current meeting using the "Smart Savings" breakdown.
          </p>
        </div>
      )}

      {isFuture && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3 text-amber-700">
          <Clock size={20} className="animate-pulse" />
          <p className="text-sm font-bold">
            Savings for this meeting will unlock on {toBS(selectedMeeting.date)} at {selectedMeeting.start_time}.
          </p>
        </div>
      )}

      {!hasAttendance && selectedMeetingId && (
        <div className="mb-6 p-6 bg-rose-50 border border-rose-100 rounded-2xl text-center">
          <AlertCircle size={40} className="text-rose-400 mx-auto mb-3" />
          <h4 className="font-bold text-rose-900">Attendance Required</h4>
          <p className="text-sm text-rose-600 mt-1 max-w-md mx-auto">
            You must record attendance for this meeting before you can collect savings.
            This helps the system calculate fines automatically.
          </p>
          <button
            onClick={() => window.location.href = '/attendance'}
            className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-bold hover:bg-rose-700 transition-all"
          >
            Go to Attendance
          </button>
        </div>
      )}

      <div className="space-y-3">
        {members.filter(m => m.status === 'active').map(member => {
          const userId = member.id; // Backend 'id' in member list IS the user.id
          if (!userId) return null; // Safety check

          const fullName = member.full_name || 'Unknown Member';
          const phone = member.phone || 'No phone';

          const hasPaid = transactions.some(tx =>
            tx.user_id === userId &&
            tx.type === 'saving' &&
            tx.meeting === parseInt(selectedMeetingId)
          );

          const attRecord = meetingAttendance.find(a => a.user === userId);
          const isAbsent = attRecord?.status === 'absent';
          const isLate = attRecord?.status === 'late';
          
          if (isAbsent) return null;

          const baseSaving = Number(samuhaSettings?.saving_amount || 500);
          const lateFineAmt = Number(samuhaSettings?.late_fine || 50);
          const absentFineAmt = Number(samuhaSettings?.absent_fine || 100);

          const lateFine = isLate ? lateFineAmt : 0;
          const absentFine = isAbsent ? absentFineAmt : 0;
          const wasPrevAbsent = prevMeetingAttendance.find(a => a.user === userId)?.status === 'absent';
          const prevAbsentFine = wasPrevAbsent ? absentFineAmt : 0;
          const missedSaving = wasPrevAbsent ? baseSaving : 0;
          const totalAmount = baseSaving + missedSaving + lateFine + absentFine + prevAbsentFine;

          const isSelected = savingBatch.savings.some(s => s.user_id === userId);

          const toggleSelection = () => {
            if (!isAdhakshya || hasPaid || isLocked || meetingAttendance.length === 0) return;

            if (isSelected) {
              setSavingBatch(prev => ({
                ...prev,
                savings: prev.savings.filter(s => s.user_id !== userId)
              }));
            } else {
              const currentMDate = formatDate(selectedMeeting.date);
              let descSaving = `Monthly Saving (${currentMDate})`;

              if (wasPrevAbsent) {
                const currentIndex = meetings.findIndex(m => m.id === parseInt(selectedMeetingId));
                const prevMeeting = currentIndex !== -1 ? meetings[currentIndex + 1] : null;
                if (prevMeeting) {
                  descSaving += ` + Missed (${formatDate(prevMeeting.date)})`;
                } else {
                  descSaving += " + Missed Last Month";
                }
              }

              let fineDesc = [];
              if (lateFine > 0) fineDesc.push(`Late Fine (+${lateFine})`);
              if (absentFine > 0) fineDesc.push(`Absent Fine (+${absentFine})`);
              if (prevAbsentFine > 0) fineDesc.push(`Prev Absent Fine (+${prevAbsentFine})`);

              setSavingBatch(prev => ({
                ...prev,
                savings: [...prev.savings, {
                  user_id: userId,
                  saving_amount: baseSaving + missedSaving,
                  fine_amount: lateFine + absentFine + prevAbsentFine,
                  saving_description: descSaving,
                  fine_description: fineDesc.join(' | ') || null
                }]
              }));
            }
          };

          return (
            <div
              key={member.membership_id || member.id}
              onClick={toggleSelection}
              className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                hasPaid
                  ? 'border-emerald-100 bg-emerald-50/50 opacity-60 grayscale-[0.5]'
                  : isLocked
                    ? 'border-gray-100 bg-gray-50/50 opacity-60 cursor-not-allowed'
                    : isSelected
                      ? 'border-indigo-500 bg-indigo-50/50 shadow-md'
                      : 'border-gray-50 bg-white hover:border-gray-200 cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold uppercase ${
                  hasPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {fullName[0]}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{fullName}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    {isLate && (
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-black uppercase rounded">Late</span>
                    )}
                    {isAbsent && (
                      <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 text-[9px] font-black uppercase rounded text-xs">Absent</span>
                    )}
                    {wasPrevAbsent && (
                      <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 text-[9px] font-black uppercase rounded">Prev Absent (+{Number(samuhaSettings?.absent_fine || 100)})</span>
                    )}
                    <span className="text-[10px] text-gray-400 font-medium">{phone}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className={`text-sm font-black ${hasPaid ? 'text-emerald-600' : 'text-gray-900'}`}>
                    NPR {totalAmount}
                  </div>
                  <div className="text-[10px] text-gray-400 font-medium">
                    {baseSaving} {missedSaving > 0 ? `+ ${missedSaving}` : ''} {lateFine > 0 ? `+ ${lateFine}` : ''} {absentFine > 0 ? `+ ${absentFine}` : ''} {prevAbsentFine > 0 ? `+ ${prevAbsentFine}` : ''}
                  </div>
                </div>

                {hasPaid ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                    <CheckCircle2 size={16} />
                  </div>
                ) : (
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-100 bg-gray-50'
                  }`}>
                    {isSelected && <CheckCircle2 size={16} />}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {members.length > 0 && meetingAttendance.length > 0 && members.filter(m => m.status === 'active').every(m => meetingAttendance.find(a => a.user === (m.user?.id || m.id))?.status === 'absent') && (
          <div className="py-12 text-center text-gray-400">
            <p className="text-sm font-medium">No members present for this meeting.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavingsTab;
