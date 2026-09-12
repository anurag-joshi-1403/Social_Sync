import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((type, message, duration = 3000) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const toast = {
    success: (msg, dur) => push('success', msg, dur),
    error: (msg, dur) => push('error', msg, dur),
    info: (msg, dur) => push('info', msg, dur),
    warning: (msg, dur) => push('warning', msg, dur),
  };

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={toast}>
      {children}

      <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 1090 }}>
        {toasts.map((t) => {
          const iconMap = {
            success: 'bi-check-circle-fill',
            error: 'bi-exclamation-circle-fill',
            info: 'bi-info-circle-fill',
            warning: 'bi-exclamation-triangle-fill',
          };
          const bgMap = {
            success: 'text-bg-success',
            error: 'text-bg-danger',
            info: 'text-bg-primary',
            warning: 'text-bg-warning',
          };
          return (
            <div
              key={t.id}
              className={`toast show align-items-center ${bgMap[t.type]} border-0 mb-2`}
              role="alert"
            >
              <div className="d-flex">
                <div className="toast-body d-flex align-items-center">
                  <i className={`bi ${iconMap[t.type]} me-2`}></i>
                  {t.message}
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white me-2 m-auto"
                  onClick={() => dismiss(t.id)}
                  aria-label="Close"
                ></button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};