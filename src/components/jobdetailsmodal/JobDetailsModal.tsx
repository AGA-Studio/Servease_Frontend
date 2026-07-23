// Modal that shows full job details: images, description, client card, map and apply action.

import { useState } from "react";
import {
  MapPin,
  Calendar,
  Clock,
  Star,
  X,
  ArrowRight,
} from "lucide-react";
import { useThemeMode } from "../../theme/useThemeMode";
import { useI18n } from "../../i18n";
import type { JobDetails } from "../../types/job";

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
}

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
    <div
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
    </div>
  </div>
);

const JobDetailsModal: React.FC<Props> = ({ isOpen, onClose, job, onApply }) => {
  const { isDark } = useThemeMode();
  const { t } = useI18n();
  const d = t("postdetailsscreen");
  const [selectedThumb, setSelectedThumb] = useState(0);

  if (!isOpen || !job) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(27,36,76,0.85)",
        backdropFilter: "blur(6px)",
      }}
      onClick={onClose}
    >
      <div
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
        `}</style>

        <div
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
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(1.3rem, 3vw, 1.7rem)",
                fontWeight: 800,
                color: "var(--text)",
              }}
            >
              {job.title}
            </h1>
            <div
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
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
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
            </div>
            <button
              onClick={onClose}
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
            </button>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 28,
            background: "var(--main-bg)",
          }}
        >
          <div className="jdm-main-grid">
            <div>
              <img
                src={job.mainImage}
                alt={job.title}
                style={{
                  width: "100%",
                  height: 320,
                  objectFit: "cover",
                  borderRadius: 16,
                  marginBottom: 14,
                }}
              />

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                {job.thumbnails.map((thumb, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedThumb(idx)}
                    style={{
                      padding: 0,
                      border: `2px solid ${
                        selectedThumb === idx ? "#2EBCCC" : "transparent"
                      }`,
                      borderRadius: 10,
                      overflow: "hidden",
                      cursor: "pointer",
                      background: "none",
                    }}
                  >
                    <img
                      src={thumb}
                      alt={`thumbnail ${idx + 1}`}
                      style={{
                        width: 80,
                        height: 60,
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </button>
                ))}
              </div>

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
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div
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
                  <img
                    src={job.client.avatar}
                    alt={job.client.name}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      objectFit: "cover",
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

                <button
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
                </button>
              </div>

              <div
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
              </div>

              {onApply && (
              <button
                onClick={onApply}
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
                <ArrowRight size={18} />
              </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;
