import React from 'react';
import { X } from 'lucide-react';

const CreateMeetingModal = ({ 
  showCreateModal, 
  setShowCreateModal, 
  newMeeting, 
  setNewMeeting, 
  handleCreateMeeting 
}) => {
  if (!showCreateModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
         <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">Create New Meeting</h3>
            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
         </div>
         <form onSubmit={handleCreateMeeting} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Meeting Date</label>
                <input 
                  type="date" 
                  required
                  value={newMeeting.date}
                  onChange={(e) => setNewMeeting({...newMeeting, date: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-medium text-gray-700" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Start Time</label>
                <input 
                  type="time" 
                  required
                  value={newMeeting.start_time}
                  onChange={(e) => setNewMeeting({...newMeeting, start_time: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-medium text-gray-700" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Monthly Savings Gathering"
                value={newMeeting.title}
                onChange={e => setNewMeeting({...newMeeting, title: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Description (Optional)</label>
              <textarea 
                rows="3"
                placeholder="Brief agenda of the meeting..."
                value={newMeeting.description}
                onChange={e => setNewMeeting({...newMeeting, description: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 outline-none resize-none" 
              ></textarea>
            </div>
            <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
              Create Meeting
            </button>
         </form>
      </div>
    </div>
  );
};

export default CreateMeetingModal;
