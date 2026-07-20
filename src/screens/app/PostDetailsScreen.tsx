// Provider job post details: full job info, client card, map and apply action.

import { useState } from "react";
import {
  MapPin,
  Calendar,
  Clock,
  Star,
  ChevronRight,
} from "lucide-react";
import type { ThemeMode } from "../../theme/theme";
import { useI18n } from "../../i18n";
import ApplyJobModal, {
  type ApplyJobData,
} from "../../components/applyjobmodal/ApplyJobModal";

const useTheme = () => {
  const [theme] = useState<ThemeMode>(() =>
    typeof window !== "undefined"
      ? (localStorage.getItem("servease-theme") as ThemeMode) || "light"
      : "light",
  );
  return { theme };
};

interface JobDetails {
  title: string;
  category: string;
  location: string;
  when: string;
  urgency: string;
  postedAgo: string;
  price: number;
  description: string;
  mainImage: string;
  thumbnails: string[];
  client: {
    name: string;
    avatar: string;
    rating: number;
    reviewCount: number;
    memberSince: string;
    jobsPosted: number;
  };
}

const JOB: JobDetails = {
  title: "Emergency Locksmith Needed for Front Door",
  category: "Locksmith",
  location: "El Refugio, Tijuana",
  when: "Today",
  urgency: "ASAP",
  postedAgo: "2h ago",
  price: 780,
  description:
    "Hi, I managed to break my key inside the front door lock this morning while leaving for work. The key snapped, and half of it is stuck inside the cylinder.\n\nThe door is currently locked, but I have access through the back. I need a professional locksmith to extract the broken key piece and verify the lock still functions correctly. If the lock is damaged, I am open to replacing the cylinder (standard Yale lock).",
  mainImage:
    "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80",
  thumbnails: [
    "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&w=200&q=80",
  ],
  client: {
    name: "Maria Cazares",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
    rating: 4.9,
    reviewCount: 12,
    memberSince: "Sep. 2025",
    jobsPosted: 8,
  },
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

const PostDetailsScreen: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { t } = useI18n();
  const d = t("postdetailsscreen");

  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [selectedThumb, setSelectedThumb] = useState(0);

  const handleApplySubmit = async (data: ApplyJobData) => {
    // TODO: replace with API call to submit proposal
    console.log("Submit proposal:", { jobId: JOB.title, ...data });
    setIsApplyOpen(false);
  };

  return (
    <>
      <style>{`
        .mp-root {
          --card-bg: ${isDark ? "#1e2d5e" : "#ffffff"};
          --input-bg: ${isDark ? "#273570" : "#F8FAFC"};
          --text: ${isDark ? "#ffffff" : "#000000"};
          --text-secondary: #989898;
          --divider: ${isDark ? "#273570" : "#e5e7eb"};
        }
        .mp-main-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .mp-main-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 600px) {
          .mp-topbar {
            padding: 14px 16px !important;
          }
          .mp-content {
            padding: 16px !important;
          }
        }
      `}</style>

      <div
        className="mp-root page-enter"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <div
          className="mp-topbar"
          style={{
            padding: "20px 28px",
            borderBottom: "1px solid var(--divider)",
            background: "var(--sidebar-bg)",
          }}
        >
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: "0.78rem",
              color: "var(--text-secondary)",
              marginBottom: 10,
            }}
          >
            <span>{d.breadcrumb.jobFeed}</span>
            <ChevronRight size={12} />
            <span style={{ color: "var(--text)", fontWeight: 600 }}>
              {d.breadcrumb.jobDetails}
            </span>
          </nav>

          <div
            style={{
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
                {JOB.title}
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
                  {JOB.location}
                </span>
                <span style={{ opacity: 0.4 }}>•</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Calendar size={13} />
                  {JOB.when}, {JOB.urgency}
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
                  {JOB.category}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={13} />
                  {d.posted} {JOB.postedAgo}
                </span>
              </div>
            </div>

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
                ${JOB.price.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div
          className="mp-content"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 28,
            background: "var(--main-bg)",
          }}
        >
          <div className="mp-main-grid">
            <div>
              <img
                src={JOB.mainImage}
                alt={JOB.title}
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
                {JOB.thumbnails.map((thumb, idx) => (
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
                  {JOB.description}
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
                    src={JOB.client.avatar}
                    alt={JOB.client.name}
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
                      {JOB.client.name}
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
                      <span style={{ color: "#1B244C", fontWeight: 700 }}>
                        {JOB.client.rating}
                      </span>
                      ({JOB.client.reviewCount} reviews)
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
                      {JOB.client.memberSince}
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
                      {JOB.client.jobsPosted}
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
                  {JOB.location}
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

              <button
                onClick={() => setIsApplyOpen(true)}
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
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#239aaa")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#2EBCCC")
                }
              >
                {d.apply}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ApplyJobModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        jobTitle={JOB.title}
        clientPrice={JOB.price}
        onSubmit={handleApplySubmit}
      />
    </>
  );
};

export default PostDetailsScreen;
