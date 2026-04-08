import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, Info, LogOut, CheckCircle2 } from 'lucide-react';
import Button from './Button';

const ConfirmDialog = ({ title, message, type = 'danger', onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
  const dialogRef = useRef(null);

  // Focus lock and Escape key handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const icons = {
    danger: <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-rose-100 sm:mx-0 sm:h-10 sm:w-10"><Trash2 className="h-6 w-6 text-rose-600" aria-hidden="true" /></div>,
    warning: <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 sm:mx-0 sm:h-10 sm:w-10"><AlertTriangle className="h-6 w-6 text-amber-600" aria-hidden="true" /></div>,
    info: <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10"><Info className="h-6 w-6 text-indigo-600" aria-hidden="true" /></div>,
    success: <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 sm:mx-0 sm:h-10 sm:w-10"><CheckCircle2 className="h-6 w-6 text-emerald-600" aria-hidden="true" /></div>,
    logout: <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 sm:mx-0 sm:h-10 sm:w-10"><LogOut className="h-6 w-6 text-gray-600" aria-hidden="true" /></div>
  };

  const confirmVariant = type === 'danger' ? 'danger' : 'primary';

  return (
    <div className="relative z-[100]" aria-labelledby="modal-title" role="dialog" aria-modal="true" ref={dialogRef}>
      {/* Backdrop */}
      <div className="fixed inset-0 border-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"></div>

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0 animate-in zoom-in-95 duration-200">
          <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-100">
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                {icons[type] || icons.info}
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900" id="modal-title">
                    {title}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 whitespace-pre-wrap">
                      {message}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-gray-100 gap-3">
              <Button
                type="button"
                variant={confirmVariant}
                onClick={onConfirm}
                className="w-full sm:w-auto"
              >
                {confirmText}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                className="mt-3 w-full sm:mt-0 sm:w-auto"
              >
                {cancelText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
