import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, AlertTriangle, Sparkles, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { useI18n } from "../../i18n";
import { useThemeMode } from "../../theme/useThemeMode";

export type ModalVariant = "warning" | "feature" | "success";

export interface CustomizableModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: ModalVariant;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  isSubmitting?: boolean;
  icon?: React.ReactNode;
}

const EASE = [0.22, 1, 0.36, 1] as const;

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: EASE },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: 20,
    transition: { duration: 0.2, ease: EASE },
  },
};

export const CustomizableModal: React.FC<CustomizableModalProps> = ({
  isOpen,
  onClose,
  variant = "feature",
  title,
  subtitle,
  children,
  confirmText,
  cancelText,
  onConfirm,
  isSubmitting = false,
  icon,
}) => {
  const { t } = useI18n();
  const d = t("customizablemodal").defaults;
  const { isDark } = useThemeMode();

  const isWarning = variant === "warning";
  const isSuccess = variant === "success";

  const cardBg = isDark ? "#1e2d5e" : "#ffffff";
  const cardMuted = isDark ? "#273570" : "#F8FAFB";
  const border = isDark ? "#273570" : "#E2E8F0";
  const text = isDark ? "#ffffff" : "#1B244C";
  const textSecondary = "#989898";

  const accentColor = isWarning ? "#FF0000" : isSuccess ? "#4AA825" : "#2EBCCC";
  const accentBgLight = isWarning
    ? "rgba(255,0,0,0.1)"
    : isSuccess
      ? "rgba(74,168,37,0.12)"
      : "rgba(46,188,204,0.1)";

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    } else {
      onClose();
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="customizable-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            background: "rgba(27,36,76,0.6)",
            backdropFilter: "blur(4px)",
          }}
          onClick={onClose}
        >
          <motion.div
            key="customizable-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 420,
              background: cardBg,
              borderRadius: 24,
              padding: 24,
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              border: `1px solid ${border}`,
              display: "flex",
              flexDirection: "column",
              gap: 20,
              position: "relative",
            }}
          >
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                background: "transparent",
                border: "none",
                color: textSecondary,
                cursor: "pointer",
                padding: 4,
                display: "flex",
              }}
            >
              <X size={18} />
            </motion.button>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 16, paddingRight: 24 }}>
              <div
                style={{
                  padding: 12,
                  borderRadius: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  background: accentBgLight,
                  color: accentColor,
                }}
              >
                {icon ? (
                  icon
                ) : isWarning ? (
                  <AlertTriangle size={24} />
                ) : isSuccess ? (
                  <CheckCircle2 size={24} />
                ) : (
                  <Sparkles size={24} />
                )}
              </div>

              <div>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: text, lineHeight: 1.3 }}>
                  {title}
                </h3>
                {subtitle && (
                  <p style={{ margin: "4px 0 0", fontSize: "0.78rem", fontWeight: 600, color: textSecondary, lineHeight: 1.5 }}>
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {children && (
              <div
                style={{
                  background: cardMuted,
                  padding: 16,
                  borderRadius: 16,
                  border: `1px solid ${border}`,
                  fontSize: "0.78rem",
                  color: text,
                  lineHeight: 1.6,
                }}
              >
                {children}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  border: "none",
                  background: "transparent",
                  color: textSecondary,
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {cancelText || d.cancel}
              </motion.button>

              <motion.button
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                onClick={handleConfirm}
                disabled={isSubmitting}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 20px",
                  borderRadius: 12,
                  border: "none",
                  background: accentColor,
                  color: "#fff",
                  fontSize: "0.78rem",
                  fontWeight: 800,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  opacity: isSubmitting ? 0.7 : 1,
                  fontFamily: "inherit",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                }}
              >
                <span>{confirmText || (isWarning ? d.delete : d.continueAction)}</span>
                {isSubmitting ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <Loader2 size={14} />
                  </motion.div>
                ) : (
                  !isWarning && !isSuccess && <ArrowRight size={14} />
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default CustomizableModal;
