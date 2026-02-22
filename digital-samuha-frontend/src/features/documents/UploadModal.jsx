import React from 'react';
import { X } from 'lucide-react';

const UploadModal = ({ isOpen, onClose, handleUpload }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl p-10 animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black text-gray-900">Upload Record</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
             <X size={24} className="text-gray-400" />
          </button>
        </div>
        <form onSubmit={handleUpload} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Document Title</label>
            <input name="title" required className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold" placeholder="e.g., Financial Report Q1" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
            <select name="category" className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold appearance-none">
              <option value="legal">Legal & Registration</option>
              <option value="financial">Financial Report</option>
              <option value="meeting_minute">Meeting Minute</option>
              <option value="other">Other Official Document</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Select File</label>
            <input type="file" name="file" required className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-sm" />
          </div>
          <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all mt-4">
            Confirm Upload
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
