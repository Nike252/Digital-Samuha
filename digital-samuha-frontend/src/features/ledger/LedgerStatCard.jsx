import React from 'react';
import { TrendingUp } from 'lucide-react';

const LedgerStatCard = ({ label, value, icon, trend, color, loading }) => (
  <div className={`p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all ${color}`}>
    {loading ? (
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
    ) : null}
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform ${loading ? 'animate-pulse' : ''}`}>{icon}</div>
        {trend && !loading && (
          <div className="flex items-center gap-1 text-emerald-600 bg-white/50 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold">
            <TrendingUp size={12} />
            {trend}
          </div>
        )}
      </div>
      <p className={`text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 ${loading ? 'w-24 h-3 bg-gray-200 rounded animate-pulse' : ''}`}>{!loading && label}</p>
      <div className={`text-2xl font-black text-gray-900 ${loading ? 'w-32 h-8 bg-gray-200/50 rounded mt-2 animate-pulse' : ''}`}>{!loading && value}</div>
    </div>
    {!loading && (
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-125 transition-transform">
        {React.cloneElement(icon, { size: 100 })}
      </div>
    )}
  </div>
);

export default LedgerStatCard;
