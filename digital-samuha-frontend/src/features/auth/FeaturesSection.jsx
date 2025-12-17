import React from 'react';

const WalletIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="8" fill="#2563eb" fillOpacity="0.1"/><path d="M32 16H16C14.8954 16 14 16.8954 14 18V30C14 31.1046 14.8954 32 16 32H32C33.1046 32 34 31.1046 34 30V18C34 16.8954 33.1046 16 32 16Z" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M30 24H30.01" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18 20H26" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChatIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="8" fill="#2563eb" fillOpacity="0.1"/><path d="M16 20C16 18.8954 16.8954 18 18 18H30C31.1046 18 32 18.8954 32 20V26C32 27.1046 31.1046 28 30 28H22L18 32V28C16.8954 28 16 27.1046 16 26V20Z" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const RobotIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="8" fill="#2563eb" fillOpacity="0.1"/><rect x="16" y="18" width="16" height="16" rx="2" stroke="#2563eb" strokeWidth="2"/><circle cx="22" cy="24" r="1.5" fill="#2563eb"/><circle cx="26" cy="24" r="1.5" fill="#2563eb"/><path d="M20 30H28" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/><path d="M18 16V14" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/><path d="M30 16V14" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const DocumentIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="8" fill="#2563eb" fillOpacity="0.1"/><path d="M18 16H28L32 20V32C32 33.1046 31.1046 34 30 34H18C16.8954 34 16 33.1046 16 32V18C16 16.8954 16.8954 16 18 16Z" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M28 16V20H32" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 26H28" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/><path d="M20 30H26" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const FeaturesSection = () => {
  const features = [
    { icon: <WalletIcon />, title: "Ledger Automation", description: "Automatic calculation of debits, credits, and monthly balances." },
    { icon: <ChatIcon />, title: "Group Chat", description: "Dedicated secure communication channel for all members." },
    { icon: <RobotIcon />, title: "AI Samuha Bot", description: "Ask questions about finances or regulations in natural language." },
    { icon: <DocumentIcon />, title: "Meeting Records", description: "Digitize your minutes (minut) and attendance records." }
  ];

  return (
    <section className="w-full px-6 py-16 lg:px-16 lg:py-24 bg-gray-50">
      <div className="w-full">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-[#2563eb] uppercase tracking-wide mb-2">FEATURES</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">Everything your Samuha needs</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
