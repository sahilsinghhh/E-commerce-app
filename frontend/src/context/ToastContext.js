import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((items) => items.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, message, type = 'success' }) => {
      const id = globalThis.crypto?.randomUUID?.() || String(Date.now());
      setToasts((items) => [...items, { id, title, message, type }]);
      window.setTimeout(() => removeToast(id), 4200);
    },
    [removeToast]
  );

  const value = useMemo(() => ({ showToast, removeToast }), [showToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[80] grid w-[calc(100%-2rem)] max-w-sm gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`premium-card rounded-2xl p-4 ${
              toast.type === 'error' ? 'border-red-200 bg-red-50/95' : 'border-emerald-200 bg-white/95'
            }`}
            role="status"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={`font-bold ${toast.type === 'error' ? 'text-red-700' : 'text-ink-900'}`}>
                  {toast.title}
                </p>
                {toast.message && (
                  <p className="mt-1 text-sm font-semibold leading-5 text-ink-500">{toast.message}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="rounded-full px-2 text-lg font-bold text-ink-400 hover:bg-white hover:text-ink-900"
                aria-label="Dismiss notification"
              >
                x
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
