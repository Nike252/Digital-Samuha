import React, { useState } from 'react';
import { Search, ChevronRight, FileText, Banknote } from 'lucide-react';
import LoanDetailsModal from './LoanDetailsModal';
import { toBS } from '../../utils/nepaliDateUtils';

const LoanRecordsSection = ({ loans }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoan, setSelectedLoan] = useState(null);

  const STATUS_COLORS = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-blue-100 text-blue-700',
    active: 'bg-indigo-100 text-indigo-700',
    rejected: 'bg-red-100 text-red-700',
    paid: 'bg-emerald-100 text-emerald-700'
  };

  const filteredLoans = (loans || []).filter(loan => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = loan.user_details?.full_name?.toLowerCase().includes(searchLower) || false;
    const statusMatch = loan.status?.toLowerCase().includes(searchLower) || false;
    const idMatch = loan.id?.toString().includes(searchLower) || false;
    return nameMatch || statusMatch || idMatch;
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex items-center mb-6">
        <div className="pl-4 pr-2 text-gray-400">
          <Search size={20} />
        </div>
        <input 
          type="text" 
          placeholder="Search loans by borrower, status, or ID..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700 placeholder-gray-400 py-3"
        />
      </div>

      {/* Loan List Wrapper */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-5 border-b border-gray-100 bg-gray-50/50">
          <div className="col-span-1 text-xs font-black text-gray-400 uppercase tracking-widest">ID</div>
          <div className="col-span-3 text-xs font-black text-gray-400 uppercase tracking-widest">Borrower</div>
          <div className="col-span-3 text-xs font-black text-gray-400 uppercase tracking-widest">Principal</div>
          <div className="col-span-2 text-xs font-black text-gray-400 uppercase tracking-widest">Date</div>
          <div className="col-span-2 text-xs font-black text-gray-400 uppercase tracking-widest">Status</div>
          <div className="col-span-1 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Details</div>
        </div>

        {/* Table Body */}
        {filteredLoans.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {filteredLoans.map(loan => (
              <div 
                key={loan.id} 
                className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-8 py-5 hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                onClick={() => setSelectedLoan(loan)}
              >
                <div className="col-span-1 text-xs font-bold text-gray-400">L-{loan.id.toString().padStart(4, '0')}</div>
                
                <div className="col-span-3">
                  <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{loan.user_details?.full_name || 'Unknown User'}</p>
                  <p className="text-xs text-gray-500 font-medium">{loan.user_details?.phone || ''}</p>
                </div>
                
                <div className="col-span-3">
                  <p className="font-black text-gray-900">NPR {parseFloat(loan.principal_amount).toLocaleString()}</p>
                </div>
                
                <div className="col-span-2 text-sm text-gray-600 font-medium">
                  {toBS(loan.applied_date)}
                </div>
                
                <div className="col-span-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${STATUS_COLORS[loan.status] || 'bg-gray-100 text-gray-600'}`}>
                    {loan.status}
                  </span>
                </div>
                
                <div className="col-span-1 flex justify-end">
                  <button className="p-2 text-gray-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 rounded-full transition-all">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-4">
              <Banknote size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No loan records found</h3>
            <p className="text-gray-500 text-sm mt-1 max-w-sm">No loans match your search criteria or the Samuha has not issued any loans yet.</p>
          </div>
        )}
      </div>

      <LoanDetailsModal 
        isOpen={!!selectedLoan} 
        onClose={() => setSelectedLoan(null)} 
        loan={selectedLoan} 
      />
    </div>
  );
};

export default LoanRecordsSection;
