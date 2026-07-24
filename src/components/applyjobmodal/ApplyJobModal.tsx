// Modal for providers to submit a proposal / counter-offer for a job.

import { useState } from "react";
import { X, ArrowRight, CheckCircle2, Circle, Info, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useI18n } from "../../i18n";
import { useThemeMode } from "../../theme/useThemeMode";

export interface ApplyJobData {
  option: "accept" | "counter";
  price: number;
  coverLetter: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  clientPrice: number;
  onSubmit?: (data: ApplyJobData) => void;
  isSubmitting?: boolean;
}

const EASE = [0.22, 1, 0.36, 1] as const;

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: EASE },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 20,
    transition: { duration: 0.2, ease: EASE },
  },
};

const contentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: EASE, staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: EASE } },
};

const ApplyJobModal: React.FC<Props> = ({
  isOpen,
  onClose,
  jobTitle,
  clientPrice,
  onSubmit,
  isSubmitting = false,
}) => {
  const { t } = useI18n();
  const d = t("applyjobmodal");
  const { isDark } = useThemeMode();

  const [option, setOption] = useState<"accept" | "counter">("counter");
  const [counterOffer, setCounterOffer] = useState<string>(
    String(clientPrice + 30),
  );
  const [coverLetter, setCoverLetter] = useState("");

  const formattedPrice = clientPrice.toFixed(2);

  const cardBg = isDark ? "#1e2d5e" : "#ffffff";
  const inputBg = isDark ? "#273570" : "#F8FAFC";
  const border = isDark ? "#273570" : "#e5e7eb";
  const text = isDark ? "#ffffff" : "#1B244C";
  const textSecondary = "#989898";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="apply-overlay"
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
            background: isDark
              ? "rgba(27,36,76,0.85)"
              : "rgba(255,255,255,0.85)",
            backdropFilter: "blur(6px)",
          }}
          onClick={onClose}
        >
          <motion.div
            key="apply-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="apply-panel"
            style={{
              width: "100%",
              maxWidth: 520,
              maxHeight: "90vh",
              overflowY: "auto",
              background: cardBg,
              borderRadius: 16,
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <style>{`
              .apply-panel {
                max-width: 520px;
              }
              @media (max-width: 600px) {
                .apply-panel {
                  max-width: calc(100vw - 32px) !important;
                  max-height: 92vh !important;
                  border-radius: 12px !important;
                }
                .apply-header {
                  padding: 20px !important;
                }
                .apply-header h2 {
                  font-size: 1rem !important;
                }
                .apply-header p {
                  font-size: 0.8rem !important;
                }
                .apply-content {
                  padding: 20px !important;
                  gap: 18px !important;
                }
                .apply-options {
                  grid-template-columns: 1fr !important;
                }
                .apply-option-btn {
                  padding: 12px !important;
                }
                .apply-actions {
                  padding: 14px 20px 20px !important;
                  flex-direction: column-reverse !important;
                  gap: 10px !important;
                }
                .apply-actions button {
                  width: 100%;
                  justify-content: center;
                }
              }
            `}</style>

            <div
              className="apply-header"
              style={{
                padding: "24px 28px",
                background: "#1B244C",
                color: "#fff",
                borderRadius: "16px 16px 0 0",
                position: "relative",
              }}
            >
              <motion.button
                onClick={onClose}
                disabled={isSubmitting}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: "absolute",
                  top: 20,
                  right: 20,
                  background: "transparent",
                  border: "none",
                  color: "rgba(255,255,255,0.7)",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  padding: 8,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={22} />
              </motion.button>
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.15rem",
                  fontWeight: 800,
                }}
              >
                {d.title}
              </h2>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "0.85rem",
                  color: "rgba(255,255,255,0.75)",
                }}
              >
                {d.subtitle.replace("{title}", jobTitle)}
              </p>
            </div>

            <motion.div
              className="apply-content"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              style={{
                padding: "24px 28px",
                display: "flex",
                flexDirection: "column",
                gap: 24,
              }}
            >
              <motion.div variants={itemVariants}>
                <h3
                  style={{
                    margin: "0 0 14px",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    color: textSecondary,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {d.priceProposal}
                </h3>

                <div
                  className="apply-options"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    marginBottom: 14,
                  }}
                >
                  <motion.button
                    className="apply-option-btn"
                    onClick={() => !isSubmitting && setOption("accept")}
                    disabled={isSubmitting}
                    whileHover={{ y: -2, boxShadow: "0 4px 14px rgba(0,0,0,0.08)" }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: 14,
                      borderRadius: 12,
                      border: `1px solid ${
                        option === "accept" ? "#2EBCCC" : border
                      }`,
                      boxShadow:
                        option === "accept"
                          ? "0 0 0 1px #2EBCCC"
                          : "none",
                      background:
                        option === "accept"
                          ? "rgba(46,188,204,0.08)"
                          : cardBg,
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      textAlign: "left",
                      fontFamily: "inherit",
                    }}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={option === "accept" ? "accept-checked" : "accept-unchecked"}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        {option === "accept" ? (
                          <CheckCircle2 size={18} color="#2EBCCC" />
                        ) : (
                          <Circle size={18} color={textSecondary} />
                        )}
                      </motion.div>
                    </AnimatePresence>
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          color: option === "accept" ? "#2EBCCC" : text,
                        }}
                      >
                        {d.options.acceptClientPrice}
                      </p>
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: "0.75rem",
                          color:
                            option === "accept" ? "#2EBCCC" : textSecondary,
                        }}
                      >
                        {d.options.submitAt} ${formattedPrice}
                      </p>
                    </div>
                  </motion.button>

                  <motion.button
                    className="apply-option-btn"
                    onClick={() => !isSubmitting && setOption("counter")}
                    disabled={isSubmitting}
                    whileHover={{ y: -2, boxShadow: "0 4px 14px rgba(0,0,0,0.08)" }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: 14,
                      borderRadius: 12,
                      border: `1px solid ${
                        option === "counter" ? "#2EBCCC" : border
                      }`,
                      boxShadow:
                        option === "counter"
                          ? "0 0 0 1px #2EBCCC"
                          : "none",
                      background:
                        option === "counter"
                          ? "rgba(46,188,204,0.08)"
                          : cardBg,
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      textAlign: "left",
                      fontFamily: "inherit",
                    }}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={option === "counter" ? "counter-checked" : "counter-unchecked"}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        {option === "counter" ? (
                          <CheckCircle2 size={18} color="#2EBCCC" />
                        ) : (
                          <Circle size={18} color={textSecondary} />
                        )}
                      </motion.div>
                    </AnimatePresence>
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          color: option === "counter" ? "#2EBCCC" : text,
                        }}
                      >
                        {d.options.counterOffer}
                      </p>
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: "0.75rem",
                          color:
                            option === "counter" ? "#2EBCCC" : textSecondary,
                        }}
                      >
                        {d.options.negotiatePrice}
                      </p>
                    </div>
                  </motion.button>
                </div>

                <motion.div
                  style={{
                    background: inputBg,
                    borderRadius: 12,
                    padding: 16,
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 10px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: text,
                    }}
                  >
                    {d.counterOffer.label}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: `1px solid ${border}`,
                      background: cardBg,
                      transition: "border-color 0.2s, box-shadow 0.2s",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: textSecondary,
                      }}
                    >
                      $
                    </span>
                    <input
                      type="number"
                      value={counterOffer}
                      onChange={(e) => setCounterOffer(e.target.value)}
                      disabled={option === "accept" || isSubmitting}
                      style={{
                        flex: 1,
                        border: "none",
                        outline: "none",
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: text,
                        fontFamily: "inherit",
                        background: "transparent",
                        cursor: option === "accept" || isSubmitting ? "not-allowed" : "auto",
                        MozAppearance: "textfield",
                        WebkitAppearance: "none",
                        margin: 0,
                      } as React.CSSProperties}
                    />
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: textSecondary,
                        fontWeight: 600,
                      }}
                    >
                      {d.counterOffer.currency}
                    </span>
                  </div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{
                      margin: "10px 0 0",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: "0.72rem",
                      color: textSecondary,
                    }}
                  >
                    <Info size={12} />
                    {d.counterOffer.feeNotice}
                  </motion.p>
                </motion.div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "0.78rem",
                      fontWeight: 800,
                      color: textSecondary,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    {d.coverLetter.label}
                  </h3>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      color: textSecondary,
                    }}
                  >
                    {d.coverLetter.hint}
                  </span>
                </div>
                <motion.textarea
                  whileFocus={{
                    boxShadow: "0 0 0 3px rgba(46,188,204,0.2)",
                    borderColor: "#2EBCCC",
                  }}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder={d.coverLetter.placeholder}
                  rows={5}
                  disabled={isSubmitting}
                  style={{
                    width: "100%",
                    padding: 14,
                    borderRadius: 12,
                    border: `1px solid ${border}`,
                    background: cardBg,
                    color: text,
                    fontSize: "0.85rem",
                    fontFamily: "inherit",
                    resize: "none",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                    cursor: isSubmitting ? "not-allowed" : "auto",
                  }}
                />
              </motion.div>
            </motion.div>

            <motion.div
              className="apply-actions"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              style={{
                padding: "16px 28px 24px",
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
              }}
            >
              <motion.button
                onClick={onClose}
                disabled={isSubmitting}
                whileHover={{
                  scale: 1.02,
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.06)",
                }}
                whileTap={{ scale: 0.98 }}
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  border: "none",
                  background: "transparent",
                  color: textSecondary,
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                {d.actions.cancel}
              </motion.button>
              <motion.button
                onClick={() =>
                  onSubmit?.({
                    option,
                    price:
                      option === "accept"
                        ? clientPrice
                        : parseFloat(counterOffer) || clientPrice,
                    coverLetter,
                  })
                }
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  padding: "10px 20px",
                  borderRadius: 10,
                  border: "none",
                  background: isSubmitting ? "#b0b0b0" : "#2EBCCC",
                  color: "#fff",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "background 0.2s",
                  opacity: isSubmitting ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) e.currentTarget.style.background = "#239aaa";
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) e.currentTarget.style.background = "#2EBCCC";
                }}
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <Loader2 size={16} />
                  </motion.div>
                ) : (
                  <>
                    {option === "accept"
                      ? d.actions.submitProposal
                      : d.actions.submitCounterOffer}
                    <motion.div
                      initial={{ x: 0 }}
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight size={16} />
                    </motion.div>
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ApplyJobModal;
