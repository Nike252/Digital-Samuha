import React from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { toBS } from '../../utils/nepaliDateUtils';

const MeetingReportModal = ({ isOpen, onClose, selectedReport }) => {
  if (!isOpen || !selectedReport) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[48px] shadow-2xl p-12 animate-in zoom-in-95 duration-300">
         <button onClick={onClose} className="absolute top-8 right-8 p-3 hover:bg-gray-100 rounded-2xl transition-all group">
            <X size={24} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
         </button>

         <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-xs font-black tracking-widest uppercase">Meeting Record Sheet</div>
              <div className="text-gray-400 font-bold">•</div>
              <div className="text-gray-500 font-bold">{toBS(selectedReport.meeting_details.date)}</div>
            </div>
            <h2 className="text-4xl font-black text-gray-900 leading-tight">{selectedReport.meeting_details.title}</h2>
         </div>

         {/* The "Sheet" Table */}
         <div className="bg-white border-2 border-gray-100 rounded-[32px] overflow-hidden mb-8 shadow-sm">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-gray-900 text-white">
                 <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r border-gray-800">Member Name</th>
                 <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r border-gray-800 text-center">Status</th>
                 <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r border-gray-800 text-right">Savings</th>
                 <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r border-gray-800 text-right">Interest</th>
                 <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r border-gray-800 text-right">Repayment</th>
                 <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Fine</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {selectedReport.members_data.map((m, idx) => (
                 <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}>
                   <td className="px-6 py-4 border-r border-gray-100">
                     <p className="font-bold text-gray-900">{m.name}</p>
                     <p className="text-[10px] text-gray-400 font-black">{m.phone}</p>
                   </td>
                   <td className="px-6 py-4 border-r border-gray-100 text-center">
                     <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${
                       m.status === 'present' ? 'bg-emerald-100 text-emerald-700' :
                       m.status === 'absent' ? 'bg-rose-100 text-rose-700' :
                       m.status === 'late' ? 'bg-amber-100 text-amber-700' :
                       'bg-gray-100 text-gray-400'
                     }`}>
                       {m.status}
                     </span>
                   </td>
                   <td className="px-6 py-4 border-r border-gray-100 text-right font-black text-gray-700">
                     {m.savings > 0 ? `NPR ${m.savings}` : '-'}
                   </td>
                   <td className="px-6 py-4 border-r border-gray-100 text-right font-black text-gray-700">
                     {m.interest > 0 ? `NPR ${m.interest}` : '-'}
                   </td>
                   <td className="px-6 py-4 border-r border-gray-100 text-right font-black text-indigo-600">
                     {m.repayment > 0 ? `NPR ${m.repayment}` : '-'}
                   </td>
                   <td className="px-6 py-4 text-right font-black text-rose-500">
                     {m.fine > 0 ? `NPR ${m.fine}` : '-'}
                   </td>
                 </tr>
               ))}
             </tbody>
             <tfoot className="bg-indigo-50/50 border-t-2 border-indigo-100">
               <tr className="font-black text-indigo-900">
                 <td colSpan="2" className="px-6 py-4 text-right uppercase tracking-widest text-xs border-r border-indigo-100">Total Collections</td>
                 <td className="px-6 py-4 text-right border-r border-indigo-100">NPR {selectedReport.financials.savings.toLocaleString()}</td>
                 <td className="px-6 py-4 text-right border-r border-indigo-100">NPR {selectedReport.financials.interest.toLocaleString()}</td>
                 <td className="px-6 py-4 text-right border-r border-indigo-100">NPR {selectedReport.financials.repayments.toLocaleString()}</td>
                 <td className="px-6 py-4 text-right text-rose-600">NPR {selectedReport.attendance.fines_collected.toLocaleString()}</td>
               </tr>
             </tfoot>
           </table>
         </div>

         <div className="bg-gray-50 border-2 border-gray-100 rounded-[40px] p-10 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm"><FileText size={20} /></div>
              <h4 className="text-lg font-black text-gray-900 uppercase tracking-widest text-sm">Meeting Minutes</h4>
            </div>
            <p className="text-xl text-gray-600 font-medium leading-relaxed italic">
              "{selectedReport.meeting_details.description || "Official records for this session."}"
            </p>
         </div>

         <button 
          onClick={() => window.print()}
          className="w-full mt-10 py-6 bg-gray-900 text-white rounded-[32px] font-black text-xl flex items-center justify-center gap-4 hover:bg-black transition-all shadow-2xl"
         >
           <Printer size={24} />
           Print Formal Report
         </button>
      </div>
    </div>
  );
};

export default MeetingReportModal;
