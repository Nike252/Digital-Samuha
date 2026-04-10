import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getBSMonthYear, MONTHS_BS, getCurrentBSDate } from '../../utils/nepaliDateUtils';

const ActivityChart = ({ transactions = [] }) => {
  // Process transactions into chart data
  const processChartData = () => {
    const currentBS = getCurrentBSDate();
    const currentMonth = currentBS.month - 1; // 0-indexed for logic
    
    // Initialize last 6 months (BS)
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
        const m = (currentMonth - i + 12) % 12;
        chartData.push({ name: MONTHS_BS[m], savings: 0, loans: 0, monthIndex: m });
    }

    // Distribute transactions using BS month conversion
    transactions.forEach(tx => {
        const bs = getBSMonthYear(tx.created_at);
        const dataPoint = chartData.find(d => d.monthIndex === bs.month);
        
        if (dataPoint) {
            const amount = parseFloat(tx.amount || 0);
            if (tx.type === 'saving') dataPoint.savings += amount;
            if (tx.type === 'loan_disbursement') dataPoint.loans += amount;
        }
    });

    return chartData;
  };

  const dynamicData = processChartData();

  return (
    <div className="h-full min-h-[300px] w-full">
        <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="text-lg font-bold text-gray-800">Financial Growth</h3>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-indigo-600" />
                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Savings</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Loans</span>
                </div>
            </div>
        </div>
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart
            data={dynamicData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
            <defs>
                <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorLoans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} 
                dy={10} 
            />
            <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} 
            />
            <Tooltip 
                contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '12px'
                }}
            />
            <Area 
                type="monotone" 
                dataKey="savings" 
                stroke="#4F46E5" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorSavings)" 
                name="Total Savings" 
                animationDuration={1500}
            />
            <Area 
                type="monotone" 
                dataKey="loans" 
                stroke="#ef4444" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorLoans)" 
                name="Loan Disbursements" 
                animationDuration={2000}
            />
            </AreaChart>
        </ResponsiveContainer>
    </div>
  );
};

export default ActivityChart;
