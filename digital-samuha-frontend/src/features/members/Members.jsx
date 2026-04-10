import React from 'react';
import MainLayout from '../../layouts/MainLayout';
import { Users, UserCheck, Clock, Settings, Search, X } from 'lucide-react';
import useMembers from './useMembers';
import MemberRow from './MemberRow';

const Members = ({ user, onLogout }) => {
  const {
    loading, activeTab, setActiveTab, isAdmin,
    handleUpdateStatus, filteredMembers, 
    searchQuery, setSearchQuery
  } = useMembers(user);

  return (
    <MainLayout userRole={user?.role || 'member'} user={user} onLogout={onLogout}>
      <div className="mb-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Community Members</h1>
          <p className="text-gray-500 mt-1">{isAdmin ? 'Manage and view all registered individuals in your Samuha.' : 'View all active members of your community.'}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Status Tab Group */}
          {isAdmin && (
            <div className="flex bg-[#f8f9fb] p-1.5 rounded-[20px] border border-gray-100 shadow-sm">
              {[
                { id: 'active', label: 'Active', icon: UserCheck },
                { id: 'pending', label: 'Pending', icon: Clock },
                { id: 'all', label: 'Manage', icon: Settings }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-[14px] text-xs font-bold transition-all ${
                    activeTab === tab.id 
                      ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <tab.icon size={14} /> {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Search Bar Group */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none">
              <Search size={18} />
            </div>
            <input 
              type="text"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-[20px] text-sm focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600/30 transition-all outline-none shadow-sm hover:border-gray-300"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                title="Clear Search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
             <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
             <p className="text-gray-400 font-medium">Loading members...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
             <div className="p-4 bg-gray-50 rounded-full mb-4">
                {searchQuery ? <Search size={40} className="text-gray-300" /> : <Users size={40} className="text-gray-300" />}
             </div>
             <h3 className="text-lg font-bold text-gray-900">
                {searchQuery ? `No results for "${searchQuery}"` : 'No members found'}
             </h3>
             <p className="text-sm text-gray-500 mt-1 max-w-xs">
                {searchQuery 
                  ? "Try checking for typos or searching with a different keyword." 
                  : "Individuals in this category will appear here once registered."}
             </p>
             {searchQuery && (
               <button 
                 onClick={() => setSearchQuery('')}
                 className="mt-4 text-sm font-bold text-indigo-600 hover:text-indigo-800"
               >
                 Clear search filters
               </button>
             )}
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
