import React from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { toBS } from '../../utils/nepaliDateUtils';

const MeetingReportModal = ({ isOpen, onClose, selectedReport }) => {
  if (!isOpen || !selectedReport) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-[32px] sm:rounded-[48px] shadow-2xl p-6 sm:p-12 animate-in zoom-in-95 duration-300">
         <button onClick={onClose} className="absolute top-4 right-4 sm:top-8 sm:right-8 p-3 hover:bg-gray-100 rounded-2xl transition-all group z-50">
            <X size={20} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
         </button>

         <div className="mb-8 sm:mb-12 pr-10 sm:pr-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4">
              <div className="px-3 py-1 sm:px-4 sm:py-1.5 bg-amber-50 text-amber-600 rounded-full text-[10px] sm:text-xs font-black tracking-widest uppercase">Meeting Record Sheet</div>
              <div className="hidden sm:block text-gray-400 font-bold">•</div>
              <div className="text-gray-500 font-bold text-xs sm:text-base">{toBS(selectedReport.meeting_details.date)}</div>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 leading-tight">{selectedReport.meeting_details.title}</h2>
         </div>

         {/* The "Sheet" Table - Enabled Horizontal Scroll for Mobile */}
         <div className="bg-white border-2 border-gray-100 rounded-2xl sm:rounded-[32px] overflow-hidden mb-8 shadow-sm">
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse min-w-[700px] sm:min-w-0">
               <thead>
                 <tr className="bg-gray-900 text-white">
                   <th className="px-4 ps-6 py-4 text-[10px] font-black uppercase tracking-widest border-r border-gray-800">Member Name</th>
                   <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest border-r border-gray-800 text-center">Status</th>
                   <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest border-r border-gray-800 text-right">Savings</th>
                   <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest border-r border-gray-800 text-right">Interest</th>
                   <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest border-r border-gray-800 text-right">Repayment</th>
                   <th className="px-4 pe-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Fine</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {selectedReport.members_data.map((m, idx) => (
                   <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}>
                     <td className="px-4 ps-6 py-4 border-r border-gray-100">
                       <p className="font-bold text-sm sm:text-base text-gray-900">{m.name}</p>
                       <p className="text-[10px] text-gray-400 font-black">{m.phone}</p>
                     </td>
                     <td className="px-4 py-4 border-r border-gray-100 text-center">
                       <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${
                         m.status === 'present' ? 'bg-emerald-100 text-emerald-700' :
                         m.status === 'absent' ? 'bg-rose-100 text-rose-700' :
                         m.status === 'late' ? 'bg-amber-100 text-amber-700' :
                         'bg-gray-100 text-gray-400'
                       }`}>
                         {m.status}
                       </span>
                     </td>
                     <td className="px-4 py-4 border-r border-gray-100 text-right font-black text-gray-700">
                       {m.savings > 0 ? `NPR ${m.savings}` : '-'}
                     </td>
                     <td className="px-4 py-4 border-r border-gray-100 text-right font-black text-gray-700">
                       {m.interest > 0 ? `NPR ${m.interest}` : '-'}
                     </td>
                     <td className="px-4 py-4 border-r border-gray-100 text-right font-black text-indigo-600">
                       {m.repayment > 0 ? `NPR ${m.repayment}` : '-'}
                     </td>
                     <td className="px-4 pe-6 py-4 text-right font-black text-rose-500">
                       {m.fine > 0 ? `NPR ${m.fine}` : '-'}
                     </td>
                   </tr>
                 ))}
               </tbody>
               <tfoot className="bg-indigo-50/50 border-t-2 border-indigo-100">
                 <tr className="font-black text-indigo-900 whitespace-nowrap">
                   <td colSpan="2" className="px-4 ps-6 py-4 text-right uppercase tracking-widest text-[10px] sm:text-xs border-r border-indigo-100">Total Collections</td>
                   <td className="px-4 py-4 text-right border-r border-indigo-100 whitespace-nowrap">NPR {selectedReport.financials.savings.toLocaleString()}</td>
                   <td className="px-4 py-4 text-right border-r border-indigo-100 whitespace-nowrap">NPR {selectedReport.financials.interest.toLocaleString()}</td>
                   <td className="px-4 py-4 text-right border-r border-indigo-100 whitespace-nowrap">NPR {selectedReport.financials.repayments.toLocaleString()}</td>
                   <td className="px-4 pe-6 py-4 text-right text-rose-600 whitespace-nowrap">NPR {selectedReport.attendance.fines_collected.toLocaleString()}</td>
                 </tr>
               </tfoot>
             </table>
           </div>
         </div>

         <div className="bg-gray-50 border-2 border-gray-100 rounded-3xl sm:rounded-[40px] p-6 sm:p-10 mb-6 font-medium">
            <div className="flex items-center gap-3 mb-4 sm:mb-6 leading-none">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm shrink-0">
                <FileText size={18} />
              </div>
              <h4 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-widest">Meeting Minutes</h4>
            </div>
            <p className="text-base sm:text-xl text-gray-600 leading-relaxed italic">
              "{selectedReport.meeting_details.description || "Official records for this session."}"
            </p>
         </div>

         <button 
          onClick={() => window.print()}
          className="w-full mt-6 sm:mt-10 py-4 sm:py-6 bg-gray-900 text-white rounded-2xl sm:rounded-[32px] font-black text-base sm:text-xl flex items-center justify-center gap-4 hover:bg-black transition-all shadow-xl"
         >
           <Printer size={20} className="sm:w-6 sm:h-6" />
           Print Formal Report
         </button>
      </div>
    </div>
  );
};

export default MeetingReportModal;
