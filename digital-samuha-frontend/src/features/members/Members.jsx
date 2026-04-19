import React from 'react';
import MainLayout from '../../layouts/MainLayout';
import { Users, UserCheck, Clock, Settings, Search, X, ShieldCheck, UserMinus } from 'lucide-react';
import useMembers from './useMembers';
import MemberRow from './MemberRow';
import ExitRequestsList from './ExitRequestsList';
import SettlementReviewModal from './SettlementReviewModal';
import { toast } from 'react-hot-toast';

const Members = ({ user, onLogout }) => {
  const {
    loading, activeTab, setActiveTab, isAdmin,
    handleUpdateStatus, filteredMembers, 
    searchQuery, setSearchQuery, exitRequests, handleProcessExit
  } = useMembers(user);

  const [selectedMember, setSelectedMember] = React.useState(null);
  const [showVerifyModal, setShowVerifyModal] = React.useState(false);
  
  // Exit Request States
  const [selectedExitRequest, setSelectedExitRequest] = React.useState(null);
  const [showSettlementModal, setShowSettlementModal] = React.useState(false);
  const [isProcessingExit, setIsProcessingExit] = React.useState(false);

  const handleOpenVerify = (member) => {
    setSelectedMember(member);
    setShowVerifyModal(true);
  };

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
            <div className="flex bg-white/40 backdrop-blur-md p-1.5 rounded-[24px] border border-white/50 shadow-sm ring-1 ring-black/5">
              {[
                { id: 'active', label: 'Active', icon: UserCheck },
                { id: 'pending', label: 'Pending', icon: Clock },
                { id: 'exit_requests', label: 'Exits', icon: UserMinus },
                { id: 'all', label: 'All', icon: Settings }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-[18px] text-xs font-bold transition-all relative ${
                    activeTab === tab.id 
                      ? 'bg-white text-indigo-600 shadow-md ring-1 ring-black/5' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-white/30'
                  }`}
                >
                  <tab.icon size={14} /> {tab.label}
                  {tab.id === 'exit_requests' && exitRequests.filter(r => r.status === 'pending').length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full shadow-lg border-2 border-white">
                      {exitRequests.filter(r => r.status === 'pending').length}
                    </span>
                  )}
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
        ) : activeTab === 'exit_requests' ? (
          <ExitRequestsList 
            requests={exitRequests} 
            loading={false} 
            onProcess={(req, action) => {
              if (action === 'rejected') {
                if (window.confirm(`Are you sure you want to reject ${req.user_name}'s exit request?`)) {
                   handleProcessExit(req.id, 'rejected');
                }
              } else {
                setSelectedExitRequest(req);
                setShowSettlementModal(true);
              }
            }}
          />
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
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Member Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Contact Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                  {isAdmin && <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right whitespace-nowrap">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredMembers.map(m => (
                  <MemberRow 
                    key={m.membership_id} 
                    m={m} 
                    isAdmin={isAdmin} 
                    handleUpdateStatus={handleUpdateStatus}
                    onVerify={handleOpenVerify} 
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SettlementReviewModal 
        isOpen={showSettlementModal}
        onClose={() => setShowSettlementModal(false)}
        request={selectedExitRequest}
        isSubmitting={isProcessingExit}
        onConfirm={async (id) => {
          setIsProcessingExit(true);
          const success = await handleProcessExit(id, 'approved');
          if (success) setShowSettlementModal(false);
          setIsProcessingExit(false);
        }}
      />

      {/* Identity Verification Modal */}
      {showVerifyModal && selectedMember && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Verify Identity</h3>
                  <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Reviewing {selectedMember.full_name}</p>
                </div>
              </div>
              <button onClick={() => setShowVerifyModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="p-8 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Info Column */}
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Full Name</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedMember.full_name}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Phone Number</label>
                    <p className="text-base font-medium text-gray-700">{selectedMember.phone}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Requested Role</label>
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold uppercase">{selectedMember.role_display}</span>
                  </div>
                  <div className="p-5 bg-amber-50 rounded-[24px] border border-amber-100">
                    <label className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block mb-1">Citizenship Number</label>
                    <p className="text-xl font-black text-amber-900 font-mono tracking-tighter">{selectedMember.citizenship_no || 'N/A'}</p>
                  </div>
                  <div className="pt-4 space-y-3">
                    <button 
                      onClick={() => {
                        handleUpdateStatus(selectedMember.membership_id, 'active');
                        setShowVerifyModal(false);
                      }}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-95"
                    >
                      Approve This Member
                    </button>
                    {selectedMember.role !== 'adhakshya' && (
                      <button 
                        onClick={() => {
                          handleUpdateStatus(selectedMember.membership_id, 'rejected');
                          setShowVerifyModal(false);
                        }}
                        className="w-full py-4 text-red-600 font-bold hover:bg-red-50 rounded-2xl transition-all"
                      >
                        Reject Application
                      </button>
                    )}
                  </div>
                </div>

                {/* Photos Column */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">ID FRONT VIEW</p>
                       <div className="aspect-[3/2] bg-gray-100 rounded-3xl overflow-hidden border-2 border-dashed border-gray-200 group">
                          {selectedMember.citizenship_front ? (
                            <img 
                              src={selectedMember.citizenship_front} 
                              alt="Front" 
                              className="w-full h-full object-cover cursor-zoom-in hover:scale-110 transition-transform duration-500" 
                              onClick={() => window.open(selectedMember.citizenship_front)}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">No Image Uploaded</div>
                          )}
                       </div>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">ID BACK VIEW</p>
                       <div className="aspect-[3/2] bg-gray-100 rounded-3xl overflow-hidden border-2 border-dashed border-gray-200 group">
                          {selectedMember.citizenship_back ? (
                            <img 
                              src={selectedMember.citizenship_back} 
                              alt="Back" 
                              className="w-full h-full object-cover cursor-zoom-in hover:scale-110 transition-transform duration-500"
                              onClick={() => window.open(selectedMember.citizenship_back)}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">No Image Uploaded</div>
                          )}
                       </div>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-3">
                    <div className="text-blue-500">ℹ️</div>
                    <p className="text-xs text-blue-800 leading-relaxed font-medium">Click on the images to view them in full resolution. Always verify the photo matches the member's face if possible.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Members;
