import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { attendanceAPI, samuhaAPI, ledgerAPI } from '../../utils/api';
import { getNextMeetingDate } from '../../utils/nepaliDateUtils';
import { useUI } from '../../context/UIContext';

const useAttendance = (user) => {
  const navigate = useNavigate();
  const { showToast, showConfirm } = useUI();
  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [meetingTransactions, setMeetingTransactions] = useState([]);
  const [loading, setLoading] = useState(true); // Initial load
  const [refreshing, setRefreshing] = useState(false); // Background refresh
  const [saving, setSaving] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [samuhaRules, setSamuhaRules] = useState(null);
  const [nextMeeting, setNextMeeting] = useState(null);
  const [newMeeting, setNewMeeting] = useState({
    date: new Date().toISOString().split('T')[0],
    start_time: '10:00',
    title: 'Monthly Meeting',
    description: ''
  });

  const [initialAttendance, setInitialAttendance] = useState([]);

  const fetchData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setRefreshing(true);

      const [meetingsRes, rulesRes, statsRes] = await Promise.all([
        attendanceAPI.getMeetings(),
        samuhaAPI.getSettings().catch(() => ({ data: null })),
        ledgerAPI.getStats().catch(() => ({ data: { last_reset_date: null } }))
      ]);
      
      const lastResetDate = statsRes.data?.last_reset_date ? new Date(statsRes.data.last_reset_date) : null;
      const filteredMeetings = lastResetDate 
        ? meetingsRes.data.filter(m => new Date(m.date) > lastResetDate)
        : meetingsRes.data;

      setMeetings(filteredMeetings);
      if (rulesRes.data) {
        setSamuhaRules(rulesRes.data);
        const next = getNextMeetingDate(rulesRes.data);
        setNextMeeting(next);
      }
      
      if (filteredMeetings.length > 0 && !selectedMeeting) {
        handleSelectMeeting(filteredMeetings[0], isInitial);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedMeeting]);

  useEffect(() => { fetchData(true); }, []);

  const handleSelectMeeting = useCallback(async (meeting, isInitial = false) => {
    setSelectedMeeting(meeting);
    if (isInitial) setLoading(true);
    else setRefreshing(true);

    try {
      const [attRes, txRes] = await Promise.all([
        attendanceAPI.getAttendance(meeting.id),
        ledgerAPI.getTransactions({ meeting: meeting.id })
      ]);
      setAttendance(attRes.data);
      setInitialAttendance(JSON.parse(JSON.stringify(attRes.data))); // Deep copy for comparison
      setMeetingTransactions(txRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const hasUnsavedChanges = JSON.stringify(attendance) !== JSON.stringify(initialAttendance);

  const handleStatusChange = (recordId, status, userId) => {
    if (status === 'absent') {
      const record = attendance.find(r => recordId ? r.id === recordId : r.user === userId);
      const effectiveUserId = userId || record?.user;
      const conflictingTx = meetingTransactions.find(tx => tx.user_id === effectiveUserId && tx.type === 'saving');
      
      if (conflictingTx) {
        showConfirm({
          title: 'Cannot Mark Absent',
          message: 'This member has already paid their savings for this meeting.\n\nDo you want to go to the Financials page to delete the transaction?',
          confirmText: 'Go to Financials',
          type: 'warning',
          onConfirm: () => {
            navigate('/ledger', { state: { highlightTransactionId: conflictingTx.id } });
          }
        });
        return;
      }
    }

    setAttendance(prev => prev.map(rec => {
      const isMatch = recordId ? rec.id === recordId : rec.user === userId;
      if (isMatch) {
        let fine = 0;
        const absentFine = samuhaRules?.absent_fine || 100;
        const lateFine = samuhaRules?.late_fine || 50;

        if (status === 'absent') fine = absentFine;
        else if (status === 'late') fine = lateFine;
        
        return { ...rec, status, fine_amount: fine };
      }
      return rec;
    }));
  };

  const handleFineChange = (recordId, amount, userId) => {
    setAttendance(prev => prev.map(rec => {
      const isMatch = recordId ? rec.id === recordId : rec.user === userId;
      return isMatch ? { ...rec, fine_amount: amount } : rec;
    }));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      await attendanceAPI.saveAttendance(selectedMeeting.id, attendance);
      showToast('Attendance saved successfully!', 'success');
      handleSelectMeeting(selectedMeeting, false);
    } catch (err) {
      let errorMessage = err.message;
      try {
        const parsed = JSON.parse(err.message);
        errorMessage = parsed.detail || err.message;
      } catch (e) { }
      showToast(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await attendanceAPI.createMeeting(newMeeting);
      setMeetings([res.data, ...meetings]);
      setShowCreateModal(false);
      handleSelectMeeting(res.data, false);
    } catch (err) {
      let errorMessage = err.message;
      try {
        const parsed = JSON.parse(err.message);
        errorMessage = parsed.detail || err.message;
      } catch (e) { }
      showToast(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    showConfirm({
      title: 'Delete Meeting',
      message: 'Are you sure you want to delete this meeting? This will also remove all attendance records for it. This cannot be undone.',
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: async () => {
        try {
          setRefreshing(true);
          await attendanceAPI.deleteMeeting(meetingId);
          showToast('Meeting deleted successfully', 'success');
          const updatedMeetings = meetings.filter(m => m.id !== meetingId);
          setMeetings(updatedMeetings);
          if (selectedMeeting?.id === meetingId) {
            setSelectedMeeting(updatedMeetings.length > 0 ? updatedMeetings[0] : null);
          }
        } catch (err) {
          let errorMessage = err.message;
          try {
            const parsed = JSON.parse(err.message);
            errorMessage = parsed.detail || err.message;
          } catch (e) { }
          showToast(errorMessage, 'error');
        } finally {
          setRefreshing(false);
        }
      }
    });
  };

  return {
    meetings, selectedMeeting, handleSelectMeeting, attendance,
    loading, refreshing, saving, showCreateModal, setShowCreateModal,
    samuhaRules, nextMeeting, newMeeting, setNewMeeting,
    handleStatusChange, handleFineChange, handleSaveAttendance,
    handleCreateMeeting, handleDeleteMeeting, hasUnsavedChanges
  };
};

export default useAttendance;
