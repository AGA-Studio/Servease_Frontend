import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Star, ArrowRight, Loader2 } from "lucide-react";
import { useI18n } from "../../i18n";
import { useThemeMode } from "../../theme/useThemeMode";

export interface RatingData {
  rating: number;
  comment: string;
}

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: {
    name: string;
    profession?: string;
    avatarUrl?: string;
    rating: number;
    reviewsCount: number;
  };
  onSubmit?: (data: RatingData) => void | Promise<void>;
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

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  provider,
  onSubmit,
  isSubmitting = false,
}) => {
  const { t } = useI18n();
  const d = t("ratingmodal");
  const { isDark } = useThemeMode();

  const cardBg = isDark ? "#1e2d5e" : "#ffffff";
  const cardMuted = isDark ? "#273570" : "#F8FAFB";
  const inputBg = isDark ? "#151c38" : "#ffffff";
  const border = isDark ? "#273570" : "#E2E8F0";
  const text = isDark ? "#ffffff" : "#1B244C";
  const textSecondary = "#989898";

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    await onSubmit?.({ rating, comment });
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="rating-overlay"
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
            key="rating-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
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
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "absolute",
                top: 22,
                right: 22,
                background: "transparent",
                border: "none",
                color: textSecondary,
                cursor: "pointer",
                padding: 4,
                display: "flex",
              }}
            >
              <X size={20} />
            </motion.button>

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
                justifyContent: "space-between",
                background: cardMuted,
                borderRadius: 16,
                padding: 16,
                border: `1px solid ${border}`,
                marginBottom: 24,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <img
                  src={provider.avatarUrl || "https://i.pravatar.cc/150?img=47"}
                  alt={provider.name}
                  style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                />
                <div>
                  <h4 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: text }}>{provider.name}</h4>
                  {provider.profession && (
                    <p style={{ margin: "2px 0 0", fontSize: "0.7rem", fontWeight: 600, color: textSecondary }}>
                      {provider.profession}
                    </p>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, fontSize: "0.7rem", fontWeight: 700, color: "#2EBCCC" }}>
                    <Star size={12} fill="#2EBCCC" color="#2EBCCC" />
                    <span>{provider.rating.toFixed(1)}</span>
                    <span style={{ color: textSecondary, fontWeight: 500 }}>
                      ({provider.reviewsCount} {d.reviews})
                    </span>
                  </div>
                </div>
              </div>

              <span
                style={{
                  padding: "4px 12px",
                  background: "rgba(46,188,204,0.15)",
                  color: "#2EBCCC",
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  borderRadius: 999,
                  letterSpacing: 0.4,
                }}
              >
                {d.completed}
              </span>
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
                        onClick={() => setRating(starIndex)}
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
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={d.placeholder}
                  style={{
                    width: "100%",
                    borderRadius: 16,
                    border: `1px solid ${border}`,
                    background: inputBg,
                    padding: 14,
                    fontSize: "0.78rem",
                    color: text,
                    fontFamily: "inherit",
                    resize: "none",
                    outline: "none",
                    boxSizing: "border-box",
                    lineHeight: 1.5,
                  }}
                />
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

export default RatingModal;
