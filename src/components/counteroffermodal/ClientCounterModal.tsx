import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, Loader2 } from "lucide-react";
import { useI18n } from "../../i18n";
import { useThemeMode } from "../../theme/useThemeMode";
import Avatar from "../avatar/Avatar";
import { formatBidInputValue } from "../../utils/bidInput";

export interface ClientCounterData {
  newBid: number;
  message: string;
}

interface ClientCounterModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: {
    name: string;
    avatarUrl?: string;
    originalBid: number;
  };
  onSubmit?: (data: ClientCounterData) => void | Promise<void>;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}

const MAX_MESSAGE_LENGTH = 300;

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

export const ClientCounterModal: React.FC<ClientCounterModalProps> = ({
  isOpen,
  onClose,
  applicant,
  onSubmit,
  isSubmitting = false,
  errorMessage = null,
}) => {
  const { t } = useI18n();
  const d = t("clientcountermodal");
  const { isDark } = useThemeMode();

  const cardBg = isDark ? "#1e2d5e" : "#ffffff";
  const cardMuted = isDark ? "#273570" : "#F8FAFB";
  const inputBg = isDark ? "#151c38" : "#ffffff";
  const border = isDark ? "#273570" : "#E2E8F0";
  const errorColor = "#c0392b";
  const text = isDark ? "#ffffff" : "#1B244C";
  const textSecondary = "#989898";

  const defaultBid = Math.max(0, applicant.originalBid - 50);
  const [newBid, setNewBid] = useState<number>(defaultBid);
  const [bidDisplay, setBidDisplay] = useState<string>(formatBidInputValue(String(defaultBid)).display);
  const [message, setMessage] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const validate = (): string | null => {
    if (!Number.isFinite(newBid) || newBid <= 0) return d.errors.invalidBid;
    if (newBid === applicant.originalBid) return d.errors.sameBid;
    if (message.length > MAX_MESSAGE_LENGTH) return d.errors.messageTooLong;
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    const error = validate();
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);
    await onSubmit?.({ newBid, message: message.trim() });
  };

  const displayedError = validationError ?? errorMessage;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="counter-overlay"
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
            key="counter-panel"
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
              gap: 20,
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

            <motion.div
              variants={itemVariants}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: cardMuted,
                borderRadius: 14,
                padding: 14,
                border: `1px solid ${border}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar photoUrl={applicant.avatarUrl} name={applicant.name} size={40} />
                <div>
                  <p style={{ margin: 0, fontSize: "0.65rem", fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase", color: textSecondary }}>
                    {d.applicant}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 700, color: text }}>{applicant.name}</p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: "0.65rem", fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase", color: textSecondary }}>
                  {d.originalBid}
                </p>
                <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 800, color: text }}>${applicant.originalBid}</p>
              </div>
            </motion.div>

            <motion.form variants={itemVariants} onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: text, marginBottom: 6 }}>
                  {d.newBidLabel}
                </label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      color: textSecondary,
                    }}
                  >
                    $
                  </span>
                  <motion.input
                    whileFocus={{ boxShadow: "0 0 0 3px rgba(46,188,204,0.2)", borderColor: "#2EBCCC" }}
                    transition={{ duration: 0.15 }}
                    type="text"
                    inputMode="decimal"
                    value={bidDisplay}
                    onChange={(e) => {
                      const { display, numeric } = formatBidInputValue(e.target.value);
                      setBidDisplay(display);
                      setNewBid(numeric);
                      setValidationError(null);
                    }}
                    disabled={isSubmitting}
                    style={{
                      width: "100%",
                      borderRadius: 12,
                      border: `1px solid ${border}`,
                      background: inputBg,
                      padding: "10px 16px 10px 28px",
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      color: text,
                      fontFamily: "inherit",
                      outline: "none",
                      boxSizing: "border-box",
                      MozAppearance: "textfield",
                      WebkitAppearance: "none",
                      margin: 0,
                    } as React.CSSProperties}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: text, marginBottom: 6 }}>
                  {d.messageLabel} {applicant.name.split(" ")[0]}
                </label>
                <motion.textarea
                  whileFocus={{ boxShadow: "0 0 0 3px rgba(46,188,204,0.2)", borderColor: "#2EBCCC" }}
                  transition={{ duration: 0.15 }}
                  rows={3}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    setValidationError(null);
                  }}
                  placeholder={d.messagePlaceholder}
                  disabled={isSubmitting}
                  style={{
                    width: "100%",
                    borderRadius: 12,
                    border: `1px solid ${border}`,
                    background: inputBg,
                    padding: 12,
                    fontSize: "0.78rem",
                    color: text,
                    fontFamily: "inherit",
                    resize: "none",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <div style={{ textAlign: "right", fontSize: "0.68rem", color: message.length > MAX_MESSAGE_LENGTH ? errorColor : textSecondary, marginTop: 4 }}>
                  {message.length}/{MAX_MESSAGE_LENGTH}
                </div>
              </div>

              {displayedError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: errorColor,
                    background: "rgba(192,57,43,0.1)",
                    borderRadius: 10,
                    padding: "10px 12px",
                  }}
                >
                  {displayedError}
                </motion.div>
              )}

              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, paddingTop: 4 }}>
                <motion.button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.97 }}
                  style={{
                    padding: "10px 16px",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: textSecondary,
                    background: "transparent",
                    border: "none",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {d.cancel}
                </motion.button>
                <motion.button
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    borderRadius: 12,
                    background: "#2EBCCC",
                    padding: "10px 20px",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    color: "#fff",
                    border: "none",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    opacity: isSubmitting ? 0.7 : 1,
                    fontFamily: "inherit",
                  }}
                >
                  {isSubmitting ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                      <Loader2 size={14} />
                    </motion.div>
                  ) : (
                    <>
                      {d.send}
                      <Send size={14} />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default ClientCounterModal;
