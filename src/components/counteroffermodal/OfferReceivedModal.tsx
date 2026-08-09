import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, MessageSquare } from "lucide-react";
import { useI18n } from "../../i18n";
import { useThemeMode } from "../../theme/useThemeMode";
import { useCurrency } from "../../context/CurrencyContext";

interface OfferReceivedModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  amount: number;
  currency?: string | null;
  message: string | null;
  onCounter: () => void;
  onAccept: () => void;
}

const EASE = [0.22, 1, 0.36, 1] as const;

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: EASE, staggerChildren: 0.05, delayChildren: 0.05 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 15,
    transition: { duration: 0.18, ease: EASE },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: EASE } },
};

export const OfferReceivedModal: React.FC<OfferReceivedModalProps> = ({
  isOpen,
  onClose,
  jobTitle,
  amount,
  currency,
  message,
  onCounter,
  onAccept,
}) => {
  const { t } = useI18n();
  const d = t("myjobsscreen").offerReceivedModal;
  const { isDark } = useThemeMode();
  const { formatFixedMoney } = useCurrency();

  const cardBg = isDark ? "#1e2d5e" : "#ffffff";
  const cardMuted = isDark ? "#273570" : "#F8FAFB";
  const border = isDark ? "#273570" : "#E2E8F0";
  const text = isDark ? "#ffffff" : "#1B244C";
  const textSecondary = "#989898";

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="offer-received-overlay"
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
            key="offer-received-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 440,
              background: cardBg,
              borderRadius: 20,
              border: `1px solid ${border}`,
              padding: 24,
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <motion.div variants={itemVariants} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: text }}>{d.title}</h2>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2, ease: EASE }}
                style={{
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
            </motion.div>

            <motion.p variants={itemVariants} style={{ margin: 0, fontSize: "0.82rem", fontWeight: 600, color: textSecondary, lineHeight: 1.5 }}>
              {d.subtitle.replace("{title}", jobTitle)}
            </motion.p>

            <motion.div
              variants={itemVariants}
              style={{
                background: cardMuted,
                borderRadius: 14,
                padding: 16,
                border: `1px solid ${border}`,
                textAlign: "center",
              }}
            >
              <p style={{ margin: 0, fontSize: "0.65rem", fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase", color: textSecondary }}>
                {d.offeredAmount}
              </p>
              <p style={{ margin: "4px 0 0", fontSize: "1.6rem", fontWeight: 800, color: text }}>
                {formatFixedMoney(amount, currency)}
              </p>
            </motion.div>

            {message && (
              <motion.div
                variants={itemVariants}
                style={{
                  display: "flex",
                  gap: 10,
                  background: cardMuted,
                  borderRadius: 14,
                  padding: 14,
                  border: `1px solid ${border}`,
                }}
              >
                <MessageSquare size={16} color="#2EBCCC" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ margin: 0, fontSize: "0.85rem", color: text, lineHeight: 1.6 }}>{message}</p>
              </motion.div>
            )}

            <motion.div variants={itemVariants} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={onCounter}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  borderRadius: 12,
                  border: "1.5px solid #2EBCCC",
                  background: "transparent",
                  color: "#2EBCCC",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {d.counterOffer}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={onAccept}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  borderRadius: 12,
                  border: "none",
                  background: "#2EBCCC",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  boxShadow: "0 6px 16px rgba(46,188,204,0.35)",
                }}
              >
                {d.acceptOffer}
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default OfferReceivedModal;
