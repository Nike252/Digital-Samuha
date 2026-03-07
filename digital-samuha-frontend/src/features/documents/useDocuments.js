import { useState, useEffect } from 'react';
import { documentsAPI, attendanceAPI, samuhaAPI, ledgerAPI } from '../../utils/api';
import { useUI } from '../../context/UIContext';

const useDocuments = (user) => {
  const { showConfirm, showToast } = useUI();
  const [activeTab, setActiveTab] = useState('archive');
  const [searchTerm, setSearchTerm] = useState('');
  const [documents, setDocuments] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [samuhaDetails, setSamuhaDetails] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docRes, meetRes, samuhaRes, loanRes] = await Promise.all([
        documentsAPI.getDocuments(),
        attendanceAPI.getMeetings(),
        samuhaAPI.getSamuhaDetails(),
        ledgerAPI.getLoans()
      ]);
      setDocuments(docRes.data || []);
      setMeetings(meetRes.data || []);
      setSamuhaDetails(samuhaRes.data || null);
      setLoans(loanRes.data || []);
    } catch (err) {
      console.error("Error fetching documents data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await documentsAPI.uploadDocument(formData);
      setIsUploadModalOpen(false);
      showToast("Document uploaded successfully", "success");
      fetchData();
    } catch (err) {
      showToast("Upload failed: " + err.message, "error");
    }
  };

  const handleDelete = async (id) => {
    showConfirm({
      title: 'Delete Document',
      message: 'Are you sure you want to delete this document? This cannot be undone.',
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: async () => {
        try {
          await documentsAPI.deleteDocument(id);
          showToast("Document deleted successfully", "success");
          fetchData();
        } catch (err) {
          showToast("Delete failed: " + err.message, "error");
        }
      }
    });
  };

  const viewReport = async (meetingId) => {
    try {
      const res = await documentsAPI.getMeetingReport(meetingId);
      setSelectedReport(res.data);
      setIsReportModalOpen(true);
    } catch (err) {
      showToast("Failed to load report: " + err.message, "error");
    }
  };

  const isAdhakshya = user?.role === 'adhakshya' || user?.role === 'co_adhakshya';

  return {
    activeTab, setActiveTab,
    searchTerm, setSearchTerm,
    documents, setDocuments,
    meetings, setMeetings,
    loans, setLoans,
    loading, setLoading,
    isUploadModalOpen, setIsUploadModalOpen,
    selectedReport, setSelectedReport,
    isReportModalOpen, setIsReportModalOpen,
    samuhaDetails, setSamuhaDetails,
    fetchData,
    handleUpload,
    handleDelete,
    viewReport,
    isAdhakshya
  };
};

export default useDocuments;
