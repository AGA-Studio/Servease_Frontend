import React from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import type { Toast } from "./useToast";
import type { ThemeMode } from "../../theme/theme";

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
  theme: ThemeMode;
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
  theme,
}) => {
  const isDark = theme === "dark";

  const toastConfig = {
    success: {
      icon: <CheckCircle size={18} />,
      bg: isDark ? "bg-green-950" : "bg-green-50",
      border: "border-green-500",
      leftBorder: "border-l-green-500",
      iconColor: "text-green-500",
    },
    error: {
      icon: <AlertCircle size={18} />,
      bg: isDark ? "bg-red-950" : "bg-red-50",
      border: "border-red-500",
      leftBorder: "border-l-red-500",
      iconColor: "text-red-500",
    },
    info: {
      icon: <Info size={18} />,
      bg: isDark ? "bg-cyan-950" : "bg-cyan-50",
      border: "border-[#2EBCCC]",
      leftBorder: "border-l-[#2EBCCC]",
      iconColor: "text-[#2EBCCC]",
    },
  };

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 min-w-80 max-w-[400px]">
      {toasts.map((toast) => {
        const cfg = toastConfig[toast.type];
        return (
          <div
            key={toast.id}
            className={`${cfg.bg} border ${cfg.border} border-l-4 ${cfg.leftBorder} rounded-xl px-4 py-3.5 flex items-center gap-3 shadow-2xl animate-toast-in`}
          >
            <span className={`${cfg.iconColor} shrink-0`}>{cfg.icon}</span>
            <p
              className={`flex-1 m-0 text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-800"}`}
            >
              {toast.message}
            </p>
            <button
              onClick={() => onRemove(toast.id)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 cursor-pointer bg-transparent border-none flex items-center"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
