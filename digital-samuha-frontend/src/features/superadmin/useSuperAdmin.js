import { useState, useEffect } from 'react';
import { samuhaAPI } from '../../utils/api';
import { ShieldCheck, CheckCircle } from 'lucide-react';
import { useUI } from '../../context/UIContext';

const useSuperAdmin = () => {
  const { showConfirm, showToast } = useUI();
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'management'
  const [pendingSamuhas, setPendingSamuhas] = useState([]);
  const [allSamuhas, setAllSamuhas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSamuha, setSelectedSamuha] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingSamuhas();
    } else {
      fetchAllSamuhas();
    }
  }, [activeTab]);

  const fetchPendingSamuhas = async () => {
    try {
      setLoading(true);
      const res = await samuhaAPI.getPendingList();
      setPendingSamuhas(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch pending registrations.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSamuhas = async () => {
    try {
      setLoading(true);
      const res = await samuhaAPI.getSamuhaList();
      setAllSamuhas(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch Samuha registry.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, name) => {
    showConfirm({
      title: 'Approve Samuha',
      message: `Are you sure you want to approve "${name}"? This will activate the Samuha and send the code to the Adhakshya.`,
      confirmText: 'Approve',
      type: 'success',
      onConfirm: async () => {
        try {
          setApprovingId(id);
          await samuhaAPI.approveSamuha(id);
          setPendingSamuhas(prev => prev.filter(s => s.id !== id));
          setSelectedSamuha(null);
          showToast('Samuha approved successfully!', 'success');
        } catch (err) {
          showToast(err.message || 'Failed to approve Samuha.', 'error');
        } finally {
          setApprovingId(null);
        }
      }
    });
  };

  const handleToggleStatus = async (samuha) => {
    const newStatus = samuha.status === 'active' ? 'inactive' : 'active';
    showConfirm({
      title: 'Update Status',
      message: `Are you sure you want to set "${samuha.samuha_name}" to ${newStatus.toUpperCase()}?`,
      confirmText: 'Update Status',
      type: newStatus === 'inactive' ? 'warning' : 'info',
      onConfirm: async () => {
        try {
          setUpdatingId(samuha.id);
          await samuhaAPI.updateSamuhaStatus(samuha.id, newStatus);
          setAllSamuhas(prev => prev.map(s => s.id === samuha.id ? { ...s, status: newStatus } : s));
          showToast(`Samuha status updated to ${newStatus}!`, 'success');
        } catch (err) {
          showToast(err.message || 'Failed to update status.', 'error');
        } finally {
          setUpdatingId(null);
        }
      }
    });
  };

  const stats = [
    { label: 'Pending Requests', value: pendingSamuhas.length, icon: ShieldCheck, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { label: 'Active Orgs', value: allSamuhas.filter(s => s.status === 'active').length, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ];

  return {
    activeTab, setActiveTab,
    pendingSamuhas, allSamuhas,
    loading, error,
    selectedSamuha, setSelectedSamuha,
    approvingId, updatingId,
    fetchPendingSamuhas, fetchAllSamuhas,
    handleApprove, handleToggleStatus,
    stats
  };
};

export default useSuperAdmin;
