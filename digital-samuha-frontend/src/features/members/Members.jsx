import React from 'react';
import MainLayout from '../../layouts/MainLayout';
import { Users, UserCheck, Clock, Settings } from 'lucide-react';
import useMembers from './useMembers';
import MemberRow from './MemberRow';

const Members = ({ user, onLogout }) => {
  const {
    loading, activeTab, setActiveTab, isAdmin,
    handleUpdateStatus, filteredMembers
  } = useMembers(user);

  return (
    <MainLayout userRole={user?.role || 'member'} user={user} onLogout={onLogout}>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Community Members</h1>
          <p className="text-gray-500 mt-1">{isAdmin ? 'Manage and view all registered individuals in your Samuha.' : 'View all active members of your community.'}</p>
        </div>
        
        {isAdmin && (
          <div className="flex bg-gray-100 p-1 rounded-xl self-start">
            {[
              { id: 'active', label: 'Active', icon: UserCheck },
              { id: 'pending', label: 'Pending', icon: Clock },
              { id: 'all', label: 'Manage', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
             <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
             <p className="text-gray-400 font-medium">Loading members...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
             <Users size={48} className="mb-4 opacity-20" />
             <p className="text-lg font-medium">No members found in this category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Member Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Contact Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  {isAdmin && <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredMembers.map(m => <MemberRow key={m.membership_id} m={m} isAdmin={isAdmin} handleUpdateStatus={handleUpdateStatus} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Members;
