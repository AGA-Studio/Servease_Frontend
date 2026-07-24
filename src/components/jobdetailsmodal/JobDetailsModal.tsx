// Modal that shows full job details: images, description, client card, map and apply action.

import { useEffect, useState } from "react";
import ConfirmModal from "../confirmmodal/ConfirmModal";
import {
  MapPin,
  Calendar,
  Clock,
  Star,
  X,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useThemeMode } from "../../theme/useThemeMode";
import { useI18n } from "../../i18n";
import type { JobDetails } from "../../types/job";
import type { ProposalStatus } from "../../data/mockJobs";
import type { PostStatus } from "../../data/mockPosts";

const CATEGORY_KEY: Record<string, string> = {
  Locksmith: "locksmith",
  Plumbing: "plumbing",
  Electrical: "electrical",
  Gardening: "gardening",
  HVAC: "hvac",
  Cleaning: "cleaning",
  Painting: "painting",
  Carpentry: "carpentry",
  Moving: "moving",
  Other: "other",
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  job: JobDetails | null;
  onApply?: () => void;
  proposalStatus?: ProposalStatus;
  onCancelProposal?: () => void;
  postStatus?: PostStatus;
  onViewApplicants?: () => void;
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
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.25, ease: EASE, staggerChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: EASE } },
};

const MapPlaceholder = () => (
  <div
    style={{
      width: "100%",
      height: 160,
      borderRadius: 12,
      background: "#E5E7EB",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 400 160"
      preserveAspectRatio="none"
      style={{ position: "absolute", inset: 0 }}
    >
      <rect width="400" height="160" fill="#E5E7EB" />
      <path
        d="M0 80 Q100 60 200 80 T400 80"
        stroke="#D1D5DB"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M0 120 Q120 100 240 120 T400 120"
        stroke="#D1D5DB"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M80 0 Q90 60 80 120 T80 160"
        stroke="#D1D5DB"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M280 0 Q290 60 280 120 T280 160"
        stroke="#D1D5DB"
        strokeWidth="2"
        fill="none"
      />
    </svg>
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.4, ease: EASE }}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "rgba(46,188,204,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: "#2EBCCC",
        }}
      />
    </motion.div>
  </div>
);

const Shimmer = ({
  bg,
  style,
}: {
  bg: string;
  style?: React.CSSProperties;
}) => (
  <motion.div
    animate={{ opacity: [0.6, 1, 0.6] }}
    transition={{
      duration: 1.4,
      repeat: Infinity,
      ease: [0.4, 0, 0.6, 1],
    }}
    style={{ background: bg, borderRadius: 6, ...style }}
  />
);

const DescSkeleton = ({ isDark }: { isDark: boolean }) => {
  const bg = isDark ? "#273570" : "#e5e7eb";
  const cardBg = isDark ? "#1e2d5e" : "#ffffff";
  const divider = isDark ? "#273570" : "#e5e7eb";
  return (
    <motion.div
      key="jdm-desc-skeleton"
      className="jdm-desc-card"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(2px)" }}
      transition={{ duration: 0.2, ease: EASE }}
      style={{
        background: cardBg,
        borderRadius: 16,
        border: `1px solid ${divider}`,
        padding: 24,
      }}
    >
      <Shimmer bg={bg} style={{ width: "35%", height: 16, marginBottom: 16 }} />
      <Shimmer bg={bg} style={{ width: "100%", height: 12, marginBottom: 10 }} />
      <Shimmer bg={bg} style={{ width: "100%", height: 12, marginBottom: 10 }} />
      <Shimmer bg={bg} style={{ width: "70%", height: 12 }} />
    </motion.div>
  );
};

