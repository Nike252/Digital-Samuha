import React from 'react';
import { X, FileText, Download, User, Wallet, PieChart, Info, ShieldAlert } from 'lucide-react';
import Button from '../../components/ui/Button';

const PayoutReportModal = ({ isOpen, onClose, data, onConfirm, confirmText, title, subtitle }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 border border-white/20">
        
        {/* Header Section */}
        <div className="p-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-700 text-white relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                   <FileText size={24} />
                </div>
                <h3 className="text-2xl font-black tracking-tight">{title}</h3>
              </div>
              <p className="text-purple-100 text-sm font-medium pl-11">{subtitle}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/10">
               <p className="text-xs font-bold text-purple-200 uppercase tracking-widest mb-1">Total Available Fund</p>
               <p className="text-3xl font-black">NPR {data.total_fund?.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/10">
               <p className="text-xs font-bold text-purple-200 uppercase tracking-widest mb-1">Total Members</p>
               <p className="text-3xl font-black">{data.member_count}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/10">
               <p className="text-xs font-bold text-purple-200 uppercase tracking-widest mb-1">Profit Share Per Member</p>
               <p className="text-3xl font-black">NPR {data.share_of_profit?.toLocaleString()}</p>
            </div>
          </div>

          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
        </div>

        {/* Action Bar (Top) */}
        <div className="px-8 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
           <div className="flex items-center gap-2 text-gray-500">
             <Info size={16} className="text-indigo-500" />
             <span className="text-xs font-bold uppercase tracking-tight">Financial Breakdown Table</span>
           </div>
           <Button variant="outline" className="text-xs h-9 gap-2 border-gray-200 hover:bg-white">
             <Download size={14} /> Export CSV
           </Button>
        </div>

        {/* Table Content */}
        <div className="p-0 overflow-x-auto max-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-20">
              <tr className="bg-white border-b border-gray-100 shadow-sm">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-wider">Member Name</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Savings (Rs)</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Fines Paid (Rs)</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Interest (Rs)</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Dividend (Rs)</th>
                <th className="px-8 py-5 text-[10px] font-black text-indigo-500 uppercase tracking-wider text-right">Total Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.members?.map((m, idx) => (
                <tr key={m.id} className={`group hover:bg-indigo-50/30 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                        {m.name.charAt(0)}
                      </div>
                      <span className="font-bold text-gray-900">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-600">{Number(m.savings).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-medium text-rose-500">{Number(m.fines).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-medium text-amber-600">{Number(m.interest).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-medium text-emerald-600">{Number(m.dividend).toLocaleString()}</td>
                  <td className="px-8 py-4 text-right">
                    <span className="font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl">
                      Rs {Number(m.total_payout).toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
           <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 max-w-md">
             <ShieldAlert className="text-amber-600 shrink-0" size={20} />
             <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
               <strong>Financial Integrity Lock:</strong> This report is a snapshot of the current treasury. 
               Distribution is only allowed when no active loans exist.
             </p>
           </div>
           <div className="flex gap-4 w-full sm:w-auto">
             <Button variant="secondary" onClick={onClose} className="px-8 rounded-2xl border-gray-200">
               Close Report
             </Button>
             <Button variant="primary" onClick={onConfirm} className="px-10 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-100 hover:bg-indigo-700">
               {confirmText}
             </Button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PayoutReportModal;
