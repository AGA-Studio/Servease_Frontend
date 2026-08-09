import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle2, Banknote, CreditCard, Loader2, ArrowRight } from "lucide-react";
import { useI18n } from "../../i18n";
import DragToConfirm from "../dragtoconfirm/DragToConfirm";

const EASE = [0.22, 1, 0.36, 1] as const;

type PaymentMethod = "efectivo" | "tarjeta";

export interface CompleteServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  jobTitle: string;
  amount: string;
  currency: string;
  onConfirmCash: () => Promise<void>;
  onStartCardPayment: () => Promise<void>;
  isStartingCardPayment: boolean;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
  exit: { opacity: 0, scale: 0.92, y: 20, transition: { duration: 0.2, ease: EASE } },
};

const CompleteServiceModal: React.FC<CompleteServiceModalProps> = ({
  isOpen,
  onClose,
  isDark,
  jobTitle,
  amount,
  currency,
  onConfirmCash,
  onStartCardPayment,
  isStartingCardPayment,
}) => {
  const { t } = useI18n();
  const cs = t("completeservicemodal");
  const [method, setMethod] = useState<PaymentMethod>("efectivo");

  const cardBg = isDark ? "#1e2d5e" : "#ffffff";
  const cardMuted = isDark ? "#273570" : "#F8FAFB";
  const border = isDark ? "#273570" : "#E2E8F0";
  const text = isDark ? "#ffffff" : "#1B244C";
  const textSecondary = "#989898";
  const accent = "#2EBCCC";

  const isLocked = isStartingCardPayment;

  const handleClose = () => {
    if (isLocked) return;
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="complete-service-overlay"
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
          onClick={handleClose}
        >
          <motion.div
            key="complete-service-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 440,
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
              onClick={handleClose}
              disabled={isLocked}
              whileHover={isLocked ? undefined : { scale: 1.1, rotate: 90 }}
              whileTap={isLocked ? undefined : { scale: 0.9 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                background: "transparent",
                border: "none",
                color: textSecondary,
                cursor: isLocked ? "not-allowed" : "pointer",
                opacity: isLocked ? 0.4 : 1,
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
                  background: "rgba(74,168,37,0.12)",
                  color: "#4AA825",
                }}
              >
                <CheckCircle2 size={24} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: text, lineHeight: 1.3 }}>
                  {cs.title}
                </h3>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: textSecondary,
                    lineHeight: 1.5,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {jobTitle}
                </p>
              </div>
            </div>

            <div
              style={{
                background: cardMuted,
                borderRadius: 16,
                border: `1px solid ${border}`,
                padding: "18px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em", color: textSecondary, textTransform: "uppercase" }}>
                {cs.amountLabel}
              </span>
              <span style={{ fontSize: "1.5rem", fontWeight: 800, color: text }}>
                ${amount} <span style={{ fontSize: "0.9rem", fontWeight: 700, color: textSecondary }}>{currency}</span>
              </span>
            </div>

            <div style={{ position: "relative", display: "flex", gap: 6, background: cardMuted, padding: 5, borderRadius: 14 }}>
              {(["efectivo", "tarjeta"] as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  onClick={() => !isLocked && setMethod(m)}
                  disabled={isLocked}
                  style={{
                    position: "relative",
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    padding: "10px 0",
                    borderRadius: 10,
                    border: "none",
                    background: "transparent",
                    fontFamily: "inherit",
                    fontSize: "0.84rem",
                    fontWeight: 700,
                    color: method === m ? text : textSecondary,
                    cursor: isLocked ? "not-allowed" : "pointer",
                  }}
                >
                  {method === m && (
                    <motion.span
                      layoutId="csm-method-bg"
                      transition={{ type: "spring", duration: 0.4, bounce: 0.18 }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 10,
                        background: cardBg,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      }}
                    />
                  )}
                  <span style={{ position: "relative", display: "flex", alignItems: "center", gap: 7 }}>
                    {m === "efectivo" ? <Banknote size={15} /> : <CreditCard size={15} />}
                    {m === "efectivo" ? cs.cash : cs.card}
                  </span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {method === "efectivo" ? (
                <motion.div
                  key="cash"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: EASE }}
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <p style={{ margin: 0, fontSize: "0.78rem", color: textSecondary, lineHeight: 1.5 }}>
                    {cs.cashHint}
                  </p>
                  <DragToConfirm
                    label={cs.dragLabel}
                    confirmedLabel={cs.dragConfirmedLabel}
                    onConfirm={onConfirmCash}
                    isDark={isDark}
                    accentColor="#4AA825"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="card"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: EASE }}
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  <p style={{ margin: 0, fontSize: "0.78rem", color: textSecondary, lineHeight: 1.5 }}>
                    {cs.cardHint}
                  </p>
                  <motion.button
                    whileHover={isLocked ? undefined : { scale: 1.02 }}
                    whileTap={isLocked ? undefined : { scale: 0.98 }}
                    onClick={onStartCardPayment}
                    disabled={isLocked}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      padding: "13px 20px",
                      borderRadius: 12,
                      border: "none",
                      background: accent,
                      color: "#fff",
                      fontSize: "0.85rem",
                      fontWeight: 800,
                      cursor: isLocked ? "not-allowed" : "pointer",
                      opacity: isLocked ? 0.7 : 1,
                      fontFamily: "inherit",
                      boxShadow: "0 4px 14px rgba(46,188,204,0.3)",
                    }}
                  >
                    <span>{cs.continueButton}</span>
                    {isStartingCardPayment ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                        <Loader2 size={15} />
                      </motion.div>
                    ) : (
                      <ArrowRight size={15} />
                    )}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default CompleteServiceModal;
