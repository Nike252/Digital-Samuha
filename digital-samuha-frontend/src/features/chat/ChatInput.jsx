import React from 'react';
import { Paperclip, X, FileText, Image as ImageIcon, Send } from 'lucide-react';

const ChatInput = ({ 
  newMessage, 
  setNewMessage, 
  sending, 
  handleSend, 
  selectedFile, 
  filePreview, 
  clearFile, 
  fileInputRef, 
  handleFileChange 
}) => {
  return (
    <div className="bg-white border-t border-slate-50 px-8 py-6">
      {selectedFile && (
         <div className="mb-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-4">
               {filePreview ? (
                  <img src={filePreview} alt="Preview" className="w-12 h-12 rounded-xl object-cover border border-indigo-200" />
               ) : (
                  <div className="w-12 h-12 bg-indigo-200 rounded-xl flex items-center justify-center text-indigo-600">
                     <FileText size={24} />
                  </div>
               )}
               <div className="min-w-0">
                  <p className="text-xs font-bold text-indigo-900 truncate max-w-[200px]">{selectedFile.name}</p>
                  <p className="text-[10px] text-indigo-500 font-medium uppercase tracking-widest mt-0.5">Ready to capture</p>
               </div>
            </div>
            <button onClick={clearFile} className="p-2 bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-200 transition-colors">
               <X size={16} />
            </button>
         </div>
      )}

      <form onSubmit={handleSend} className="flex gap-4 items-end relative">
        <div className="flex-1 relative flex items-center">
           <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute left-4 p-2 text-slate-400 hover:text-indigo-600 transition-colors"
           >
             <Paperclip size={20} />
           </button>
           <input 
             type="file" 
             hidden 
             ref={fileInputRef} 
             onChange={handleFileChange}
             accept="image/*,.pdf,.doc,.docx"
           />
           <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Message group..."
            className="w-full pl-14 pr-16 py-4 bg-slate-50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all outline-none text-sm resize-none h-[56px] min-h-[56px] max-h-[150px]"
            rows={1}
            disabled={sending}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                }
            }}
           />
           <div className="absolute right-4 flex items-center gap-2">
               <button type="button" className="p-2 text-slate-300 cursor-not-allowed">
                   <ImageIcon size={18} />
               </button>
           </div>
        </div>
        
        <button
          type="submit"
          disabled={sending || (!newMessage.trim() && !selectedFile)}
          className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-90 transition-all disabled:opacity-50"
        >
          {sending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Send size={24} />
          )}
        </button>
      </form>
      <p className="text-[10px] text-center text-slate-300 mt-4 uppercase tracking-[0.2em] font-black">Secure Core Sync Active</p>
    </div>
  );
};

export default ChatInput;
