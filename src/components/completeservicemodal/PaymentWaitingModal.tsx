import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { CreditCard, Check, X as XIcon, RotateCcw, Loader2 } from "lucide-react";
import { useI18n } from "../../i18n";

const EASE = [0.22, 1, 0.36, 1] as const;

export type PaymentWaitStatus = "waiting" | "success" | "failed";

export interface PaymentWaitingModalProps {
  isOpen: boolean;
  isDark: boolean;
  status: PaymentWaitStatus;
  onSuccessContinue: () => void;
  onRetry: () => void;
  onCancel: () => void;
  isRetrying: boolean;
  isCancelling: boolean;
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

const PaymentWaitingModal: React.FC<PaymentWaitingModalProps> = ({
  isOpen,
  isDark,
  status,
  onSuccessContinue,
  onRetry,
  onCancel,
  isRetrying,
  isCancelling,
}) => {
  const { t } = useI18n();
  const pw = t("paymentwaitingmodal");

  useEffect(() => {
    if (status !== "success") return;
    const timer = setTimeout(onSuccessContinue, 900);
    return () => clearTimeout(timer);
  }, [status, onSuccessContinue]);

  const cardBg = isDark ? "#1e2d5e" : "#ffffff";
  const border = isDark ? "#273570" : "#E2E8F0";
  const text = isDark ? "#ffffff" : "#1B244C";
  const textSecondary = "#989898";

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="payment-waiting-overlay"
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
        >
          <motion.div
            key="payment-waiting-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              width: "100%",
              maxWidth: 400,
              background: cardBg,
              borderRadius: 24,
              padding: "36px 28px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              border: `1px solid ${border}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 18,
              textAlign: "center",
            }}
          >
            <AnimatePresence mode="wait">
              {status === "waiting" && (
                <motion.div
                  key="waiting-icon"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  style={{ position: "relative", width: 72, height: 72, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <motion.span
                    animate={{ scale: [1, 1.5], opacity: [0.35, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                    style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#2EBCCC" }}
                  />
                  <div
                    style={{
                      position: "relative",
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      background: "rgba(46,188,204,0.14)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#2EBCCC",
                    }}
                  >
                    <CreditCard size={26} />
                  </div>
                </motion.div>
              )}

              {status === "success" && (
                <motion.div
                  key="success-icon"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    background: "#4AA825",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Check size={28} color="#fff" strokeWidth={2.5} />
                </motion.div>
              )}

              {status === "failed" && (
                <motion.div
                  key="failed-icon"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    background: "rgba(255,0,0,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FF0000",
                  }}
                >
                  <XIcon size={28} strokeWidth={2.5} />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <h3 style={{ margin: 0, fontSize: "1.02rem", fontWeight: 800, color: text }}>
                {status === "waiting" ? pw.waitingTitle : status === "success" ? pw.successTitle : pw.failedTitle}
              </h3>
              <p style={{ margin: "8px 0 0", fontSize: "0.82rem", color: textSecondary, lineHeight: 1.5 }}>
                {status === "waiting" ? pw.waitingSubtitle : status === "success" ? pw.successSubtitle : pw.failedSubtitle}
              </p>
            </div>

            {status === "waiting" && (
              <motion.button
                whileHover={isCancelling ? undefined : { scale: 1.02 }}
                whileTap={isCancelling ? undefined : { scale: 0.97 }}
                onClick={onCancel}
                disabled={isCancelling}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "none",
                  border: "none",
                  color: textSecondary,
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  cursor: isCancelling ? "not-allowed" : "pointer",
                  opacity: isCancelling ? 0.7 : 1,
                  fontFamily: "inherit",
                  padding: "6px 10px",
                }}
              >
                {isCancelling && (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <Loader2 size={13} />
                  </motion.div>
                )}
                {pw.cancel}
              </motion.button>
            )}

            {status === "failed" && (
              <motion.button
                whileHover={isRetrying ? undefined : { scale: 1.02 }}
                whileTap={isRetrying ? undefined : { scale: 0.97 }}
                onClick={onRetry}
                disabled={isRetrying}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "11px 22px",
                  borderRadius: 12,
                  border: "none",
                  background: "#2EBCCC",
                  color: "#fff",
                  fontSize: "0.84rem",
                  fontWeight: 800,
                  cursor: isRetrying ? "not-allowed" : "pointer",
                  opacity: isRetrying ? 0.7 : 1,
                  fontFamily: "inherit",
                  boxShadow: "0 4px 14px rgba(46,188,204,0.3)",
                }}
              >
                {isRetrying ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <RotateCcw size={15} />
                  </motion.div>
                ) : (
                  <RotateCcw size={15} />
                )}
                {pw.retry}
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default PaymentWaitingModal;