const SidebarSkeleton = ({ isDark }: { isDark: boolean }) => {
  const bg = isDark ? "#273570" : "#e5e7eb";
  const cardBg = isDark ? "#1e2d5e" : "#ffffff";
  const divider = isDark ? "#273570" : "#e5e7eb";
  return (
    <motion.div
      key="jdm-sidebar-skeleton"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(2px)" }}
      transition={{ duration: 0.2, ease: EASE }}
      style={{ display: "flex", flexDirection: "column", gap: 20 }}
    >
      <div
        className="jdm-sidebar-card"
        style={{
          background: cardBg,
          borderRadius: 16,
          border: `1px solid ${divider}`,
          padding: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
          <Shimmer bg={bg} style={{ width: 56, height: 56, borderRadius: "50%" }} />
          <div style={{ flex: 1 }}>
            <Shimmer bg={bg} style={{ width: "70%", height: 16, marginBottom: 8 }} />
            <Shimmer bg={bg} style={{ width: "45%", height: 12 }} />
          </div>
        </div>
        <Shimmer bg={bg} style={{ width: "100%", height: 40 }} />
      </div>
      <div
        className="jdm-map-card"
        style={{
          background: cardBg,
          borderRadius: 16,
          border: `1px solid ${divider}`,
          padding: 20,
        }}
      >
        <Shimmer bg={bg} style={{ width: "100%", height: 160, borderRadius: 12 }} />
      </div>
    </motion.div>
  );
};

const JobDetailsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  job,
  onApply,
  proposalStatus,
  onCancelProposal,
  postStatus,
  onViewApplicants,
}) => {
  const { isDark } = useThemeMode();
  const { t } = useI18n();
  const d = t("postdetailsscreen");
  const mp = t("myposts");
  const [selectedThumb, setSelectedThumb] = useState(0);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isContentReady, setIsContentReady] = useState(false);
  const [mainImgLoaded, setMainImgLoaded] = useState(false);
  const [loadedThumbs, setLoadedThumbs] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!isOpen || !job) return;
    const timer = setTimeout(() => setIsContentReady(true), 450);
    return () => {
      clearTimeout(timer);
      setIsContentReady(false);
      setMainImgLoaded(false);
      setLoadedThumbs({});
    };
  }, [isOpen, job?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!job) return null;

  return (
    <>

      <AnimatePresence>
      {isOpen && (
        <motion.div
          key="jdm-overlay"
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
            key="jdm-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="jdm-panel"
            style={{
              width: "100%",
              maxWidth: 960,
              maxHeight: "90vh",
              overflowY: "auto",
              background: isDark ? "#1e2d5e" : "#ffffff",
              borderRadius: 16,
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <style>{`
              .jdm-root {
                --card-bg: ${isDark ? "#1e2d5e" : "#ffffff"};
                --input-bg: ${isDark ? "#273570" : "#F8FAFC"};
                --text: ${isDark ? "#ffffff" : "#000000"};
                --text-secondary: #989898;
                --divider: ${isDark ? "#273570" : "#e5e7eb"};
              }
              .jdm-main-grid {
                display: grid;
                grid-template-columns: 1fr 340px;
                gap: 24px;
                align-items: start;
              }
              @media (max-width: 900px) {
                .jdm-main-grid {
                  grid-template-columns: 1fr;
                }
              }
              @media (max-width: 600px) {
                .jdm-panel {
                  border-radius: 12px !important;
                  max-width: calc(100vw - 32px) !important;
                  max-height: 92vh !important;
                }
                .jdm-header {
                  padding: 16px !important;
                }
                .jdm-header > div:last-child {
                  width: 100%;
                  justify-content: space-between;
                }
                .jdm-title {
                  font-size: 1.1rem !important;
                }
                .jdm-meta {
                  gap: 8px !important;
                  margin-top: 8px !important;
                }
                .jdm-content {
                  padding: 16px !important;
                }
                .jdm-main-image {
                  height: 200px !important;
                  border-radius: 12px !important;
                }
                .jdm-thumbnails button {
                  width: 64px !important;
                  height: 48px !important;
                }
                .jdm-thumbnails img {
                  width: 64px !important;
                  height: 48px !important;
                }
                .jdm-desc-card {
                  padding: 16px !important;
                  border-radius: 12px !important;
                }
                .jdm-sidebar-card {
                  padding: 16px !important;
                  border-radius: 12px !important;
                }
                .jdm-map-card {
                  padding: 14px !important;
                  border-radius: 12px !important;
                }
                .jdm-apply-btn {
                  padding: 12px !important;
                }
              }
            `}</style>

            <div
              className="jdm-header"
              style={{
                padding: "20px 28px",
                borderBottom: "1px solid var(--divider)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: 260 }}>
                <motion.h1
                  className="jdm-title"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.25, ease: EASE }}
                  style={{
                    margin: 0,
                    fontSize: "clamp(1.3rem, 3vw, 1.7rem)",
                    fontWeight: 800,
                    color: "var(--text)",
                  }}
                >
                  {job.title}
                </motion.h1>
                <motion.div
                  className="jdm-meta"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.25, ease: EASE }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginTop: 10,
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <MapPin size={13} />
                    {job.location}
                  </span>
                  <span style={{ opacity: 0.4 }}>•</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Calendar size={13} />
                    {d.when[job.when.toLowerCase() as keyof typeof d.when] ?? job.when}, {d.urgency[job.urgency.toLowerCase() as keyof typeof d.urgency] ?? job.urgency}
                  </span>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 20,
                      background: "rgba(46,188,204,0.12)",
                      color: "#2EBCCC",
                      fontWeight: 600,
                    }}
                  >
                    {d.categories[CATEGORY_KEY[job.category] as keyof typeof d.categories] ?? job.category}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Clock size={13} />
                    {d.posted} {job.postedAgo}
                  </span>
                </motion.div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15, duration: 0.25, ease: EASE }}
                  style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--divider)",
                    borderRadius: 12,
                    padding: "12px 18px",
                    minWidth: 140,
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {d.price}
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      color: "var(--text)",
                    }}
                  >
                    ${job.price.toFixed(2)}
                  </p>
                </motion.div>
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
                  }}
                >
                  <X size={22} />
                </motion.button>
              </div>
            </div>

            <motion.div
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              className="jdm-content"
              style={{
                flex: 1,
                overflowY: "auto",
                padding: 28,
                background: "var(--main-bg)",
              }}
            >
              <div className="jdm-main-grid">
                <div>
                  <motion.div variants={itemVariants}>
                    <div
                      className="jdm-main-image"
                      style={{
                        position: "relative",
                        width: "100%",
                        height: 320,
                        borderRadius: 16,
                        marginBottom: 14,
                        overflow: "hidden",
                        background: isDark ? "#273570" : "#e5e7eb",
                      }}
                    >
                      {!mainImgLoaded && (
                        <Shimmer
                          bg={isDark ? "#273570" : "#e5e7eb"}
                          style={{
                            position: "absolute",
                            inset: 0,
                            borderRadius: 0,
                          }}
                        />
                      )}
                      {job.mainImage && (
                        <motion.img
                          key={job.mainImage}
                          initial={{ opacity: 0, scale: 1.02 }}
                          animate={{
                            opacity: mainImgLoaded ? 1 : 0,
                            scale: 1,
                          }}
                          transition={{ duration: 0.35, ease: EASE }}
                          src={job.mainImage}
                          alt={job.title}
                          onLoad={() => setMainImgLoaded(true)}
                          style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      )}
                    </div>

                    <div
                      className="jdm-thumbnails"
                      style={{
                        display: "flex",
                        gap: 12,
                        marginBottom: 24,
                      }}
                    >
                      {job.thumbnails.map((thumb, idx) => (
                        <motion.button
                          key={idx}
                          onClick={() => setSelectedThumb(idx)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.96 }}
                          animate={{
                            borderColor:
                              selectedThumb === idx ? "#2EBCCC" : "transparent",
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
                            background: isDark ? "#273570" : "#e5e7eb",
                            width: 80,
                            height: 60,
                          }}
                        >
                          {!loadedThumbs[idx] && (
                            <Shimmer
                              bg={isDark ? "#273570" : "#e5e7eb"}
                              style={{
                                position: "absolute",
                                inset: 0,
                                borderRadius: 0,
                              }}
                            />
                          )}
                          <img
                            src={thumb}
                            alt={`thumbnail ${idx + 1}`}
                            onLoad={() =>
                              setLoadedThumbs((prev) => ({ ...prev, [idx]: true }))
                            }
                            style={{
                              position: "absolute",
                              inset: 0,
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                              opacity: loadedThumbs[idx] ? 1 : 0,
                              transition: "opacity 250ms ease-out",
                            }}
                          />
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  <AnimatePresence mode="wait" initial={false}>
                    {isContentReady ? (
                      <motion.div
                        key="jdm-desc-content"
                        className="jdm-desc-card"
                        initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.4, ease: EASE }}
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
                          {d.jobDescription}
                        </h2>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.9rem",
                            color: "var(--text-secondary)",
                            lineHeight: 1.7,
                            whiteSpace: "pre-line",
                          }}
                        >
                          {job.description}
                        </p>
                      </motion.div>
                    ) : (
                      <DescSkeleton isDark={isDark} />
                    )}
                  </AnimatePresence>
                </div>

                <motion.div
                  variants={itemVariants}
                  style={{ display: "flex", flexDirection: "column", gap: 20 }}
                >
                <AnimatePresence mode="wait" initial={false}>
                {!isContentReady ? (
                  <SidebarSkeleton isDark={isDark} />
                ) : (
                <motion.div
                  key="jdm-sidebar-content"
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  style={{ display: "flex", flexDirection: "column", gap: 20 }}
                >
                  <motion.div
                    className="jdm-sidebar-card"
                    variants={itemVariants}
                    style={{
                      background: "var(--card-bg)",
                      borderRadius: 16,
                      border: "1px solid var(--divider)",
                      padding: 24,
                    }}
                  >
                    <h3
                      style={{
                        margin: "0 0 18px",
                        fontSize: "0.78rem",
                        fontWeight: 800,
                        color: "var(--text-secondary)",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      {d.aboutClient}
                    </h3>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        marginBottom: 18,
                      }}
                    >
                      <motion.img
                        src={job.client.avatar}
                        alt={job.client.name}
                        whileHover={{ scale: 1.08 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: "50%",
                          objectFit: "cover",
                          cursor: "pointer",
                        }}
                      />
                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "1rem",
                            fontWeight: 700,
                            color: "var(--text)",
                          }}
                        >
                          {job.client.name}
                        </p>
                        <p
                          style={{
                            margin: "4px 0 0",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: "0.8rem",
                            color: "var(--text-secondary)",
                          }}
                        >
                          <Star size={13} color="#FFB200" fill="#FFB200" />
                          <span style={{ color: "var(--text)", fontWeight: 700 }}>
                            {job.client.rating}
                          </span>
                          ({job.client.reviewCount} {d.reviews})
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                        padding: "14px 0",
                        borderTop: "1px solid var(--divider)",
                        borderBottom: "1px solid var(--divider)",
                        marginBottom: 14,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.85rem",
                        }}
                      >
                        <span style={{ color: "var(--text-secondary)" }}>
                          {d.memberSince}
                        </span>
                        <span style={{ fontWeight: 700, color: "var(--text)" }}>
                          {job.client.memberSince}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.85rem",
                        }}
                      >
                        <span style={{ color: "var(--text-secondary)" }}>
                          {d.jobsPosted}
                        </span>
                        <span style={{ fontWeight: 700, color: "var(--text)" }}>
                          {job.client.jobsPosted}
                        </span>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ x: 2 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#2EBCCC",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        padding: 0,
                      }}
                    >
                      {d.viewProfile}
                    </motion.button>
                  </motion.div>

                  <motion.div
                    className="jdm-map-card"
                    variants={itemVariants}
                    style={{
                      background: "var(--card-bg)",
                      borderRadius: 16,
                      border: "1px solid var(--divider)",
                      padding: 20,
                    }}
                  >
                    <MapPlaceholder />
                    <p
                      style={{
                        margin: "12px 0 4px",
                        fontSize: "0.9rem",
                        fontWeight: 700,
                        color: "var(--text)",
                      }}
                    >
                      {job.location}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.78rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {d.approximateLocation}
                    </p>
                  </motion.div>

                  {proposalStatus === "pending" && onCancelProposal && (
                    <motion.button
                      className="jdm-cancel-btn"
                      variants={itemVariants}
                      onClick={() => setIsConfirmOpen(true)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        width: "100%",
                        padding: "14px",
                        borderRadius: 12,
                        border: "1.5px solid #ef4444",
                        background: "transparent",
                        color: "#ef4444",
                        fontSize: "0.95rem",
                        fontWeight: 800,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "background 0.2s, box-shadow 0.2s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(239,68,68,0.08)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {d.cancelProposal}
                    </motion.button>
                  )}

                  {postStatus === "receiving" && onViewApplicants && (
                    <motion.button
                      className="jdm-apply-btn"
                      variants={itemVariants}
                      onClick={onViewApplicants}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        width: "100%",
                        padding: "14px",
                        borderRadius: 12,
                        border: "none",
                        background: "#2EBCCC",
                        color: "#fff",
                        fontSize: "0.95rem",
                        fontWeight: 800,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "background 0.2s, box-shadow 0.2s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#239aaa")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "#2EBCCC")
                      }
                    >
                      {mp.card.viewApplicants}
                      <motion.div
                        initial={{ x: 0 }}
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ArrowRight size={18} />
                      </motion.div>
                    </motion.button>
                  )}

                  {onApply && (
                    <motion.button
                      className="jdm-apply-btn"
                      variants={itemVariants}
                      onClick={onApply}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        width: "100%",
                        padding: "14px",
                        borderRadius: 12,
                        border: "none",
                        background: "#2EBCCC",
                        color: "#fff",
                        fontSize: "0.95rem",
                        fontWeight: 800,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "background 0.2s, box-shadow 0.2s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#239aaa")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "#2EBCCC")
                      }
                    >
                      {d.apply}
                      <motion.div
                        initial={{ x: 0 }}
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ArrowRight size={18} />
                      </motion.div>
                    </motion.button>
                  )}
                </motion.div>
                )}
                </AnimatePresence>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

      {job && (
        <ConfirmModal
          isOpen={isConfirmOpen}
          isDark={isDark}
          title={d.cancelProposalConfirm}
          message={d.cancelProposalMessage.replace("{title}", job.title)}
          confirmLabel={d.cancelProposal}
          cancelLabel={d.keepApplication}
          onConfirm={() => {
            setIsConfirmOpen(false);
            onCancelProposal?.();
          }}
          onClose={() => setIsConfirmOpen(false)}
        />
      )}
    </>
  );
};

export default JobDetailsModal;
