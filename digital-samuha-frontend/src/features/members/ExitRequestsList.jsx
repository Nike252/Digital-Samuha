import React from 'react';
import { UserMinus, CheckCircle, XCircle, FileText, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui';

const ExitRequestsList = ({ requests, loading, onProcess }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
        <p className="text-gray-400 font-medium">Fetching exit requests...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="p-4 bg-gray-50 rounded-full mb-4">
          <UserMinus size={40} className="text-gray-300" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">No pending exit requests</h3>
        <p className="text-sm text-gray-500 mt-1 max-w-xs">
          When members request to leave the Samuha, they will appear here for your review and settlement.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50/50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Member</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Reason</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Requested On</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {requests.map((request) => (
            <tr key={request.id} className="hover:bg-gray-50/50 transition-colors group">
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
                    {request.user_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">{request.user_name}</div>
                    <div className="text-xs text-gray-500 font-medium">{request.user_phone}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5 max-w-xs">
                <p className="text-sm text-gray-600 line-clamp-2 italic">
                  &quot;{request.reason}&quot;
                </p>
              </td>
              <td className="px-6 py-5 text-sm text-gray-500">
                {new Date(request.created_at).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' })}
              </td>
              <td className="px-6 py-5 text-right">
                <div className="flex items-center justify-end gap-2">
                  {request.status === 'pending' ? (
                    <>
                      <button 
                        onClick={() => onProcess(request, 'rejected')}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Reject Request"
                      >
                        <XCircle size={20} />
                      </button>
                      <Button 
                        variant="primary" 
                        size="sm"
                        className="rounded-xl flex items-center gap-2"
                        onClick={() => onProcess(request, 'approved')}
                      >
                        Settle & Exit <ArrowRight size={14} />
                      </Button>
                    </>
                  ) : (
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      request.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {request.status}
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExitRequestsList;
