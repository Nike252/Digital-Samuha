import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Toast, ConfirmDialog } from '../components/ui';

const UIContext = createContext();

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

export const UIProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: () => {},
  });

  const showToast = useCallback((message, type = 'info', duration = 4500) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showConfirm = useCallback(({ title, message, type = 'danger', confirmText, cancelText, onConfirm }) => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      type,
      confirmText: confirmText || 'Confirm',
      cancelText: cancelText || 'Cancel',
      onConfirm: () => {
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
        if (onConfirm) onConfirm();
      },
      onCancel: () => {
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
      }
    });
  }, []);

  // Use useMemo to prevent unnecessary re-renders for consumers of useUI
  const value = useMemo(() => ({ showToast, showConfirm }), [showToast, showConfirm]);

  return (
    <UIContext.Provider value={value}>
      {children}

      {/* Global Toast Container */}
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 flex items-start px-4 py-6 sm:p-6 z-[200] flex-col gap-2"
        style={{ top: '1rem', right: '1rem', alignItems: 'flex-end', justifyContent: 'flex-start' }}
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      {/* Global Confirm Dialog */}
      {confirmState.isOpen && (
        <ConfirmDialog
          title={confirmState.title}
          message={confirmState.message}
          type={confirmState.type}
          confirmText={confirmState.confirmText}
          cancelText={confirmState.cancelText}
          onConfirm={confirmState.onConfirm}
          onCancel={confirmState.onCancel}
        />
      )}
    </UIContext.Provider>
  );
};
