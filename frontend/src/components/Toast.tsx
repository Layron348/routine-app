import React, { useEffect, useState, useCallback, createContext, useContext } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: React.ReactNode;
  type: ToastType;
}

interface ToastContextValue {
  show: (message: React.ReactNode, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ show: () => {} });

export const useToast = () => useContext(ToastContext);

let nextId = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: React.ReactNode, type: ToastType = "info") => {
    const id = ++nextId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span className="toast-icon">
              {t.type === "success" && "✓"}
              {t.type === "error" && "✕"}
              {t.type === "info" && "ℹ"}
            </span>
            <span className="toast-message">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
