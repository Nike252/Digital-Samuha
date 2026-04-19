import React from 'react';
import { Info, XCircle, FileText, ExternalLink, CheckCircle } from 'lucide-react';

const ReviewModal = ({ 
  selectedSamuha, 
  setSelectedSamuha, 
  handleApprove, 
  approvingId 
}) => {
  if (!selectedSamuha) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#1a1d23] border border-gray-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#15181e]">
          <h3 className="text-xl font-bold flex items-center gap-3">
            <Info className="text-indigo-400" />
            Review Registration
          </h3>
          <button onClick={() => setSelectedSamuha(null)} className="text-gray-500 hover:text-white transition-colors">
            <XCircle size={24} />
          </button>
        </div>
        
        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Organization Details</h4>
                <div className="space-y-4 bg-[#15181e] p-4 rounded-xl border border-gray-800">
                  <div>
                    <p className="text-xs text-indigo-400 mb-1">Full Name</p>
                    <p className="font-semibold">{selectedSamuha.samuha_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-indigo-400 mb-1">Location</p>
                    <p className="text-sm font-medium">{selectedSamuha.municipality}, {selectedSamuha.district}, {selectedSamuha.province}</p>
                  </div>
                  <div>
                    <p className="text-xs text-indigo-400 mb-1">Ward Number</p>
                    <p className="text-sm font-medium">{selectedSamuha.ward_number}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Verification Documents</h4>
                {selectedSamuha.proof_document ? (
                  <a 
                    href={`http://127.0.0.1:8000${selectedSamuha.proof_document}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-3 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 p-4 rounded-xl text-indigo-400 transition-all group"
                  >
                    <FileText size={24} />
                    <div className="flex-1">
                      <p className="text-sm font-bold">Proof of Registration</p>
                      <p className="text-xs opacity-70">Click to view official document</p>
                    </div>
                    <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                ) : (
                  <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl text-gray-500 text-sm flex items-center gap-2">
                    <Info size={16} /> No document uploaded
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Applicant (Adhakshya)</h4>
                <div className="space-y-4 bg-[#15181e] p-4 rounded-xl border border-gray-800">
                  <div>
                    <p className="text-xs text-indigo-400 mb-1">Full Name</p>
                    <p className="font-semibold">{selectedSamuha.adhakshya_full_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-indigo-400 mb-1">Phone Number</p>
                    <p className="text-sm font-medium">{selectedSamuha.adhakshya_phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-indigo-400 mb-1">Email Address</p>
                    <p className="text-sm font-medium">{selectedSamuha.adhakshya_email || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Identity Verification</h4>
                <div className="space-y-4 bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10">
                  <div>
                    <p className="text-xs text-indigo-400 mb-1">Citizenship Number</p>
                    <p className="font-mono text-sm font-bold tracking-wider">{selectedSamuha.adhakshya_citizenship_no || 'N/A'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 font-bold uppercase text-center">ID FRONT</p>
                      <div className="aspect-[3/2] rounded-lg overflow-hidden border border-gray-800 bg-black/40 cursor-zoom-in hover:border-indigo-500/50 transition-colors">
                        {selectedSamuha.adhakshya_citizenship_front ? (
                          <img 
                            src={`http://127.0.0.1:8000${selectedSamuha.adhakshya_citizenship_front}`} 
                            alt="ID Front" 
                            className="w-full h-full object-cover"
                            onClick={() => window.open(`http://127.0.0.1:8000${selectedSamuha.adhakshya_citizenship_front}`)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-700 uppercase">No File</div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 font-bold uppercase text-center">ID BACK</p>
                      <div className="aspect-[3/2] rounded-lg overflow-hidden border border-gray-800 bg-black/40 cursor-zoom-in hover:border-indigo-500/50 transition-colors">
                        {selectedSamuha.adhakshya_citizenship_back ? (
                          <img 
                            src={`http://127.0.0.1:8000${selectedSamuha.adhakshya_citizenship_back}`} 
                            alt="ID Back" 
                            className="w-full h-full object-cover"
                            onClick={() => window.open(`http://127.0.0.1:8000${selectedSamuha.adhakshya_citizenship_back}`)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-700 uppercase">No File</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-[#15181e] border-t border-gray-800 flex gap-4">
          <button 
            disabled={approvingId}
            onClick={() => handleApprove(selectedSamuha.id, selectedSamuha.samuha_name)}
            className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-600/20"
          >
            {approvingId ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Approving...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                Approve & Send Code
              </>
            )}
          </button>
          <button 
            onClick={() => setSelectedSamuha(null)}
            className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-bold transition-all"
          > Cancel </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
