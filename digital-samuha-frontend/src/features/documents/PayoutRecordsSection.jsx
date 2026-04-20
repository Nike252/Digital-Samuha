import React from 'react';
import { Landmark, FileDown, Trash2 } from 'lucide-react';
import { toBS } from '../../utils/nepaliDateUtils';

const PayoutRecordsSection = ({ documents, handleDelete, isAdhakshya }) => {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm animate-in fade-in duration-500">
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-4">
          <Landmark size={32} />
        </div>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No Payout Records Yet</p>
        <p className="text-gray-400 text-[10px] mt-1 font-medium">Payout distributions and dissolution reports will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc) => (
          <div key={doc.id} className="group bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                  <Landmark size={24} />
                </div>
                <h4 className="text-lg font-black text-gray-900 mb-1 leading-tight">{doc.title}</h4>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4">Official PDF Record</p>
                <p className="text-gray-500 text-sm font-medium line-clamp-2 mb-6">{doc.description || 'Verified payout report for organizational records.'}</p>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Issued Date</span>
                  <span className="text-xs font-bold text-gray-700">{toBS(doc.created_at)} BS</span>
                </div>
                <div className="flex gap-2">
                   <a 
                    href={doc.file} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 bg-gray-900 text-white rounded-xl shadow-lg hover:bg-gray-800 transition-colors"
                   >
                     <FileDown size={18} />
                   </a>
                   {isAdhakshya && (
                     <button 
                      onClick={() => handleDelete(doc.id)}
                      className="p-3 bg-white text-gray-400 hover:text-rose-600 hover:bg-rose-50 border border-gray-100 rounded-xl transition-all"
                     >
                       <Trash2 size={18} />
                     </button>
                   )}
                </div>
              </div>
            </div>

            {/* Decorative background logo */}
            <Landmark size={120} className="absolute -right-8 -bottom-8 text-gray-50 opacity-50 group-hover:scale-110 transition-transform duration-500" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PayoutRecordsSection;
