import React from 'react';
import { MessageCircle, FileText, Download } from 'lucide-react';

const ChatMessages = ({ messages, user, getAvatarColor, loading, messagesEndRef }) => {
  if (loading) {
     return (
        <div className="flex-1 flex items-center justify-center">
           <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
     );
  }

  if (messages.length === 0) {
     return (
        <div className="flex-1 flex flex-col items-center justify-center opacity-40 grayscale">
           <MessageCircle size={60} className="mb-4 text-indigo-300" />
           <p className="font-bold text-lg">No messages in {user?.samuha?.name || 'Group'}</p>
           <p className="text-xs">Send a text or file to start the conversation.</p>
        </div>
     );
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 bg-slate-50/30">
      {messages.map((msg, idx) => {
        const isOwn = msg.sender_id === user.id;
        const prevMsg = idx > 0 ? messages[idx-1] : null;
        const showAvatar = idx === 0 || prevMsg.sender_id !== msg.sender_id || prevMsg.type === 'system';
        
        if (msg.type === 'system') {
          return (
            <div key={msg.id} className="flex justify-center my-4">
              <div className="bg-slate-100/50 px-4 py-1.5 rounded-full border border-slate-200/50">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{msg.content}</p>
              </div>
            </div>
          );
        }

        return (
          <div key={msg.id} className={`flex gap-4 ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end group`}>
            <div className="w-10 flex-shrink-0 mb-1">
              {showAvatar && !isOwn && (
                 <div className={`w-10 h-10 rounded-2xl ${getAvatarColor(msg.sender_name)} flex items-center justify-center text-white font-black text-xs shadow-md border-2 border-white`}>
                    {msg.sender_name[0].toUpperCase()}
                 </div>
              )}
            </div>

            <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
              {!isOwn && showAvatar && (
                <p className="text-[10px] font-black text-slate-500 mb-2 mt-2 uppercase tracking-widest pl-2">
                  {msg.sender_name}
                </p>
              )}
              <div className={`p-4 rounded-3xl shadow-sm transition-all hover:shadow-md ${isOwn ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'}`}>
                {msg.attachment && (
                  <div className="mb-3 rounded-2xl overflow-hidden border border-black/5 bg-black/5">
                    {msg.attachment_type === 'image' ? (
                      <img src={msg.attachment} alt="Attachment" className="max-w-full h-auto max-h-[300px] object-cover cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(msg.attachment, '_blank')} />
                    ) : (
                      <a href={msg.attachment} target="_blank" rel="noreferrer" className={`flex items-center gap-4 p-4 ${isOwn ? 'text-indigo-100' : 'text-slate-600'}`}>
                        <div className={`p-3 rounded-xl ${isOwn ? 'bg-indigo-500' : 'bg-slate-100'}`}><FileText size={24} /></div>
                        <div className="min-w-0"><p className="text-xs font-bold truncate">Document Attachment</p><p className="text-[10px] opacity-70 flex items-center gap-1 mt-1"><Download size={10} /> Download File</p></div>
                      </a>
                    )}
                  </div>
                )}
                {msg.content && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
                <div className={`flex items-center gap-2 mt-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                   <p className="text-[9px] font-medium opacity-60">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                   {isOwn && <div className="w-1 h-1 bg-white/40 rounded-full"></div>}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
