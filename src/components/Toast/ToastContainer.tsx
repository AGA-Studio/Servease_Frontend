import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle2, XCircle, Info } from "lucide-react";
import type { Toast } from "./useToast";
import type { ThemeMode } from "../../theme/theme";

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
  theme: ThemeMode;
}

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const EASE_IN = [0.4, 0, 1, 1] as const;

const ICONS: Record<Toast["type"], React.ReactNode> = {
  success: <CheckCircle2 size={15} />,
  error: <XCircle size={15} />,
  info: <Info size={15} />,
};

const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
  theme,
}) => {
  const isDark = theme === "dark";

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        pointerEvents: "none",
      }}
    >
      <style>{`
        .st-close-btn { transition: background 160ms ease, color 160ms ease; }
        .st-close-btn:hover {
          background: ${isDark ? "rgba(255,255,255,0.12)" : "rgba(27,36,76,0.08)"};
          color: ${isDark ? "#ffffff" : "#1B244C"};
        }
      `}</style>
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: -18, scale: 0.92, filter: "blur(3px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{
              opacity: 0,
              y: -12,
              scale: 0.95,
              filter: "blur(2px)",
              transition: { duration: 0.18, ease: EASE_IN },
            }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            style={{
              pointerEvents: "auto",
              display: "flex",
              alignItems: "center",
              gap: 10,
              maxWidth: 420,
              padding: "8px 16px 8px 8px",
              borderRadius: 999,
              background: isDark ? "#1e2d5e" : "#ffffff",
              border: `1.5px solid ${isDark ? "rgba(46,188,204,0.45)" : "rgba(46,188,204,0.35)"}`,
              boxShadow: isDark
                ? "0 12px 32px -8px rgba(46,188,204,0.3), 0 4px 16px rgba(0,0,0,0.35)"
                : "0 12px 32px -10px rgba(46,188,204,0.3), 0 4px 16px rgba(20,30,40,0.12)",
            }}
          >
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#2EBCCC",
                color: "#ffffff",
              }}
            >
              {ICONS[toast.type]}
            </span>
            <p
              style={{
                margin: 0,
                flex: 1,
                fontSize: "0.85rem",
                fontWeight: 600,
                lineHeight: 1.4,
                color: isDark ? "#ffffff" : "#1B244C",
              }}
            >
              {toast.message}
            </p>
            <motion.button
              className="st-close-btn"
              onClick={() => onRemove(toast.id)}
              whileTap={{ scale: 0.88 }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                flexShrink: 0,
                padding: 5,
                borderRadius: "50%",
                color: isDark ? "rgba(255,255,255,0.5)" : "rgba(27,36,76,0.4)",
              }}
            >
              <X size={14} />
            </motion.button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
