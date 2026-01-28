import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { attendanceAPI, samuhaAPI, ledgerAPI } from '../../utils/api';
import { getNextMeetingDate } from '../../utils/nepaliDateUtils';

const useAttendance = (user) => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [meetingTransactions, setMeetingTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const [meetingsRes, rulesRes] = await Promise.all([
        attendanceAPI.getMeetings(),
        samuhaAPI.getSettings().catch(() => ({ data: null }))
      ]);
      
      setMeetings(meetingsRes.data);
      if (rulesRes.data) {
        setSamuhaRules(rulesRes.data);
        const next = getNextMeetingDate(rulesRes.data);
        setNextMeeting(next);
      }
      
      if (meetingsRes.data.length > 0 && !selectedMeeting) {
        handleSelectMeeting(meetingsRes.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSelectMeeting = async (meeting) => {
    setSelectedMeeting(meeting);
    setLoading(true);
    try {
      const [attRes, txRes] = await Promise.all([
        attendanceAPI.getAttendance(meeting.id),
        ledgerAPI.getTransactions({ meeting: meeting.id })
      ]);
      setAttendance(attRes.data);
      setMeetingTransactions(txRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (recordId, status) => {
    if (status === 'absent') {
      const record = attendance.find(r => r.id === recordId);
      const userId = record?.user;
      const conflictingTx = meetingTransactions.find(tx => tx.user_id === userId && tx.type === 'saving');
      
      if (conflictingTx) {
        const confirmNav = window.confirm(
          "Cannot mark member as ABSENT because they have already paid their savings for this meeting.\n\n" +
          "Click OK to navigate to the Financials page and see the transaction that needs to be deleted."
        );
        
        if (confirmNav) {
          navigate('/ledger', { state: { highlightTransactionId: conflictingTx.id } });
        }
        return;
      }
    }

    setAttendance(prev => prev.map(rec => {
      if (rec.id === recordId) {
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

  const handleFineChange = (recordId, amount) => {
    setAttendance(prev => prev.map(rec => 
      rec.id === recordId ? { ...rec, fine_amount: amount } : rec
    ));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      await attendanceAPI.saveAttendance(selectedMeeting.id, attendance);
      alert('Attendance saved successfully!');
    } catch (err) {
      let errorMessage = err.message;
      try {
        const parsed = JSON.parse(err.message);
        errorMessage = parsed.detail || err.message;
      } catch (e) { }
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    try {
      const res = await attendanceAPI.createMeeting(newMeeting);
      setMeetings([res.data, ...meetings]);
      setShowCreateModal(false);
      handleSelectMeeting(res.data);
    } catch (err) {
      let errorMessage = err.message;
      try {
        const parsed = JSON.parse(err.message);
        errorMessage = parsed.detail || err.message;
      } catch (e) { }
      alert(errorMessage);
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!window.confirm('Are you sure you want to delete this meeting? This will also remove all attendance records for it. This cannot be undone.')) return;
    
    try {
      await attendanceAPI.deleteMeeting(meetingId);
      alert('Meeting deleted successfully');
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
      alert(errorMessage);
    }
  };

  return {
    meetings, selectedMeeting, handleSelectMeeting, attendance,
    loading, saving, showCreateModal, setShowCreateModal,
    samuhaRules, nextMeeting, newMeeting, setNewMeeting,
    handleStatusChange, handleFineChange, handleSaveAttendance,
    handleCreateMeeting, handleDeleteMeeting
  };
};

export default useAttendance;
