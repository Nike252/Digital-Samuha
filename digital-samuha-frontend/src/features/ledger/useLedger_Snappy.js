import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { ledgerAPI, samuhaAPI, attendanceAPI, subscriptionsAPI } from '../../utils/api';
import { useUI } from '../../context/UIContext';

const useLedger = (user) => {
  const ui = useUI();
  const showToast = ui?.showToast;
  const showConfirm = ui?.showConfirm;
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true); // Full-screen loader (Initial)
  const [refreshing, setRefreshing] = useState(false); // Background loader (Action)
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

  const fetchAttendance = useCallback(async (currentMeetingId, allMeetings) => {
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
  }, []);

  const fetchData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    else setRefreshing(true);
    
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
      
      const currentStats = statsRes.data;
      setStats(currentStats);
      setSubscription(subRes?.data);
      setSamuhaSettings(settingsRes.data);
      setTransactions(txRes.data);
      setLoans(loansRes.data);
      setMembers(membersRes.data);

      // CYCLE FILTERING: Only show meetings from the current cycle in the active view
      const resetDate = currentStats.last_reset_date ? new Date(currentStats.last_reset_date) : null;
      const filteredMeetings = resetDate 
        ? meetingsRes.data.filter(m => new Date(m.date) > resetDate)
        : meetingsRes.data;

      setMeetings(filteredMeetings);
      
      const mid = selectedMeetingId || (filteredMeetings.length > 0 ? filteredMeetings[0].id : '');
      if (mid) {
        setSelectedMeetingId(mid);
        setSavingBatch(prev => ({ ...prev, meeting_id: mid }));
        fetchAttendance(mid, meetingsRes.data); //# Still pass full meetings for prevMeeting lookup
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedMeetingId, fetchAttendance]);

  useEffect(() => { fetchData(true); }, []); // Initial Load only

  useEffect(() => {
    // Handle highlighted transactions
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
    
    // Handle initial tab selection from navigation state
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      // Clean up state after use to prevent re-triggering on reload
      window.history.replaceState({ ...location.state, activeTab: undefined }, document.title);
    }
  }, [location.state]);

  const parseError = (err) => {
    try {
      const data = JSON.parse(err.message);
      return data.detail || data.error || data.non_field_errors || Object.values(data)[0] || err.message;
    } catch {
      return err.message;
    }
  };

  const handleBatchSaving = async () => {
    if (!savingBatch.meeting_id) return showToast('Select a meeting first', 'warning');
    if (savingBatch.savings.length === 0) return showToast('Select members first', 'warning');
    try {
      setRefreshing(true);
      await ledgerAPI.recordBatchSavings(savingBatch);
      showToast('Savings recorded successfully!', 'success');
      // Optional: Delay slightly to let animations breathe
      await fetchData(false);
      setSavingBatch({ ...savingBatch, savings: [] });
    } catch (err) { 
      showToast(parseError(err), 'error'); 
      setRefreshing(false);
    }
  };

  const handleLoanAction = async (loanId, action) => {
    showConfirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Loan`,
      message: `Are you sure you want to ${action} this loan request?`,
      type: action === 'reject' ? 'danger' : 'info',
      confirmText: 'Yes, proceed',
      onConfirm: async () => {
        try {
          setRefreshing(true);
          await ledgerAPI.manageLoan(loanId, action);
          showToast(`Loan ${action}ed successfully`, 'success');
          await fetchData(false);
        } catch (err) { 
          showToast(parseError(err), 'error'); 
          setRefreshing(false);
        }
      }
    });
  };

  const handlePredict = async (loanId) => {
    setPredictingId(loanId);
    try {
      const res = await ledgerAPI.predictLoan({ loan_id: loanId });
      setLoanPredictions(prev => ({ ...prev, [loanId]: res.data }));
      showToast('AI Prediction complete', 'success');
    } catch (err) {
      console.error("Prediction failed:", err);
      showToast("AI Prediction failed. Ensure the model file is uploaded.", 'error');
    } finally { setPredictingId(null); }
  };

  const handleDeleteTransaction = async (txId) => {
    const tx = transactions.find(t => t.id === txId);
    const isFinancialCore = tx && ['saving', 'fine'].includes(tx.type);

    showConfirm({
      title: isFinancialCore ? '⚠️ Critical Deletion' : 'Delete Transaction',
      message: isFinancialCore 
        ? `You are deleting a ${tx.type.toUpperCase()}. This will cause the member to show as "UNPAID" in their next meeting and create arrears. Are you absolutely sure?`
        : 'Are you sure you want to delete this transaction? This action cannot be undone.',
      confirmText: isFinancialCore ? 'Yes, Delete & Create Arrears' : 'Delete',
      type: 'danger',
      onConfirm: async () => {
        try {
          setRefreshing(true);
          await ledgerAPI.deleteTransaction(txId);
          showToast('Transaction deleted successfully', 'success');
          await fetchData(false);
        } catch (err) { 
          showToast(parseError(err), 'error'); 
          setRefreshing(false);
        }
      }
    });
  };

  const handleRepaymentSubmit = async (loanId, data) => {
    try {
      setRefreshing(true);
      await ledgerAPI.repayLoan(loanId, data);
      showToast('Repayment successful', 'success');
      setRepayModalOpen(false);
      await fetchData(false);
    } catch (err) { 
      showToast(`Repayment failed: ${parseError(err)}`, 'error'); 
      setRefreshing(false);
    }
  };

  const handleLoanRequest = async (loanData) => {
    try {
      setRefreshing(true);
      const formattedData = { ...loanData, principal_amount: loanData.loan_amount, purpose: loanData.loan_purpose };
      await ledgerAPI.requestLoan(formattedData);
      showToast('Loan requested successfully', 'success');
      setShowLoanModal(false);
      await fetchData(false);
    } catch (err) { 
      showToast(parseError(err), 'error'); 
      setRefreshing(false);
    }
  };

  return {
    activeTab, setActiveTab, loading, refreshing, stats, transactions, loans, subscription,
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
