// Confirmation modal for consequential admin actions (suspend, hide, reactivate, etc). Admin panel only.

import { useEffect, useState } from "react";
import { TriangleAlert, CheckCircle2, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  isDark: boolean;
  tone?: "danger" | "positive";
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onClose: () => void;
  onConfirm: () => void;
}

const AdminConfirmModal: React.FC<Props> = ({
  isOpen,
  isDark,
  tone = "danger",
  title,
  message,
  confirmLabel,
  cancelLabel,
  onClose,
  onConfirm,
}) => {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  const accent = tone === "danger" ? "#FF0000" : "#4AA825";

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setClosing(false);
    } else {
      setClosing(true);
      const timer = setTimeout(() => setVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ animation: "fade-in 0.22s ease both" }}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative w-[90%] max-w-[400px] rounded-[16px] p-6"
        style={{
          background: isDark ? "#1B244C" : "#FFFFFF",
          border: `1px solid ${isDark ? "#273570" : "#E5E7EB"}`,
          boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(27,36,76,0.12)",
          animation: closing ? "none" : "scale-in 0.28s cubic-bezier(0.23, 1, 0.32, 1) both",
          transform: closing ? "scale(0.93)" : "none",
          opacity: closing ? 0 : 1,
          transition: "transform 0.2s ease, opacity 0.2s ease",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full border-none cursor-pointer"
          style={{ background: "transparent", color: isDark ? "#989898" : "#666" }}
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
            style={{ background: tone === "danger" ? (isDark ? "rgba(255,0,0,0.12)" : "rgba(255,0,0,0.08)") : (isDark ? "rgba(74,168,37,0.15)" : "rgba(74,168,37,0.1)") }}
          >
            {tone === "danger" ? (
              <TriangleAlert size={24} style={{ color: accent }} />
            ) : (
              <CheckCircle2 size={24} style={{ color: accent }} />
            )}
          </div>

          <h3 className="m-0 text-lg font-bold mb-2" style={{ color: isDark ? "#FFFFFF" : "#1B244C" }}>
            {title}
          </h3>

          <p className="m-0 text-sm mb-6" style={{ color: isDark ? "#989898" : "#666" }}>
            {message}
          </p>

          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 py-[10px] rounded-[10px] border-none text-sm font-semibold cursor-pointer"
              style={{
                background: isDark ? "#273570" : "#F3F4F6",
                color: isDark ? "#EFEFEF" : "#1B244C",
                transition: "background 200ms ease, transform 160ms ease-out",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDark ? "rgba(46,188,204,0.15)" : "rgba(46,188,204,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDark ? "#273570" : "#F3F4F6";
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "scale(0.97)";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-[10px] rounded-[10px] border-none text-sm font-semibold cursor-pointer"
              style={{ background: accent, color: "#FFFFFF", transition: "background 200ms ease, transform 160ms ease-out" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = tone === "danger" ? "#D40000" : "#3d8f1f";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = accent;
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "scale(0.97)";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConfirmModal;
