import React from 'react';
import { User, Calendar } from 'lucide-react';

const SamuhaRegistryTable = ({ 
  activeTab, 
  data, 
  updatingId, 
  handleToggleStatus, 
  setSelectedSamuha 
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#15181e] text-gray-500 text-xs uppercase font-bold tracking-wider">
            <th className="px-6 py-4">Samuha Name</th>
            <th className="px-6 py-4">Adhakshya</th>
            <th className="px-6 py-4">Status</th>
            {activeTab === 'management' && <th className="px-6 py-4">Samuha Code</th>}
            <th className="px-6 py-4">Date Joined</th>
            <th className="px-6 py-4 text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {data.map((s) => (
            <tr key={s.id} className="hover:bg-[#1f232b] transition-colors group">
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20">
                    {s.samuha_name.charAt(0)}
                  </div>
                  <span className="font-semibold text-white">{s.samuha_name}</span>
                </div>
              </td>
              <td className="px-6 py-5 text-gray-400">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-200">{s.adhakshya_full_name}</span>
                  <span className="text-xs flex items-center gap-1"><User size={12} /> {s.adhakshya_phone}</span>
                </div>
              </td>
              <td className="px-6 py-5">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  s.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                  s.status === 'pending' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 
                  'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {s.status}
                </span>
              </td>
              {activeTab === 'management' && (
                <td className="px-6 py-5 text-gray-400 font-mono text-xs">
                  {s.samuha_code}
                </td>
              )}
              <td className="px-6 py-5 text-gray-500 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar size={14} /> {new Date(s.created_at).toLocaleDateString()}
                </div>
              </td>
              <td className="px-6 py-5 text-center">
                {activeTab === 'pending' ? (
                  <button 
                    onClick={() => setSelectedSamuha(s)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                  > Review </button>
                ) : (
                  <button 
                    disabled={updatingId === s.id}
                    onClick={() => handleToggleStatus(s)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all active:scale-95 ${
                      s.status === 'active' 
                      ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20' 
                      : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20'
                    }`}
                  >
                    {updatingId === s.id ? '...' : (s.status === 'active' ? 'Suspend' : 'Activate')}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SamuhaRegistryTable;
