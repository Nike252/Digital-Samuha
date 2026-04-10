import { useState, useEffect } from 'react';
import { samuhaAPI } from '../../utils/api';
import { useUI } from '../../context/UIContext';

const useMembers = (user) => {
  const { showToast } = useUI();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'pending', 'all'
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

  useEffect(() => { fetchMembers(); }, []);

  const handleUpdateStatus = async (membershipId, status) => {
    try {
      await samuhaAPI.updateMemberStatus(membershipId, status);
      fetchMembers();
      showToast('Member status updated', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredMembers = members.filter(m => {
    // 1. Filter by Tab
    if (activeTab === 'active' && m.status !== 'active') return false;
    if (activeTab === 'pending' && m.status !== 'pending') return false;
    
    // 2. Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return m.full_name?.toLowerCase().includes(q) || m.phone?.includes(q);
    }

    return true; 
  });

  return {
    members, loading, activeTab, setActiveTab, isAdmin,
    fetchMembers, handleUpdateStatus, filteredMembers,
    searchQuery, setSearchQuery
  };
};

export default useMembers;
