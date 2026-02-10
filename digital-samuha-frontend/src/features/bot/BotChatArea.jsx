import React from 'react';
import { User, Bot, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const BotChatArea = ({ 
  messages, 
  isTyping, 
  newMessage, 
  setNewMessage, 
  handleSend, 
  messagesEndRef 
}) => {
  return (
    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col mb-4 min-h-0">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 bg-slate-50/30 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 sm:gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-md transition-transform hover:scale-110 ${msg.sender === 'user' ? 'bg-white border border-gray-200' : 'bg-indigo-600'}`}>
              {msg.sender === 'user' ? <User size={18} className="text-indigo-600" /> : <Bot size={18} className="text-white" />}
            </div>
            <div className={`flex flex-col max-w-[85%] sm:max-w-[80%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-3.5 sm:p-4 rounded-3xl text-sm leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : msg.isError ? 'bg-red-50 text-red-600 border border-red-100 rounded-tl-none italic' : 'bg-white text-slate-700 border border-gray-100 rounded-tl-none'}`}>
                {msg.sender === 'bot' && !msg.isError ? (
                  <div className="font-medium">
                    <ReactMarkdown 
                      components={{
                        strong: ({node, ...props}) => <span className="font-extrabold text-indigo-900" {...props} />,
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                ) : (
                  msg.text
                )}
              </div>
              <span className="text-[10px] text-gray-400 mt-1.5 px-2 font-medium">{msg.time}</span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex-shrink-0 flex items-center justify-center shadow-md"><Bot size={20} className="text-white" /></div>
            <div className="bg-white border border-gray-100 p-4 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 sm:p-4 bg-white border-t border-gray-50">
        <form onSubmit={handleSend} className="flex gap-2 sm:gap-3 relative">
          <input 
            type="text" 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)} 
            placeholder="Ask about your loans, next meeting, or group rules..." 
            className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50/50 transition-all outline-none text-gray-900 placeholder-slate-400 text-sm min-w-0" 
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim() || isTyping} 
            className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white hover:bg-indigo-700 active:scale-90 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:shadow-none shrink-0"
          >
            <Send size={22} className={isTyping ? 'animate-pulse' : ''} />
          </button>
        </form>
        <p className="text-[9px] sm:text-[10px] text-gray-400 text-center mt-3 uppercase tracking-widest font-bold">Powered by Cerebro Engine • Google Gemini 1.5</p>
      </div>
    </div>
  );
};

export default BotChatArea;
