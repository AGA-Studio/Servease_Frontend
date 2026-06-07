import { useEffect, useState } from "react";
import { TriangleAlert, X } from "lucide-react";
import { useI18n } from "../../i18n";

interface Props {
  isOpen: boolean;
  isDark: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutModal: React.FC<Props> = ({ isOpen, isDark, onClose, onConfirm }) => {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const { t } = useI18n();
  const labels = t("auth").logoutModal;

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ animation: "fade-in 0.22s ease both" }}
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div
        className="relative w-[90%] max-w-[400px] rounded-[16px] p-6"
        style={{
          background: isDark ? "#1B244C" : "#FFFFFF",
          border: `1px solid ${isDark ? "#273570" : "#E5E7EB"}`,
          boxShadow: isDark
            ? "0 8px 32px rgba(0,0,0,0.5)"
            : "0 8px 32px rgba(27,36,76,0.12)",
          animation: closing
            ? "none"
            : "scale-in 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) both",
          transform: closing ? "scale(0.93)" : "none",
          opacity: closing ? 0 : 1,
          transition: "transform 0.2s ease, opacity 0.2s ease",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full border-none cursor-pointer"
          style={{
            background: "transparent",
            color: isDark ? "#989898" : "#666",
          }}
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
            style={{
              background: isDark
                ? "rgba(255,0,0,0.12)"
                : "rgba(255,0,0,0.08)",
            }}
          >
            <TriangleAlert size={24} style={{ color: "#FF0000" }} />
          </div>

          <h3
            className="m-0 text-lg font-bold mb-2"
            style={{ color: isDark ? "#FFFFFF" : "#1B244C" }}
          >
            {labels.title}
          </h3>

          <p
            className="m-0 text-sm mb-6"
            style={{ color: isDark ? "#989898" : "#666" }}
          >
            {labels.message}
          </p>

          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 py-[10px] rounded-[10px] border-none text-sm font-semibold cursor-pointer transition-all duration-200"
              style={{
                background: isDark ? "#273570" : "#F3F4F6",
                //color: isDark ? "#EFEFEF" : "#1B244C",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDark
                  ? "rgba(46,188,204,0.15)"
                  : "rgba(46,188,204,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDark ? "#273570" : "#F3F4F6";
              }}
            >
              {labels.cancel}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-[10px] rounded-[10px] border-none text-sm font-semibold cursor-pointer transition-all duration-200"
              style={{
                background: "#FF0000",
                color: "#FFFFFF",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDark
                  ? "#CC0000"
                  : "#D40000";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#FF0000";
              }}
            >
              {labels.confirm}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
