import React, { useEffect, useState } from 'react';
import { Sparkles, LogOut, CheckCircle2 } from 'lucide-react';

const DissolutionSuccess = ({ onLogout }) => {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onLogout) onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onLogout]);

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900 flex items-center justify-center p-6 text-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 -left-10 w-96 h-96 bg-purple-600 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 -right-10 w-96 h-96 bg-indigo-600 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 max-w-2xl space-y-12 animate-in fade-in zoom-in-95 duration-1000">
        <div className="flex justify-center">
           <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-40 animate-ping"></div>
              <div className="bg-emerald-500 p-6 rounded-full relative shadow-2xl shadow-emerald-500/20">
                <CheckCircle2 size={64} className="text-white" />
              </div>
           </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight">
            धन्यवाद (Thank You)
          </h1>
          <p className="text-xl text-indigo-200 font-medium tracking-wide italic">
             for choosing Digital Samuha
          </p>
        </div>

        <div className="p-8 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl space-y-6">
          <p className="text-gray-300 leading-relaxed font-medium">
            The Samuha has been officially dissolved. All financial records have been archived, 
            and all memberships are now inactive. We wish you success in your future endeavors.
          </p>
          
          <div className="pt-4 border-t border-white/5 flex flex-col items-center gap-4">
             <div className="flex items-center gap-3 text-indigo-300">
                <LogOut size={20} className="animate-bounce" />
                <span className="text-sm font-bold uppercase tracking-widest">Final Session Closing</span>
             </div>
             <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin flex items-center justify-center">
                <span className="text-white font-black text-xl">{countdown}</span>
             </div>
          </div>
        </div>

        <div className="flex justify-center gap-2 text-indigo-400 opacity-50">
           <Sparkles size={16} />
           <span className="text-xs font-bold uppercase tracking-[0.3em]">Your Financial Journey, Digitized</span>
           <Sparkles size={16} />
        </div>
      </div>
    </div>
  );
};

export default DissolutionSuccess;
