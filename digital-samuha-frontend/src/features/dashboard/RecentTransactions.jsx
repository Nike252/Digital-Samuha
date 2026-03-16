import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';

const TRANSACTIONS = [
  { id: 1, user: 'Ram Bahadur', type: 'saving', amount: 'Rs. 500', date: '2 mins ago', status: 'completed' },
  { id: 2, user: 'Sita Sharma', type: 'loan_repayment', amount: 'Rs. 2,000', date: '1 hour ago', status: 'completed' },
  { id: 3, user: 'Hari Krishna', type: 'loan_request', amount: 'Rs. 50,000', date: '3 hours ago', status: 'pending' },
  { id: 4, user: 'Gita Rai', type: 'saving', amount: 'Rs. 500', date: '5 hours ago', status: 'completed' },
  { id: 5, user: 'Nabin Thapa', type: 'fine', amount: 'Rs. 50', date: '1 day ago', status: 'completed' },
];

const RecentTransactions = ({ transactions = [] }) => {
    // Only show latest 5
    const displayList = transactions.slice(0, 5);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
                <button className="text-sm text-indigo-600 hover:text-indigo-800 font-bold">View All</button>
            </div>
            
            <div className="space-y-3">
                {displayList.length > 0 ? displayList.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                tx.type === 'saving' ? 'bg-emerald-50 text-emerald-600' :
                                tx.type === 'loan_repayment' ? 'bg-sky-50 text-sky-600' :
                                tx.type === 'loan_request' ? 'bg-amber-50 text-amber-600' :
                                tx.type === 'loan_disbursement' ? 'bg-rose-50 text-rose-600' :
                                'bg-indigo-50 text-indigo-600'
                            }`}>
                                {tx.type === 'saving' && <ArrowUpRight size={18} />}
                                {tx.type === 'loan_repayment' && <ArrowDownLeft size={18} />}
                                {tx.type === 'loan_request' && <Clock size={18} />}
                                {tx.type === 'loan_disbursement' && <ArrowUpRight size={18} />}
                                {['fine', 'expense'].includes(tx.type) && <span className="font-bold text-xs">!</span>}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">{tx.user_details?.full_name || 'System'}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{tx.type.replace('_', ' ')}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`text-sm font-black ${
                                ['saving', 'loan_repayment', 'interest', 'fine'].includes(tx.type) ? 'text-emerald-600' : 'text-rose-600'
                            }`}>
                                {['saving', 'loan_repayment', 'interest', 'fine'].includes(tx.type) ? '+' : '-'} Rs. {tx.amount}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium">{tx.date}</p>
                        </div>
                    </div>
                )) : (
                    <div className="py-8 text-center text-gray-400">
                        <p className="text-xs italic">No activity recorded yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentTransactions;
