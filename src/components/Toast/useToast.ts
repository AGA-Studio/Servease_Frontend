import { useState, useCallback } from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastOptions {
  duration?: number;
  onClick?: () => void;
}

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
  onClick?: () => void;
}

const DEFAULT_DURATION = 4500;

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (type: ToastType, message: string, options?: ToastOptions) => {
      setToasts((prev) => {
        if (prev.some((t) => t.type === type && t.message === message)) {
          return prev;
        }
        const id = Math.random().toString(36).slice(2);
        const duration = options?.duration ?? DEFAULT_DURATION;
        setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), duration);
        return [...prev, { id, type, message, duration, onClick: options?.onClick }];
      });
    },
    [],
  );

  const removeToast = useCallback(
    (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    []
  );

  return { toasts, addToast, removeToast };
};