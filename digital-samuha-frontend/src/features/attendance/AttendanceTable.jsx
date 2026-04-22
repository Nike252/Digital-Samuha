import React from 'react';

const AttendanceTable = ({ 
  attendance, 
  STATUS_OPTIONS, 
  canEdit, 
  handleStatusChange, 
  handleFineChange 
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-50/50">
          <tr>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Member</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Fine (NPR)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {attendance.map(record => (
            <tr key={record.id} className="hover:bg-gray-50/30 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                    {record.user_details?.full_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 underline decoration-indigo-100 decoration-2 underline-offset-4">{record.user_details?.full_name}</div>
                    <div className="text-[10px] font-bold text-gray-400 tracking-wider ">{record.user_details?.phone}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-center gap-1">
                  {STATUS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => canEdit && handleStatusChange(record.id, opt.value, record.user)}
                      disabled={!canEdit}
                      className={`p-2 rounded-lg transition-all flex items-center gap-2 ${
                        record.status === opt.value 
                        ? opt.color + ' ring-1 ring-inset ' + opt.color.replace('bg-', 'ring-').replace('text-', '')
                        : 'text-gray-400 hover:bg-gray-50'
                      } ${!canEdit ? 'cursor-not-allowed opacity-70' : ''}`}
                      title={opt.label}
                    >
                      <opt.icon size={18} />
                      {record.status === opt.value && <span className="text-[10px] font-bold uppercase">{opt.label}</span>}
                    </button>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs font-bold">NPR</span>
                  <input 
                    type="number" 
                    value={record.fine_amount}
                    onChange={(e) => canEdit && handleFineChange(record.id, e.target.value, record.user)}
                    disabled={!canEdit}
                    className={`w-24 px-3 py-1.5 border border-gray-100 bg-gray-50/50 rounded-lg text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all ${
                      !canEdit ? 'cursor-not-allowed opacity-70' : ''
                    }`}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTable;
