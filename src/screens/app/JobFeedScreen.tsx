// Provider job feed: filter bar, job cards, earnings summary and applied jobs sidebar.

import { useState } from "react";
import {
  ChevronDown,
  MapPin,
  Clock,
  ArrowRight,
  Navigation,
} from "lucide-react";
import { useThemeMode } from "../../theme/useThemeMode";
import { useI18n } from "../../i18n";

interface Job {
  id: string;
  title: string;
  category: string;
  postedAgo: string;
  description: string;
  priceRange: string;
  location: string;
  urgency: string;
  image: string;
  distance: string;
}

interface AppliedJob {
  id: string;
  title: string;
  status: "reviewing" | "completed" | "declined" | "closed";
  sentAgo: string;
  price: string;
}

const JOBS: Job[] = [
  {
    id: "1",
    title: "Emergency Residential Lockout",
    category: "Locksmith",
    postedAgo: "10m ago",
    description:
      "Costumer is locked out of their apartment on the 3rd floor. Key broke inside the lock cylinder. Requires extraction and potentially replacement.",
    priceRange: "$120 - $150",
    location: "El Refugio, Tijuana",
    urgency: "ASAP",
    image:
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=400&q=80",
    distance: "2.5km",
  },
  {
    id: "2",
    title: "Emergency Residential Lockout",
    category: "Locksmith",
    postedAgo: "10m ago",
    description:
      "Costumer is locked out of their apartment on the 3rd floor. Key broke inside the lock cylinder. Requires extraction and potentially replacement.",
    priceRange: "$120 - $150",
    location: "El Refugio, Tijuana",
    urgency: "ASAP",
    image:
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=400&q=80",
    distance: "2.5km",
  },
];

const APPLIED_JOBS: AppliedJob[] = [
  {
    id: "a1",
    title: "High-Security Lock Install",
    status: "reviewing",
    sentAgo: "2 hours ago",
    price: "$350.00",
  },
  {
    id: "a2",
    title: "Office Complex Rekey",
    status: "completed",
    sentAgo: "yesterday",
    price: "$1200.00",
  },
  {
    id: "a3",
    title: "Garage Door Fix",
    status: "declined",
    sentAgo: "3 days ago",
    price: "$180.00",
  },
];

const FilterSelect = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <span
      style={{
        fontSize: "0.7rem",
        fontWeight: 700,
        color: "var(--text-secondary)",
        textTransform: "uppercase",
        letterSpacing: 0.5,
      }}
    >
      {label}
    </span>
    <button
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
        padding: "10px 14px",
        borderRadius: 10,
        border: "1px solid var(--divider)",
        background: "var(--card-bg)",
        color: "var(--text)",
        fontSize: "0.85rem",
        fontWeight: 500,
        cursor: "pointer",
        fontFamily: "inherit",
        minWidth: 140,
      }}
    >
      {value}
      <ChevronDown size={14} color="var(--text-secondary)" />
    </button>
  </div>
);

