

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Star, MessageSquare } from "lucide-react";
import type { ReviewCliente } from "../../api/userApi";
import EmptyState from "../emptystate/EmptyState";
import Avatar from "../avatar/Avatar";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const EASE_IN = [0.4, 0, 1, 1] as const;

interface Strings {
  title: string;
  empty: string;
  noComment: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  reviews: ReviewCliente[];
  isLoading: boolean;
  isDark: boolean;
  strings: Strings;
}

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: EASE_OUT },
  },
};

const Shimmer = ({ isDark, style }: { isDark: boolean; style?: React.CSSProperties }) => (
  <motion.div
    animate={{ opacity: [0.6, 1, 0.6] }}
    transition={{ duration: 1.4, repeat: Infinity, ease: [0.4, 0, 0.6, 1] }}
    style={{
      background: isDark ? "#273570" : "#e5e7eb",
      borderRadius: 6,
      ...style,
    }}
  />
);

const StarRow = ({ rating }: { rating: number }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={13}
        fill={i < rating ? "#2EBCCC" : "none"}
        color={i < rating ? "#2EBCCC" : "#d6dbe2"}
      />
    ))}
  </div>
);

const ReviewRow = ({
  review,
  noCommentLabel,
}: {
  review: ReviewCliente;
  noCommentLabel: string;
}) => {
  return (
    <motion.div
      variants={rowVariants}
      style={{
        display: "flex",
        gap: 14,
        padding: "16px 4px",
        borderTop: `1px solid var(--divider)`,
      }}
    >
      <Avatar photoUrl={review.foto_evaluador} name={review.nombre_evaluador} size={40} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            marginBottom: 4,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)" }}>
            {review.nombre_evaluador}
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", flexShrink: 0 }}>
            {new Date(review.fecha).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
        <StarRow rating={review.puntuacion} />
        <p
          style={{
            margin: "8px 0 0",
            fontSize: "0.85rem",
            lineHeight: 1.6,
            color: review.comentario ? "var(--text)" : "var(--text-secondary)",
            fontStyle: review.comentario ? "normal" : "italic",
          }}
        >
          {review.comentario || noCommentLabel}
        </p>
      </div>
    </motion.div>
  );
};

const ReviewsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  reviews,
  isLoading,
  isDark,
  strings,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="reviews-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.18, ease: EASE_IN } }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            background: isDark ? "rgba(27,36,76,0.85)" : "rgba(255,255,255,0.85)",
            backdropFilter: "blur(6px)",
          }}
          onClick={onClose}
        >
          <motion.div
            key="reviews-panel"
            initial={{ opacity: 0, scale: 0.95, y: 16, filter: "blur(2px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{
              opacity: 0,
              scale: 0.96,
              y: 10,
              filter: "blur(2px)",
              transition: { duration: 0.18, ease: EASE_IN },
            }}
            transition={{ duration: 0.32, ease: EASE_OUT }}
            style={{
              width: "100%",
              maxWidth: 480,
              maxHeight: "82vh",
              display: "flex",
              flexDirection: "column",
              background: isDark ? "#1e2d5e" : "#ffffff",
              borderRadius: 20,
              padding: 24,
              boxShadow: isDark
                ? "0 24px 60px -12px rgba(0,0,0,0.5)"
                : "0 24px 60px -12px rgba(20,30,40,0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
                flexShrink: 0,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  color: isDark ? "#fff" : "#000",
                }}
              >
                {strings.title}
              </h2>
              <motion.button
                onClick={onClose}
                whileTap={{ scale: 0.88 }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                  padding: 6,
                  borderRadius: 8,
                  display: "flex",
                }}
              >
                <X size={20} />
              </motion.button>
            </div>

            <div style={{ overflowY: "auto", flex: 1, marginRight: -8, paddingRight: 8 }}>
              {isLoading ? (
                <div>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 14,
                        padding: "16px 4px",
                        borderTop: i > 0 ? `1px solid var(--divider)` : undefined,
                      }}
                    >
                      <Shimmer isDark={isDark} style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <Shimmer isDark={isDark} style={{ width: "40%", height: 13, marginBottom: 8 }} />
                        <Shimmer isDark={isDark} style={{ width: "90%", height: 12 }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <EmptyState
                  icon={<MessageSquare size={28} color="#2EBCCC" />}
                  isDark={isDark}
                  title={strings.empty}
                  size="compact"
                />
              ) : (
                <motion.div variants={listVariants} initial="hidden" animate="visible">
                  {reviews.map((review) => (
                    <ReviewRow
                      key={review.id_calificacion}
                      review={review}
                      noCommentLabel={strings.noComment}
                    />
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default ReviewsModal;
