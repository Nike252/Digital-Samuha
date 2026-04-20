import { useState, useEffect } from 'react';
import { samuhaAPI } from '../../utils/api';
import { useUI } from '../../context/UIContext';

const useMembers = (user) => {
  const { showToast } = useUI();
  const [members, setMembers] = useState([]);
  const [exitRequests, setExitRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'pending', 'all', 'exit_requests'
  const [searchQuery, setSearchQuery] = useState('');
  const isAdmin = ['adhakshya', 'co_adhakshya'].includes(user?.role);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await samuhaAPI.getMembers();
      setMembers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExitRequests = async () => {
    if (!isAdmin) return;
    try {
      const res = await samuhaAPI.getExitRequests();
      setExitRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { 
    fetchMembers(); 
    if (isAdmin) fetchExitRequests();
  }, [isAdmin]);

  const handleUpdateStatus = async (membershipId, status) => {
    try {
      await samuhaAPI.updateMemberStatus(membershipId, status);
      fetchMembers();
      showToast('Member status updated', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleProcessExit = async (requestId, status) => {
    try {
      await samuhaAPI.processExitRequest(requestId, status);
      fetchExitRequests();
      fetchMembers();
      showToast(`Member exit ${status === 'approved' ? 'approved' : 'rejected'}`, 'success');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const handleUpdateRole = async (membershipId, role) => {
    try {
      await samuhaAPI.updateMemberRole(membershipId, role);
      fetchMembers();
      showToast(`Role updated to ${role}`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleTransferLeadership = async (successorId, email = null, citizenshipNo = null) => {
    try {
      setLoading(true);
      await samuhaAPI.transferLeadership(successorId, email, citizenshipNo);
      showToast('Leadership transferred! Redirecting...', 'success');
      
      // Crucial: UI Change logic
      // We force a redirect to dashboard and reload to ensure roles are re-fetched from backend
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
      
    } catch (err) {
      setLoading(false);
      showToast(err.message, 'error');
    }
  };

  const filteredMembers = members.filter(m => {
    // 1. Filter by Tab
    if (activeTab === 'active' && m.status !== 'active') return false;
    if (activeTab === 'pending' && m.status !== 'pending') return false;
    if (activeTab === 'exit_requests') return false; // Exit requests has its own view
    
    // 2. Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return m.full_name?.toLowerCase().includes(q) || m.phone?.includes(q);
    }

    return true; 
  });

  return {
    members, exitRequests, loading, activeTab, setActiveTab, isAdmin,
    fetchMembers, fetchExitRequests, handleUpdateStatus, handleProcessExit, 
    handleUpdateRole, handleTransferLeadership,
    filteredMembers, searchQuery, setSearchQuery
  };
};

export default useMembers;
