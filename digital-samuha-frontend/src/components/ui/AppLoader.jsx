import React from 'react';

const AppLoader = () => {
  return (
    <div className="h-screen w-full bg-[#f8fafc] flex">
      {/* Sidebar Skeleton */}
      <div className="w-64 h-full bg-white border-r border-gray-100 flex flex-col p-6 hidden md:flex">
        {/* Logo area */}
        <div className="w-32 h-10 bg-gray-200 rounded-xl mb-12 animate-pulse" />
        
        {/* Nav Links */}
        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-200 rounded-lg animate-pulse" />
              <div className="w-24 h-4 bg-gray-200 rounded-md animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col">
        {/* Header Skeleton */}
        <div className="h-20 bg-white border-b border-gray-100 px-8 flex items-center justify-between">
            <div className="w-48 h-6 bg-gray-200 rounded-lg animate-pulse" />
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
               <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            </div>
        </div>

        {/* Dashboard Content Skeleton */}
        <div className="p-8 space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white h-32 rounded-3xl border border-gray-100 p-6 flex flex-col justify-between">
                        <div className="w-12 h-12 bg-gray-100 rounded-2xl animate-pulse" />
                        <div className="w-24 h-6 bg-gray-200 rounded-lg animate-pulse mt-4" />
                    </div>
                ))}
            </div>

            {/* Big Content Area */}
            <div className="bg-white h-80 rounded-3xl border border-gray-100 p-8 flex flex-col gap-4">
                 <div className="w-64 h-8 bg-gray-200 rounded-xl animate-pulse" />
                 <div className="flex-1 bg-gray-50 rounded-2xl animate-pulse mt-4" />
            </div>
        </div>
      </div>
    </div>
  );
};

export default AppLoader;
