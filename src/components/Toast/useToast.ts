import { useState, useCallback } from "react";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    setToasts((prev) => {

      if (prev.some((t) => t.type === type && t.message === message)) {
        return prev;
      }
      const id = Math.random().toString(36).slice(2);
      setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4500);
      return [...prev, { id, type, message }];
    });
  }, []);

  const removeToast = useCallback(
    (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    []
  );

  return { toasts, addToast, removeToast };
};