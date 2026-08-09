import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Camera, Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useI18n } from "../../i18n";
import { useThemeMode } from "../../theme/useThemeMode";
import type { PortafolioItem } from "../../api/portafolioApi";
import ImageWithFallback from "../imagewithfallback/ImageWithFallback";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: PortafolioItem | null;
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

const PortfolioItemModal: React.FC<Props> = ({ isOpen, onClose, item }) => {
  const { t } = useI18n();
  const pp = t("profile").provider.portfolio;
  const { isDark } = useThemeMode();
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [lastItemId, setLastItemId] = useState(item?.id_portafolio);
  if (item && item.id_portafolio !== lastItemId) {
    setLastItemId(item.id_portafolio);
    setSelectedPhoto(0);
  }

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!item) return null;

  const fotos = item.fotos ?? [];
  const currentPhoto = fotos[selectedPhoto] ?? fotos[0];

  const goToPhoto = (idx: number) => {
    if (fotos.length === 0) return;
    setSelectedPhoto((idx + fotos.length) % fotos.length);
  };

  const postedOn = item.fecha
    ? new Date(item.fecha).toLocaleDateString(undefined, {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="pim-overlay"
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
            background: isDark ? "rgba(27,36,76,0.85)" : "rgba(255,255,255,0.85)",
            backdropFilter: "blur(6px)",
          }}
          onClick={onClose}
        >
          <motion.div
            key="pim-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="pim-panel"
            style={{
              width: "100%",
              maxWidth: 760,
              maxHeight: "90vh",
              overflowY: "auto",
              overflowX: "hidden",
              background: isDark ? "#1e2d5e" : "#ffffff",
              borderRadius: 16,
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <style>{`
              .pim-root {
                --card-bg: ${isDark ? "#1e2d5e" : "#ffffff"};
                --text: ${isDark ? "#ffffff" : "#000000"};
                --text-secondary: #989898;
                --divider: ${isDark ? "#273570" : "#e5e7eb"};
              }
              @media (max-width: 600px) {
                .pim-panel {
                  border-radius: 12px !important;
                  max-width: calc(100vw - 32px) !important;
                  max-height: 92vh !important;
                }
                .pim-header { padding: 16px !important; }
                .pim-title { font-size: 1.1rem !important; }
                .pim-content { padding: 16px !important; }
                .pim-main-image { height: 220px !important; border-radius: 12px !important; }
              }
            `}</style>

            <div
              className="pim-root pim-header"
              style={{
                padding: "20px 28px",
                borderBottom: "1px solid var(--divider)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <motion.h1
                  className="pim-title"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.25, ease: EASE }}
                  style={{
                    margin: 0,
                    fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
                    fontWeight: 800,
                    color: "var(--text)",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  {item.titulo}
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.25, ease: EASE }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginTop: 10,
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "3px 10px",
                      borderRadius: 20,
                      background: "rgba(46,188,204,0.12)",
                      color: "#2EBCCC",
                      fontWeight: 600,
                    }}
                  >
                    <Camera size={12} />
                    {item.categoria_nombre}
                  </span>
                  {postedOn && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Calendar size={13} />
                      {pp.detailModal.postedOn} {postedOn}
                    </span>
                  )}
                </motion.div>
              </div>

              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  padding: 8,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
                aria-label="close"
              >
                <X size={22} />
              </motion.button>
            </div>

            <motion.div
              className="pim-root pim-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.25, ease: EASE }}
              style={{ padding: 28, background: "var(--main-bg)" }}
            >
              <div
                className="pim-main-image"
                style={{
                  position: "relative",
                  width: "100%",
                  height: 340,
                  borderRadius: 16,
                  marginBottom: 14,
                  overflow: "hidden",
                }}
              >
                <ImageWithFallback
                  src={currentPhoto}
                  alt={item.titulo}
                  isDark={isDark}
                  borderRadius={16}
                  size="lg"
                  style={{ width: "100%", height: "100%" }}
                />

                {fotos.length > 1 && (
                  <>
                    <motion.button
                      onClick={() => goToPhoto(selectedPhoto - 1)}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      transition={{ duration: 0.15, ease: EASE }}
                      aria-label="previous photo"
                      style={{
                        position: "absolute",
                        left: 12,
                        top: "calc(50% - 17px)",
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        border: "none",
                        background: "rgba(0,0,0,0.45)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <ChevronLeft size={18} />
                    </motion.button>
                    <motion.button
                      onClick={() => goToPhoto(selectedPhoto + 1)}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      transition={{ duration: 0.15, ease: EASE }}
                      aria-label="next photo"
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "calc(50% - 17px)",
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        border: "none",
                        background: "rgba(0,0,0,0.45)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <ChevronRight size={18} />
                    </motion.button>
                  </>
                )}
              </div>

              {fotos.length > 1 && (
                <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
                  {fotos.map((foto, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => setSelectedPhoto(idx)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.96 }}
                      animate={{
                        borderColor: selectedPhoto === idx ? "#2EBCCC" : "transparent",
                      }}
                      transition={{ duration: 0.2 }}
                      style={{
                        position: "relative",
                        padding: 0,
                        borderWidth: 2,
                        borderStyle: "solid",
                        borderRadius: 10,
                        overflow: "hidden",
                        cursor: "pointer",
                        width: 72,
                        height: 54,
                      }}
                    >
                      <ImageWithFallback
                        src={foto}
                        alt={`${item.titulo} ${idx + 1}`}
                        isDark={isDark}
                        borderRadius={8}
                        size="sm"
                        style={{ width: "100%", height: "100%" }}
                      />
                    </motion.button>
                  ))}
                </div>
              )}

              <div
                style={{
                  background: "var(--card-bg)",
                  borderRadius: 16,
                  border: "1px solid var(--divider)",
                  padding: 24,
                }}
              >
                <h2
                  style={{
                    margin: "0 0 12px",
                    fontSize: "1rem",
                    fontWeight: 800,
                    color: "var(--text)",
                  }}
                >
                  {pp.description}
                </h2>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.9rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.7,
                    whiteSpace: "pre-line",
                    overflowWrap: "break-word",
                  }}
                >
                  {item.descripcion || pp.detailModal.noDescription}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default PortfolioItemModal;
