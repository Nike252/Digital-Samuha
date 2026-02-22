import React from 'react';
import { Search, FileText, Download, Trash2 } from 'lucide-react';

const ArchiveSection = ({ 
  searchTerm, 
  setSearchTerm, 
  documents, 
  isAdhakshya, 
  handleDelete 
}) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto w-full">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Document</th>
              <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Category</th>
              <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Date</th>
              <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {documents.filter(d => d.title.toLowerCase().includes(searchTerm.toLowerCase())).map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 leading-tight truncate max-w-[200px] sm:max-w-xs">{doc.title}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{doc.file_size}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                    {doc.category.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm font-medium whitespace-nowrap">
                  {new Date(doc.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    <a 
                      href={doc.file} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    >
                      <Download size={18} />
                    </a>
                    {isAdhakshya && (
                      <button 
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ArchiveSection;
