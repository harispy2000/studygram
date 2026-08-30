'use client';
import { createContext, ReactNode, useCallback, useContext, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'i',
};

const COLORS: Record<ToastType, string> = {
  success: 'text-emerald-300 border-emerald-400/40 bg-emerald-500/15',
  error: 'text-rose-300 border-rose-400/40 bg-rose-500/15',
  info: 'text-indigo-300 border-indigo-400/40 bg-indigo-500/15',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {typeof window !== 'undefined' &&
        createPortal(
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 px-4 w-full max-w-sm pointer-events-none">
            {toasts.map((t) => (
              <div
                key={t.id}
                className={`animate-toast-in pointer-events-auto flex items-center gap-3 w-full glass-strong rounded-2xl px-4 py-3 shadow-[var(--shadow-lg)] border ${COLORS[t.type]}`}
                role="status"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold border border-inherit">
                  {ICONS[t.type]}
                </span>
                <p className="text-sm text-[var(--text-primary)] leading-snug">{t.message}</p>
              </div>
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}