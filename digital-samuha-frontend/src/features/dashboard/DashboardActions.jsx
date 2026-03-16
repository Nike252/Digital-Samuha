import React from 'react';
import QuickActionBtn from './QuickActionBtn';
import ActivityChart from './ActivityChart';

const DashboardActions = ({ config, handleQuickAction, recentTransactions }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
      <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="flex flex-col gap-3">
           {config?.quickActions.map((action, index) => (
             <QuickActionBtn 
               key={index} 
               label={action.label} 
               icon={action.icon}
               onClick={() => handleQuickAction(action.action)} 
             />
           ))}
        </div>
      </div>

      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[400px]">
         <ActivityChart transactions={recentTransactions} />
      </div>
    </div>
  );
};

export default DashboardActions;