const JobCard = ({ job }: { job: Job }) => {
  const [hovered, setHovered] = useState(false);
  const { t } = useI18n();
  const d = t("jobfeedscreen");

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--card-bg)",
        borderRadius: 14,
        border: "1px solid var(--divider)",
        padding: 16,
        display: "flex",
        gap: 16,
        transition: "box-shadow 0.2s, transform 0.2s",
        boxShadow: hovered
          ? "0 6px 24px rgba(0,0,0,0.12)"
          : "0 1px 4px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-1px)" : "none",
      }}
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        <img
          src={job.image}
          alt={job.title}
          style={{
            width: 140,
            height: 100,
            objectFit: "cover",
            borderRadius: 12,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 8,
            left: 8,
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "rgba(255,255,255,0.95)",
            padding: "4px 8px",
            borderRadius: 20,
            fontSize: "0.7rem",
            fontWeight: 700,
            color: "#1B244C",
          }}
        >
          <Navigation size={10} />
          {job.distance}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: "0.75rem",
              color: "var(--text-secondary)",
            }}
          >
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 20,
                background: "rgba(46,188,204,0.12)",
                color: "#2EBCCC",
                fontWeight: 600,
              }}
            >
              {job.category}
            </span>
            <span>
              {d.card.posted} {job.postedAgo}
            </span>
          </div>
          <span
            style={{
              fontSize: "1.1rem",
              fontWeight: 800,
              color: "var(--text)",
            }}
          >
            {job.priceRange}
          </span>
        </div>

        <h3
          style={{
            margin: "10px 0 6px",
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--text)",
          }}
        >
          {job.title}
        </h3>

        <p
          style={{
            margin: 0,
            fontSize: "0.82rem",
            color: "var(--text-secondary)",
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {job.description}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginTop: 12,
            fontSize: "0.78rem",
            color: "var(--text-secondary)",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <MapPin size={12} />
            {job.location}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Clock size={12} />
            {job.urgency}
          </span>
        </div>

        <button
          style={{
            marginTop: 14,
            background: "#2EBCCC",
            border: "none",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.82rem",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            borderRadius: 10,
            fontFamily: "inherit",
            transition: "background 0.2s, box-shadow 0.2s",
            boxShadow: hovered
              ? "0 4px 14px rgba(46,188,204,0.45)"
              : "none",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "#239aaa")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "#2EBCCC")
          }
        >
          {d.card.viewDetails}
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

const AppliedJobItem = ({ job }: { job: AppliedJob }) => {
  const { t } = useI18n();
  const d = t("jobfeedscreen");

  const statusMap = {
    reviewing: {
      label: d.statuses.reviewing,
      bg: "rgba(255,178,0,0.15)",
      color: "#FFB200",
    },
    completed: {
      label: d.statuses.completed,
      bg: "rgba(74,168,37,0.15)",
      color: "#4AA825",
    },
    declined: {
      label: d.statuses.declined,
      bg: "rgba(152,152,152,0.15)",
      color: "#989898",
    },
    closed: {
      label: d.statuses.closed,
      bg: "rgba(152,152,152,0.15)",
      color: "#989898",
    },
  };
  const s = statusMap[job.status];

  return (
    <div
      style={{
        padding: "14px 0",
        borderBottom: "1px solid var(--divider)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 4,
        }}
      >
        <h4
          style={{
            margin: 0,
            fontSize: "0.88rem",
            fontWeight: 700,
            color: "var(--text)",
            flex: 1,
          }}
        >
          {job.title}
        </h4>
        <span
          style={{
            padding: "3px 10px",
            borderRadius: 20,
            background: s.bg,
            color: s.color,
            fontSize: "0.68rem",
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {s.label}
        </span>
      </div>
      <p
        style={{
          margin: "0 0 6px",
          fontSize: "0.78rem",
          color: "var(--text-secondary)",
        }}
      >
        {d.card.posted} {job.sentAgo}
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: "0.85rem",
            fontWeight: 700,
            color: "var(--text)",
          }}
        >
          {job.price}
        </span>
        <button
          style={{
            background: "none",
            border: "none",
            color: "#2EBCCC",
            fontSize: "0.78rem",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            padding: "4px 8px",
            borderRadius: 6,
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(46,188,204,0.10)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "none")
          }
        >
          {d.viewStatus}
        </button>
      </div>
    </div>
  );
};

const JobFeedScreen: React.FC = () => {
  const { isDark } = useThemeMode();
  const { t } = useI18n();
  const d = t("jobfeedscreen");

  return (
    <>
      <style>{`
        .jf-root {
          --card-bg: ${isDark ? "#1e2d5e" : "#ffffff"};
          --input-bg: ${isDark ? "#273570" : "#F8FAFC"};
          --text: ${isDark ? "#ffffff" : "#000000"};
          --text-secondary: #989898;
          --divider: ${isDark ? "#273570" : "#e5e7eb"};
        }
        .jf-main-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
          align-items: start;
        }
        .jf-jobs-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        @media (max-width: 900px) {
          .jf-main-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 600px) {
          .jf-topbar {
            padding: 14px 16px !important;
          }
          .jf-content {
            padding: 16px !important;
          }
          .jf-filter-grid {
            grid-template-columns: 1fr !important;
          }
          .jf-job-card {
            flex-direction: column !important;
          }
          .jf-job-card img {
            width: 100% !important;
            height: 160px !important;
          }
        }
      `}</style>

      <div
        className="jf-root page-enter"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <div
          className="jf-topbar"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            padding: "20px 28px",
            borderBottom: "1px solid var(--divider)",
            background: "var(--sidebar-bg)",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(1.3rem, 3vw, 1.7rem)",
                fontWeight: 800,
                color: "var(--text)",
              }}
            >
              {d.title}
            </h1>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "0.9rem",
                color: "var(--text-secondary)",
              }}
            >
              {d.subtitle}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
            }}
          >
            {d.status}
            <span
              style={{
                padding: "6px 12px",
                borderRadius: 20,
                background: "rgba(74,168,37,0.15)",
                color: "#4AA825",
                fontWeight: 700,
                fontSize: "0.78rem",
              }}
            >
              {d.availableForWork}
            </span>
          </div>
        </div>

        <div
          className="jf-content"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 28,
            background: "var(--main-bg)",
          }}
        >
          <div
            className="jf-filter-bar"
            style={{
              background: "var(--card-bg)",
              borderRadius: 16,
              border: "1px solid var(--divider)",
              padding: 20,
              marginBottom: 24,
            }}
          >
            <div
              className="jf-filter-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 16,
              }}
            >
              <FilterSelect
                label={d.filters.specialization}
                value="Locksmith"
              />
              <FilterSelect
                label={d.filters.category}
                value={d.filters.allCategories}
              />
              <FilterSelect
                label={d.filters.distance}
                value={d.filters.within10km}
              />
              <FilterSelect
                label={d.filters.priceRange}
                value={d.filters.anyPrice}
              />
            </div>
          </div>

          <div className="jf-main-grid">
            <div className="jf-jobs-list">
              {JOBS.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div
                style={{
                  background: "#1B244C",
                  borderRadius: 16,
                  padding: 20,
                  color: "#fff",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 16px",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.7)",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {d.earningsSummary}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.85rem",
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  {d.thisWeek}
                </p>
                <p
                  style={{
                    margin: "4px 0 18px",
                    fontSize: "1.8rem",
                    fontWeight: 800,
                  }}
                >
                  $840.50
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.75rem",
                        color: "rgba(255,255,255,0.7)",
                      }}
                    >
                      {d.pending}
                    </p>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: "1rem",
                        fontWeight: 700,
                      }}
                    >
                      $120.00
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.75rem",
                        color: "rgba(255,255,255,0.7)",
                      }}
                    >
                      {d.projected}
                    </p>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: "1rem",
                        fontWeight: 700,
                      }}
                    >
                      $960.00
                    </p>
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: "var(--card-bg)",
                  borderRadius: 16,
                  border: "1px solid var(--divider)",
                  padding: "16px 20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "0.85rem",
                      fontWeight: 800,
                      color: "var(--text)",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    {d.myAppliedJobs}
                  </h3>
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      color: "#2EBCCC",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      padding: "4px 8px",
                      borderRadius: 6,
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(46,188,204,0.10)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "none")
                    }
                  >
                    {d.viewAll}
                  </button>
                </div>
                {APPLIED_JOBS.map((job) => (
                  <AppliedJobItem key={job.id} job={job} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobFeedScreen;
