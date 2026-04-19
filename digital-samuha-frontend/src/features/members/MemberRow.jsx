import { Phone, Mail, UserCheck, UserMinus, X, ShieldCheck } from 'lucide-react';

const STATUS_COLORS = {
  active: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  inactive: 'bg-gray-100 text-gray-700',
  rejected: 'bg-red-100 text-red-700',
  exited: 'bg-rose-100 text-rose-700',
};

const MemberRow = ({ m, isAdmin, handleUpdateStatus, onVerify }) => {
  const isExited = m.status === 'exited';

  return (
    <tr key={m.membership_id} className={`hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0 ${isExited ? 'opacity-75' : ''}`}>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isExited ? 'bg-gray-100 text-gray-400' : 'bg-indigo-50 text-indigo-600'}`}>
            {m.full_name.charAt(0)}
          </div>
          <div className="whitespace-nowrap">
            <div className={`font-semibold ${isExited ? 'text-gray-500 line-through decoration-gray-300' : 'text-gray-900'}`}>{m.full_name}</div>
            <div className="text-xs text-gray-500">{m.role_display}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-600 space-y-1 whitespace-nowrap">
          <div className="flex items-center gap-2"><Phone size={12} className="text-gray-400" /> {m.phone}</div>
          {m.email && <div className="flex items-center gap-2"><Mail size={12} className="text-gray-400" /> {m.email}</div>}
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[m.status] || 'bg-gray-50 text-gray-400'}`}>
          {m.status_display || m.status}
        </span>
      </td>
      {isAdmin && (
        <td className="px-6 py-4 text-right">
          <div className="flex justify-end gap-2">
            {!isExited && (
              <>
                <button onClick={() => onVerify(m)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors" title="View Identity Details">
                  <ShieldCheck size={18} />
                </button>

                {m.status === 'pending' && (
                  <>
                    <button onClick={() => handleUpdateStatus(m.membership_id, 'active')} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors" title="Approve">
                      <UserCheck size={18} />
                    </button>
                    {m.role !== 'adhakshya' && (
                      <button onClick={() => handleUpdateStatus(m.membership_id, 'rejected')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="Reject">
                        <X size={18} />
                      </button>
                    )}
                  </>
                )}
                {m.status === 'active' && m.role !== 'adhakshya' && (
                  <button onClick={() => handleUpdateStatus(m.membership_id, 'inactive')} className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-colors" title="Deactivate">
                    <UserMinus size={18} />
                  </button>
                )}
                {m.status === 'inactive' && (
                  <button onClick={() => handleUpdateStatus(m.membership_id, 'active')} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors" title="Reactivate">
                    <UserCheck size={18} />
                  </button>
                )}
              </>
            )}
            {isExited && (
              <span className="text-[10px] font-bold text-gray-400 uppercase italic px-3">Archive Record</span>
            )}
          </div>
        </td>
      )}
    </tr>
  );
};

export default MemberRow;
