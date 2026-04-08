import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose, duration = 4500 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="text-emerald-500 w-5 h-5 flex-shrink-0 mt-0.5" />,
    error: <AlertCircle className="text-rose-500 w-5 h-5 flex-shrink-0 mt-0.5" />,
    info: <Info className="text-indigo-500 w-5 h-5 flex-shrink-0 mt-0.5" />
  };

  const bgs = {
    success: 'bg-white border-emerald-100 shadow-emerald-500/10',
    error: 'bg-white border-rose-100 shadow-rose-500/10',
    info: 'bg-white border-indigo-100 shadow-indigo-500/10'
  };

  return (
    <div className={`pointer-events-auto w-full max-w-sm overflow-hidden rounded-xl border ${bgs[type]} shadow-lg ring-1 ring-black ring-opacity-5 transition-all transform animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto`}>
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {icons[type]}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900 break-words">{message}</p>
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
