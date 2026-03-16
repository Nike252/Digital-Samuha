import React from 'react';

const UpgradeCTA = ({ onUpgrade }) => {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-xl shadow-2xl p-6 text-white border border-slate-700 relative overflow-hidden flex flex-col justify-between">
      <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
              <span className="bg-amber-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">Premium</span>
              <h3 className="text-lg font-bold">Upgrade to Digital Office</h3>
          </div>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              unlock **Virtual Meetings**, **Dynamic QR Payments**, and **AI Ledger Sync** for your Samuha.
          </p>
          <div className="space-y-3 mb-8">
              <div className="flex items-center gap-2 text-xs text-slate-300"><span className="text-emerald-400">✔️</span> Integrated Video Calls</div>
              <div className="flex items-center gap-2 text-xs text-slate-300"><span className="text-emerald-400">✔️</span> Auto-filling QR Transactions</div>
          </div>
      </div>
      <button onClick={onUpgrade} className="relative z-10 w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all shadow-xl shadow-indigo-950/40">Upgrade Now</button>
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
    </div>
  );
};

export default UpgradeCTA;
