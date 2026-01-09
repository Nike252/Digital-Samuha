import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ledgerAPI, samuhaAPI, attendanceAPI, subscriptionsAPI } from '../../utils/api';

const useLedger = (user) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total_fund: 0, my_savings: 0, active_loans_amount: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loanPredictions, setLoanPredictions] = useState({});
  const [predictingId, setPredictingId] = useState(null);
  const [members, setMembers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState('');
  const [meetingAttendance, setMeetingAttendance] = useState([]);
  const [prevMeetingAttendance, setPrevMeetingAttendance] = useState([]);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [savingBatch, setSavingBatch] = useState({ savings: [], meeting_id: '' });
  const [highlightedTxId, setHighlightedTxId] = useState(null);
  const [repayModalOpen, setRepayModalOpen] = useState(false);
  const [selectedLoanForRepay, setSelectedLoanForRepay] = useState(null);
  const [samuhaSettings, setSamuhaSettings] = useState(null);

  const location = useLocation();
  const txRefs = useRef({});
  const isAdhakshya = user.role === 'adhakshya' || user.role === 'co_adhakshya';

  const fetchAttendance = async (currentMeetingId, allMeetings) => {
    try {
      const attRes = await attendanceAPI.getAttendance(currentMeetingId);
      setMeetingAttendance(attRes.data);
      const currentIndex = allMeetings.findIndex(m => m.id === parseInt(currentMeetingId));
      if (currentIndex !== -1 && currentIndex < allMeetings.length - 1) {
        const prevMeeting = allMeetings[currentIndex + 1];
        const prevAttRes = await attendanceAPI.getAttendance(prevMeeting.id);
        setPrevMeetingAttendance(prevAttRes.data);
      } else {
        setPrevMeetingAttendance([]);
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, txRes, loansRes, membersRes, meetingsRes, subRes, settingsRes] = await Promise.all([
        ledgerAPI.getStats(),
        ledgerAPI.getTransactions(),
        ledgerAPI.getLoans(),
        samuhaAPI.getMembers(),
        attendanceAPI.getMeetings(),
        subscriptionsAPI.getCurrentSubscription().catch(() => ({ data: null })),
        samuhaAPI.getSettings()
      ]);
      setStats(statsRes.data);
      setSubscription(subRes?.data);
      setSamuhaSettings(settingsRes.data);
      setTransactions(txRes.data);
      setLoans(loansRes.data);
      setMembers(membersRes.data);
      setMeetings(meetingsRes.data);
      const mid = selectedMeetingId || (meetingsRes.data.length > 0 ? meetingsRes.data[0].id : '');
      if (mid) {
        setSelectedMeetingId(mid);
        setSavingBatch(prev => ({ ...prev, meeting_id: mid }));
        fetchAttendance(mid, meetingsRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (selectedMeetingId && meetings.length > 0) {
      fetchAttendance(selectedMeetingId, meetings);
    }
  }, [selectedMeetingId, meetings]);

  useEffect(() => {
    if (location.state?.highlightTransactionId) {
      const txId = location.state.highlightTransactionId;
      setHighlightedTxId(txId);
      setActiveTab('overview');
      setTimeout(() => {
        if (txRefs.current[txId]) {
          txRefs.current[txId].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      setTimeout(() => setHighlightedTxId(null), 5000);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const parseError = (err) => {
    try {
      const data = JSON.parse(err.message);
      // DRF commonly uses 'detail', 'error', or 'non_field_errors'
      return data.detail || data.error || data.non_field_errors || Object.values(data)[0] || err.message;
    } catch {
      return err.message;
    }
  };

  const handleBatchSaving = async () => {
    if (!savingBatch.meeting_id) return alert('Select a meeting first');
    if (savingBatch.savings.length === 0) return alert('Select members first');
    try {
      await ledgerAPI.recordBatchSavings(savingBatch);
      alert('Savings recorded successfully!');
      fetchData();
      setSavingBatch({ ...savingBatch, savings: [] });
    } catch (err) { alert(parseError(err)); }
  };

  const handleLoanAction = async (loanId, action) => {
    try {
      await ledgerAPI.manageLoan(loanId, action);
      alert(`Loan ${action} successful!`);
      fetchData();
    } catch (err) { alert(parseError(err)); }
  };

  const handlePredict = async (loanId) => {
    setPredictingId(loanId);
    try {
      const loan = loans.find(l => l.id === loanId);
      const res = await ledgerAPI.predictLoan({
        loan_id: loanId, income: loan?.annual_income,
        dti: loan?.dti_ratio, emp_len: loan?.employment_length, amount: loan?.principal_amount
      });
      setLoanPredictions(prev => ({ ...prev, [loanId]: res.data }));
    } catch (err) {
      console.error("Prediction failed:", err);
      alert("AI Prediction failed. Ensure the model file is uploaded.");
    } finally { setPredictingId(null); }
  };

  const handleDeleteTransaction = async (txId) => {
    if (!window.confirm('Are you sure you want to delete this transaction? This cannot be undone.')) return;
    try {
      await ledgerAPI.deleteTransaction(txId);
      alert('Transaction deleted successfully');
      fetchData();
    } catch (err) { alert(parseError(err)); }
  };

  const handleRepaymentSubmit = async (loanId, data) => {
    try {
      await ledgerAPI.repayLoan(loanId, data);
      alert('Repayment recorded successfully!');
      setRepayModalOpen(false);
      fetchData();
    } catch (err) { alert(`Repayment failed: ${parseError(err)}`); }
  };

  const handleLoanRequest = async (loanData) => {
    try {
      setLoading(true);
      const formattedData = { ...loanData, principal_amount: loanData.loan_amount, purpose: loanData.loan_purpose };
      await ledgerAPI.requestLoan(formattedData);
      alert('Loan request submitted successfully!');
      setShowLoanModal(false);
      fetchData();
    } catch (err) { alert(parseError(err)); }
    finally { setLoading(false); }
  };

  return {
    activeTab, setActiveTab, loading, stats, transactions, loans, subscription,
    loanPredictions, predictingId, members, meetings, selectedMeetingId,
    setSelectedMeetingId, meetingAttendance, prevMeetingAttendance,
    showLoanModal, setShowLoanModal, savingBatch, setSavingBatch,
    highlightedTxId, txRefs, repayModalOpen, setRepayModalOpen,
    selectedLoanForRepay, setSelectedLoanForRepay, isAdhakshya, samuhaSettings,
    handleBatchSaving, handleLoanAction, handlePredict,
    handleDeleteTransaction, handleRepaymentSubmit, handleLoanRequest,
  };
};

export default useLedger;
