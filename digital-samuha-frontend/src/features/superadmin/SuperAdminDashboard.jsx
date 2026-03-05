import React from 'react';
import MainLayout from '../../layouts/MainLayout';
import { ShieldCheck, FileText, CheckCircle, XCircle } from 'lucide-react';
import useSuperAdmin from './useSuperAdmin';
import DashboardStats from './DashboardStats';
import SamuhaRegistryTable from './SamuhaRegistryTable';
import ReviewModal from './ReviewModal';

const SuperAdminDashboard = ({ user, onLogout }) => {
  const {
    activeTab, setActiveTab, pendingSamuhas, allSamuhas, loading, error,
    selectedSamuha, setSelectedSamuha, approvingId, updatingId,
    fetchPendingSamuhas, fetchAllSamuhas, handleApprove, handleToggleStatus, stats
  } = useSuperAdmin();

  const data = activeTab === 'pending' ? pendingSamuhas : allSamuhas;

  return (
    <div className="min-h-screen bg-[#0f1115] text-gray-100">
      <MainLayout userRole="super_admin" user={user} onLogout={onLogout} isDark={true}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Registry Controller</h1>
              <p className="text-gray-400 mt-2">Oversee and manage the status of all organizations on the platform.</p>
            </div>
            <div className="flex bg-[#1a1d23] p-1 rounded-xl border border-gray-800">
              {['pending', 'management'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  {tab === 'pending' ? 'Verification Queue' : 'Manage Samuhas'}
                </button>
              ))}
            </div>
          </div>

          <DashboardStats stats={stats} />

          <div className="bg-[#1a1d23] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                {activeTab === 'pending' ? <><ShieldCheck className="text-orange-400" size={20} /> Pending Approvals</> : <><FileText className="text-emerald-400" size={20} /> Samuha Registry</>}
              </h2>
              <button 
                onClick={activeTab === 'pending' ? fetchPendingSamuhas : fetchAllSamuhas} 
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors uppercase font-bold tracking-widest"
              > Sync Data </button>
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 animate-pulse">Syncing with blockchain registry...</p>
              </div>
            ) : error ? (
              <div className="m-6 p-4 bg-red-900/20 border border-red-800/50 text-red-400 rounded-xl flex items-center gap-3"><XCircle size={18} /> {error} </div>
            ) : data.length === 0 ? (
              <div className="py-20 text-center">
                <div className="inline-flex p-4 bg-gray-800/30 rounded-full mb-4"><CheckCircle size={40} className="text-gray-600" /></div>
                <h3 className="text-lg font-medium text-gray-400">Registry is empty</h3>
              </div>
            ) : (
              <SamuhaRegistryTable {...{ activeTab, data, updatingId, handleToggleStatus, setSelectedSamuha }} />
            )}
          </div>
        </div>
      </MainLayout>

      <ReviewModal {...{ selectedSamuha, setSelectedSamuha, handleApprove, approvingId }} />

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #15181e; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #312e81; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default SuperAdminDashboard;
