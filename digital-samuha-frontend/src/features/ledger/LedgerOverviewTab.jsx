import React from 'react';
import { History, Filter, Search, ArrowUpRight, ArrowDownLeft, Trash2 } from 'lucide-react';

const LedgerOverviewTab = ({ transactions, highlightedTxId, txRefs, userRole, onDeleteTransaction }) => (
  <div className="p-4 sm:p-8">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <History className="text-indigo-500" size={20} />
        Recent Transactions
      </h3>
      <div className="flex gap-3 w-full sm:w-auto">
        <button className="p-2.5 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 transition-colors">
          <Filter size={20} />
        </button>
        <div className="relative flex-1 sm:flex-none">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search history..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
          />
        </div>
      </div>
    </div>

    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 bg-white">
            <th className="py-4 px-4 whitespace-nowrap">Type</th>
            <th className="py-4 px-4 whitespace-nowrap">Member</th>
            <th className="py-4 px-4 whitespace-nowrap">Description</th>
            <th className="py-4 px-4 whitespace-nowrap">Amount</th>
            <th className="py-4 px-4 whitespace-nowrap w-48">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 bg-white">
          {transactions.map(tx => (
            <tr
              key={tx.id}
              ref={(el) => txRefs.current[tx.id] = el}
              className={`group hover:bg-gray-50 transition-all ${
                highlightedTxId === tx.id
                  ? 'bg-yellow-50 border-2 border-yellow-400 animate-pulse'
                  : ''
              }`}
            >
              <td className="py-4 px-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg shrink-0 ${
                    tx.type === 'saving' ? 'bg-emerald-50 text-emerald-600' :
                    tx.type === 'loan_disbursement' ? 'bg-amber-50 text-amber-600' :
                    'bg-indigo-50 text-indigo-600'
                  }`}>
                    {tx.type === 'saving' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </div>
                  <span className="font-bold text-gray-900 text-sm capitalize whitespace-nowrap">{tx.type.replace('_', ' ')}</span>
                </div>
              </td>
              <td className="py-4 px-4 font-medium text-gray-700 text-sm whitespace-nowrap">
                {tx.user_details?.full_name || 'System'}
              </td>
              <td className="py-4 px-4 text-gray-500 text-sm min-w-[250px] whitespace-nowrap">
                {tx.description}
              </td>
              <td className={`py-4 px-4 font-bold text-sm whitespace-nowrap ${
                ['loan_disbursement', 'expense'].includes(tx.type) ? 'text-rose-600' : 'text-emerald-600'
              }`}>
                {['loan_disbursement', 'expense'].includes(tx.type) ? '-' : '+'} NPR {tx.amount}
              </td>
              <td className="py-4 px-4 whitespace-nowrap">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-500 text-sm">{tx.date}</span>
                  {userRole === 'adhakshya' && (
                    !['loan_disbursement', 'loan_repayment'].includes(tx.type) ? (
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all shrink-0"
                        title="Delete Transaction"
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : (
                      <div className="p-2 text-gray-300" title="System Protected Transaction">
                        <Trash2 size={16} className="opacity-30" />
                      </div>
                    )
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

export default LedgerOverviewTab;
