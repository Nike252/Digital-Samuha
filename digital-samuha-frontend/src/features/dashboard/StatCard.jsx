import React from 'react';

const StatCard = ({ label, value, color, icon: Icon }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
        {Icon && <Icon size={24} />}
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium">{label}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;
