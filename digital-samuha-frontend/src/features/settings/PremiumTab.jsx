import React from 'react';
import { Zap, Clock, CheckCircle2, CreditCard } from 'lucide-react';
import Button from '../../components/ui/Button';
import { toBS } from '../../utils/nepaliDateUtils';

const PremiumTab = ({ 
  isPremium, 
  subscription, 
  loading, 
  user, 
  navigate, 
  showTransactionHistory, 
  setShowTransactionHistory, 
  handleEsewaUpgrade 
}) => {
  const startDate = subscription?.start_date ? new Date(subscription.start_date) : null;
  const expiryDate = subscription?.expiry_date ? new Date(subscription.expiry_date) : null;
  const now = new Date();
  const daysRemaining = expiryDate ? Math.max(0, Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))) : null;
  const totalDays = startDate && expiryDate ? Math.ceil((expiryDate - startDate) / (1000 * 60 * 60 * 24)) : 365;
  const progressPercent = daysRemaining !== null ? Math.max(0, Math.min(100, ((totalDays - daysRemaining) / totalDays) * 100)) : 0;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="p-8 border-b border-gray-50 bg-gradient-to-r from-amber-50/50 to-transparent">
        <h3 className="text-xl font-bold text-gray-900">Samuha Premium</h3>
        <p className="text-sm text-gray-500 mt-1">Unlock advanced AI and Multimedia features for your organization.</p>
      </div>
      
      <div className="p-8 space-y-8">
        {isPremium ? (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6">
              <div className="flex items-center gap-5 mb-5">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                  <Zap size={28} className="text-emerald-500 fill-emerald-500" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-emerald-900">Your Samuha is Premium! ✨</h4>
                  <p className="text-sm text-emerald-600 mt-0.5">All advanced features are unlocked for your organization.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                <div className="bg-white/80 rounded-xl p-4 border border-emerald-100">
                  <p className="text-xs text-gray-500 font-medium mb-1">Plan</p>
                  <p className="text-sm font-bold text-gray-900">{subscription?.plan_details?.name === 'premium' ? 'Premium (Professional)' : 'Premium'}</p>
                </div>
                <div className="bg-white/80 rounded-xl p-4 border border-emerald-100">
                  <p className="text-xs text-gray-500 font-medium mb-1">Upgraded On</p>
                  <p className="text-sm font-bold text-gray-900">
                    {startDate ? toBS(startDate) : 'N/A'}
                  </p>
                </div>
                <div className="bg-white/80 rounded-xl p-4 border border-emerald-100">
                  <p className="text-xs text-gray-500 font-medium mb-1">Expires On</p>
                  <p className="text-sm font-bold text-gray-900">
                    {expiryDate ? toBS(expiryDate) : 'N/A'}
                  </p>
                </div>
              </div>

              {daysRemaining !== null && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <Clock size={12}/> {daysRemaining} days remaining
                    </span>
                    <span className="text-xs text-gray-500">{Math.round(progressPercent)}% used</span>
                  </div>
                  <div className="w-full bg-emerald-100 rounded-full h-2.5">
                    <div 
                      className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <h5 className="text-sm font-bold text-gray-700 mb-3">Unlocked Features</h5>
              <div className="grid grid-cols-2 gap-2">
                {['Samuha Bot Assistant', 'Loan Risk Prediction', 'HD Video Meetings', 'Multimedia Chat', 'Smart Notifications'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 size={14} className="text-emerald-500" /> {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900">Free Plan</h4>
              <ul className="space-y-2">
                {['Core Financials', 'Member Attendance', 'Simple Group Chat'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-500">
                    <CheckCircle2 size={16} className="text-emerald-500" /> {f}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-6 bg-amber-50 rounded-3xl border-2 border-amber-200 shadow-xl shadow-amber-100 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-200/30 rounded-full blur-3xl" />
              <h4 className="font-black text-amber-900 text-2xl">Premium Plan</h4>
              <p className="text-amber-700 text-sm mt-1">Unlock everything for your team.</p>
              
              <div className="my-6">
                 <span className="text-3xl font-black text-gray-900">NPR 1,500</span>
                 <span className="text-gray-500 text-sm">/ year</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                {['Samuha Bot Assistant', 'Loan Risk Prediction', 'HD Video Meetings', 'Multimedia Chat', 'Smart Notifications'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm font-bold text-amber-900">
                    <Zap size={14} className="text-amber-500 fill-amber-500" /> {f}
                  </li>
                ))}
              </ul>
              
              <Button onClick={handleEsewaUpgrade} disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-200 border-none">
                {loading ? 'Processing...' : 'Upgrade Now'}
              </Button>
            </div>
          </div>
        )}
        
        <div className="border border-gray-100 rounded-2xl overflow-hidden">
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CreditCard size={20} className="text-gray-400" />
              <div>
                <p className="text-sm font-bold text-gray-900">Transaction History</p>
                <p className="text-xs text-gray-500">View your previous subscriptions</p>
              </div>
            </div>
            <Button variant="ghost" className="text-indigo-600 font-bold text-xs" onClick={() => setShowTransactionHistory(!showTransactionHistory)}>
              {showTransactionHistory ? 'Hide' : 'View All'}
            </Button>
          </div>
          {showTransactionHistory && (
            <div className="px-5 pb-5 border-t border-gray-50 pt-4">
              {subscription ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Zap size={14} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Premium Upgrade</p>
                        <p className="text-xs text-gray-500">{subscription.start_date ? toBS(subscription.start_date) : 'N/A'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">NPR {subscription.plan_details?.price || '1,000'}</p>
                      <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                        {subscription.is_premium ? 'Active' : 'Expired'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : <p className="text-sm text-gray-400 text-center py-4">No transactions yet.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PremiumTab;
