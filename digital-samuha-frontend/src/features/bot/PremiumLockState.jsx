import React from 'react';
import { Lock, Sparkles, ShieldCheck, MessageSquare, Bot, Zap } from 'lucide-react';

const PremiumLockState = ({ onUpgrade }) => {
  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden max-w-2xl w-full flex flex-col md:flex-row shadow-indigo-100">
        <div className="md:w-1/2 bg-indigo-600 p-8 text-white flex flex-col justify-center relative overflow-hidden">
           <div className="relative z-10">
              <div className="bg-white/20 p-3 rounded-2xl w-fit mb-6">
                <Lock size={32} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Unlock Cerebro</h2>
              <p className="text-indigo-100 text-sm leading-relaxed mb-6">
                Our AI assistant is a premium feature designed to give you deep insights into your Samuha's growth and health.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={18} className="text-amber-300" />
                  <span className="text-sm">Personalized Financial Advice</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck size={18} className="text-emerald-300" />
                  <span className="text-sm">Automated Rule Enforcement</span>
                </div>
                <div className="flex items-center gap-3">
                  <MessageSquare size={18} className="text-sky-300" />
                  <span className="text-sm">Bilingual Support (NP/EN)</span>
                </div>
              </div>
           </div>
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        </div>
        
        <div className="md:w-1/2 p-10 flex flex-col justify-center items-center text-center">
           <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
              <Bot size={40} />
           </div>
           <h3 className="text-xl font-bold text-gray-900 mb-2">Power up Your Samuha</h3>
           <p className="text-gray-500 text-sm mb-8">
             Upgrade to the Premium Plan to communicate directly with your data.
           </p>
           <button 
            onClick={onUpgrade}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 group"
           >
             <Zap size={20} className="fill-current" />
             <span>Upgrade Now</span>
           </button>
           <p className="mt-4 text-[10px] text-gray-400 uppercase tracking-widest font-bold">Standard 1-Year License</p>
        </div>
      </div>
    </div>
  );
};

export default PremiumLockState;
