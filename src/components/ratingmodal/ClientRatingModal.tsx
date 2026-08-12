import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Star, ArrowRight, Loader2 } from "lucide-react";
import { useI18n } from "../../i18n";
import { useThemeMode } from "../../theme/useThemeMode";
import Avatar from "../avatar/Avatar";

export interface ClientRatingData {
  rating: number;
  comment: string;
}

interface ClientRatingModalProps {
  isOpen: boolean;
  provider: {
    name: string;
    avatarUrl?: string;
    rating?: number;
    reviewsCount?: number;
  };
  onSubmit: (data: ClientRatingData) => void | Promise<void>;
  isSubmitting?: boolean;
}

const EASE = [0.22, 1, 0.36, 1] as const;

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

/** Rating modal shown to the client once their provider marks the service completed.
 * Intentionally non-closable (no X, no overlay click-through) until they submit. */
export const ClientRatingModal: React.FC<ClientRatingModalProps> = ({
  isOpen,
  provider,
  onSubmit,
  isSubmitting = false,
}) => {
  const { t } = useI18n();
  const d = t("clientratingmodal");
  const { isDark } = useThemeMode();

  const cardBg = isDark ? "#1e2d5e" : "#ffffff";
  const cardMuted = isDark ? "#273570" : "#F8FAFB";
  const inputBg = isDark ? "#151c38" : "#ffffff";
  const border = isDark ? "#273570" : "#E2E8F0";
  const text = isDark ? "#ffffff" : "#1B244C";
  const textSecondary = "#989898";

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string | null>(null);

  const messages = d.messagesByRating[rating] ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    await onSubmit({ rating, comment: comment ?? "" });
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="client-rating-overlay"
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
            key="client-rating-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              width: "100%",
              maxWidth: 480,
              background: cardBg,
              borderRadius: 24,
              border: `1px solid ${border}`,
              padding: 28,
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              position: "relative",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: text, letterSpacing: -0.3 }}>
                {d.title}
              </h2>
              <p style={{ margin: "6px 0 0", fontSize: "0.78rem", fontWeight: 600, color: textSecondary }}>
                {d.subtitle}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                background: cardMuted,
                borderRadius: 16,
                padding: 16,
                border: `1px solid ${border}`,
                marginBottom: 24,
              }}
            >
              <Avatar photoUrl={provider.avatarUrl} name={provider.name} size={48} />
              <div>
                <h4 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: text }}>{provider.name}</h4>
                {provider.rating != null && provider.reviewsCount != null && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, fontSize: "0.7rem", fontWeight: 700, color: "#2EBCCC" }}>
                    <Star size={12} fill="#2EBCCC" color="#2EBCCC" />
                    <span>{provider.rating.toFixed(1)}</span>
                    <span style={{ color: textSecondary, fontWeight: 500 }}>
                      ({provider.reviewsCount} {d.reviews})
                    </span>
                  </div>
                )}
                <span
                  style={{
                    display: "inline-block",
                    marginTop: 6,
                    padding: "3px 10px",
                    background: "rgba(74,168,37,0.15)",
                    color: "#4AA825",
                    fontSize: "0.62rem",
                    fontWeight: 800,
                    borderRadius: 999,
                    letterSpacing: 0.4,
                  }}
                >
                  {d.completed}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ textAlign: "center" }}>
                <p
                  style={{
                    margin: "0 0 12px",
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                    color: text,
                  }}
                >
                  {d.selectRating}
                </p>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
                  {[1, 2, 3, 4, 5].map((starIndex) => {
                    const active = starIndex <= (hoverRating ?? rating);
                    return (
                      <motion.button
                        key={starIndex}
                        type="button"
                        whileHover={{ scale: 1.25 }}
                        whileTap={{ scale: 0.85 }}
                        onClick={() => {
                          setRating(starIndex);
                          setComment(null);
                        }}
                        onMouseEnter={() => setHoverRating(starIndex)}
                        onMouseLeave={() => setHoverRating(null)}
                        style={{ padding: 4, background: "transparent", border: "none", cursor: "pointer", display: "flex" }}
                      >
                        <Star
                          size={32}
                          color={active ? "#2EBCCC" : border}
                          fill={active ? "#2EBCCC" : "transparent"}
                          style={{ transition: "all 0.15s" }}
                        />
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p
                  style={{
                    margin: "0 0 10px",
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                    color: text,
                  }}
                >
                  {d.shareExperience}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {messages.map((message) => {
                    const selected = comment === message;
                    return (
                      <motion.button
                        key={message}
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setComment(selected ? null : message)}
                        style={{
                          textAlign: "left",
                          borderRadius: 14,
                          border: `1.5px solid ${selected ? "#2EBCCC" : border}`,
                          background: selected ? "rgba(46,188,204,0.1)" : inputBg,
                          padding: "12px 14px",
                          fontSize: "0.78rem",
                          fontWeight: selected ? 700 : 500,
                          color: selected ? "#2EBCCC" : text,
                          fontFamily: "inherit",
                          cursor: "pointer",
                          lineHeight: 1.4,
                        }}
                      >
                        {message}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "14px 0",
                  borderRadius: 16,
                  background: "#2EBCCC",
                  color: "#fff",
                  fontSize: "0.78rem",
                  fontWeight: 800,
                  border: "none",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  opacity: isSubmitting ? 0.7 : 1,
                  fontFamily: "inherit",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                }}
              >
                {isSubmitting ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                      <Loader2 size={16} />
                    </motion.div>
                    <span>{d.submitting}</span>
                  </>
                ) : (
                  <>
                    <span>{d.submit}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default ClientRatingModal;
