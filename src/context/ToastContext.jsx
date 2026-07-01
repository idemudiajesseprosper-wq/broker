"use client";

import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const ToastContext = createContext(null);

const toastStyles = {
  error: {
    icon: AlertTriangle,
    ring: "border-[rgba(229,57,53,0.35)]",
    text: "text-[#ff8a86]",
  },
  info: {
    icon: Info,
    ring: "border-[rgba(56,189,248,0.32)]",
    text: "text-[#7dd3fc]",
  },
  success: {
    icon: CheckCircle2,
    ring: "border-[rgba(76,175,80,0.35)]",
    text: "text-[#86efac]",
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((items) => items.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    ({ description, title, type = "info" }) => {
      const id = crypto.randomUUID();

      setToasts((items) => [
        ...items,
        {
          description,
          id,
          title,
          type,
        },
      ]);

      window.setTimeout(() => dismiss(id), 4500);
      return id;
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({
      dismiss,
      error: (title, description) =>
        show({ description, title, type: "error" }),
      info: (title, description) => show({ description, title, type: "info" }),
      success: (title, description) =>
        show({ description, title, type: "success" }),
    }),
    [dismiss, show],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3"
      >
        {toasts.map((toast) => {
          const style = toastStyles[toast.type] || toastStyles.info;
          const Icon = style.icon;

          return (
            <output
              className={`pointer-events-auto overflow-hidden rounded-[10px] border ${style.ring} bg-[#09090d]/95 p-4 text-white shadow-[0_18px_55px_rgba(0,0,0,0.4)] backdrop-blur`}
              key={toast.id}
            >
              <div className="flex gap-3">
                <span
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/[0.04] ${style.text}`}
                >
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">
                    {toast.title}
                  </p>
                  {toast.description ? (
                    <p className="mt-1 text-xs leading-5 text-white/48">
                      {toast.description}
                    </p>
                  ) : null}
                </div>
                <button
                  aria-label="Dismiss notification"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white/38 transition hover:bg-white/10 hover:text-white"
                  onClick={() => dismiss(toast.id)}
                  type="button"
                >
                  <X aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
            </output>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
