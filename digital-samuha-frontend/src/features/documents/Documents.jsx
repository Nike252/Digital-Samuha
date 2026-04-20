import React from 'react';
import { FileText, FolderPlus, History, Scale, HandCoins, Landmark } from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import useDocuments from './useDocuments';
import ArchiveSection from './ArchiveSection';
import MeetingsSection from './MeetingsSection';
import LegalizerSection from './LegalizerSection';
import LoanRecordsSection from './LoanRecordsSection';
import PayoutRecordsSection from './PayoutRecordsSection';
import UploadModal from './UploadModal';
import MeetingReportModal from './MeetingReportModal';

const Documents = ({ user, onLogout }) => {
  const {
    activeTab, setActiveTab, searchTerm, setSearchTerm, documents, meetings, loans,
    loading, isUploadModalOpen, setIsUploadModalOpen, selectedReport, 
    isReportModalOpen, setIsReportModalOpen, samuhaDetails, handleUpload, 
    handleDelete, viewReport, isAdhakshya
  } = useDocuments(user);

  return (
    <MainLayout user={user} onLogout={onLogout} userRole={user?.role}>
      <div className="p-8 max-w-7xl mx-auto min-h-screen">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <FileText size={20} />
              </div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">Documents Hub</h1>
            </div>
            <p className="text-lg text-gray-500 font-medium ml-1">Archive sessions, legal templates, and official records.</p>
          </div>
          
          {isAdhakshya && activeTab === 'archive' && (
            <button onClick={() => setIsUploadModalOpen(true)} className="group flex items-center gap-3 px-6 py-4 bg-indigo-600 text-white rounded-[24px] hover:bg-indigo-700 transition-all font-black shadow-xl shadow-indigo-100 hover:-translate-y-1">
              <FolderPlus size={22} className="group-hover:rotate-12 transition-transform" />
              <span>Upload New File</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-4 mb-10">
          {[
            { id: 'archive', label: 'Official Archive', icon: <FileText size={18} /> },
            { id: 'meetings', label: 'Meeting Records', icon: <History size={18} /> },
            { id: 'loans', label: 'Loan Records', icon: <HandCoins size={18} /> },
            { id: 'payouts', label: 'Payout Records', icon: <Landmark size={18} /> },
            ...((isAdhakshya || user?.role === 'co_adhakshya') ? [{ id: 'legalizer', label: 'Legalizer Tool', icon: <Scale size={18} /> }] : [])
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-3 px-8 py-4 rounded-[24px] font-black text-sm transition-all border-2 ${activeTab === tab.id ? 'bg-gray-900 border-gray-900 text-white shadow-2xl translate-y-[-4px]' : 'bg-white border-gray-100 text-gray-400 hover:border-indigo-200 hover:text-indigo-600'}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Loading Records...</p>
          </div>
        ) : (
          <div className="min-h-[600px]">
            {activeTab === 'archive' && <ArchiveSection {...{ searchTerm, setSearchTerm, documents, isAdhakshya, handleDelete }} />}
            {activeTab === 'meetings' && <MeetingsSection {...{ meetings, viewReport }} />}
            {activeTab === 'loans' && <LoanRecordsSection loans={loans} />}
            {activeTab === 'payouts' && <PayoutRecordsSection documents={documents.filter(d => d.category === 'payout')} handleDelete={handleDelete} isAdhakshya={isAdhakshya} />}
            {activeTab === 'legalizer' && <LegalizerSection {...{ samuhaDetails }} />}
          </div>
        )}

        <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} handleUpload={handleUpload} />
        <MeetingReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} selectedReport={selectedReport} />
      </div>
    </MainLayout>
  );
};

export default Documents;
