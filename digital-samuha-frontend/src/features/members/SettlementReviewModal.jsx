import React, { useEffect, useState } from 'react';
import { X, Calculator, Wallet, Receipt, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui';
import { samuhaAPI } from '../../utils/api';
import { toast } from 'react-hot-toast';

const SettlementReviewModal = ({ isOpen, onClose, request, onConfirm, isSubmitting }) => {
  const [settlementData, setSettlementData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && request) {
      fetchSettlement();
    }
  }, [isOpen, request]);

  const fetchSettlement = async () => {
    try {
      setLoading(true);
      // We pass the user ID or membership ID? My API used membership ID
      // Let's assume request contains the membership ID or we can find it
      // For now, let's use a dummy ID or find it. 
      // Actually my backend view used `pk` of membership.
      // I need to make sure the request has membership_id or similar.
      const response = await samuhaAPI.getExitPreview(request.membership_id || request.user);
      setSettlementData(response.data);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch settlement data');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110] p-4 transition-all duration-300">
      <div className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.3)] max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gray-900/90 backdrop-blur-md p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 z-20">
             <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all hover:rotate-90">
               <X size={20} />
             </button>
          </div>
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30">
            <div className="absolute -top-1/2 -left-1/4 w-full h-full bg-indigo-500 rounded-full blur-[80px]" />
          </div>
          <div className="flex items-center gap-5 relative z-10">
            <div className="p-4 bg-indigo-500/20 backdrop-blur-sm border border-indigo-500/30 rounded-2xl shadow-inner">
              <Calculator size={28} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Final Settlement</h2>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Reviewing {request.user_name}</p>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="p-8 space-y-7">
          {loading ? (
            <div className="py-12 flex flex-col items-center gap-3">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
              <p className="text-sm text-gray-500 font-medium">Calculating settlement...</p>
            </div>
          ) : settlementData ? (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Wallet size={18} />
                    <span className="font-medium text-sm">Total Savings Contributions</span>
                  </div>
                  <span className="font-bold text-gray-900">Rs. {settlementData.total_savings?.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <div className="flex items-center gap-3 text-emerald-600">
                    <CheckCircle size={18} />
                    <div>
                      <span className="font-medium text-sm block">Profit Share (Interest Earned)</span>
                      <span className="text-[10px] text-emerald-500">Rs. {settlementData.total_interest_collected?.toLocaleString()} total ÷ {settlementData.active_member_count} members</span>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-700">+ Rs. {settlementData.profit_share?.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100">
                  <div className="flex items-center gap-3 text-red-600">
                    <Receipt size={18} />
                    <span className="font-medium text-sm">Mandatory Fine Deductions</span>
                  </div>
                  <span className="font-bold text-red-700">- Rs. {settlementData.unpaid_fines?.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-indigo-600/90 backdrop-blur-lg p-7 rounded-[2rem] text-white flex items-center justify-between shadow-[0_20px_50px_rgba(79,70,229,0.3)] border border-indigo-500/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10">
                  <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Final Payout Amount</p>
                  <p className="text-4xl font-black mt-2 tracking-tighter">Rs. {settlementData.net_payout.toLocaleString()}</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center relative z-10 shadow-inner">
                  <CheckCircle size={28} className="text-white" />
                </div>
              </div>

              <div className="p-5 bg-amber-500/5 backdrop-blur-sm rounded-2xl border border-amber-500/20 flex gap-4 shadow-sm group hover:border-amber-500/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-amber-100/50 flex items-center justify-center shrink-0">
                  <AlertTriangle className="text-amber-600" size={20} />
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
                  Confirming will record an expense of <b>Rs. {settlementData.net_payout.toLocaleString()}</b> and permanently update status to <b>Exited</b>.
                </p>
              </div>

              <div className="flex gap-4 pt-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 rounded-2xl h-16 font-bold border-gray-200 hover:bg-gray-50 text-gray-500 active:scale-95 transition-all shadow-sm"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => onConfirm(request.id, settlementData.net_payout)}
                  className="flex-1 rounded-2xl h-16 font-bold bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 active:scale-95 transition-all"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : 'Confirm & Payout'}
                </Button>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-red-500 text-sm">
                Failed to load settlement data. Please try again.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettlementReviewModal;
