// Provider my jobs: list of active/historical jobs with proposal status and actions.

import { useState } from "react";
import { Search, Clock, Wallet, ChevronDown } from "lucide-react";
import type { ThemeMode } from "../../theme/theme";
import { useI18n } from "../../i18n";

const useTheme = () => {
  const [theme] = useState<ThemeMode>(() =>
    typeof window !== "undefined"
      ? (localStorage.getItem("servease-theme") as ThemeMode) || "light"
      : "light",
  );
  return { theme };
};

interface Job {
  id: string;
  title: string;
  category: string;
  postedAgo: string;
  budget: string;
  image: string;
  proposalStatus: "accepted" | "pending";
}

const JOBS: Job[] = [
  {
    id: "1",
    title: "Emergency Locksmith Needed for Front Door",
    category: "LOCKSMITH",
    postedAgo: "2h ago",
    budget: "$780",
    image:
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80",
    proposalStatus: "accepted",
  },
  {
    id: "2",
    title: "Bathroom Pipe Leak Repair",
    category: "PLUMBING",
    postedAgo: "5h ago",
    budget: "$350",
    image:
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=80",
    proposalStatus: "pending",
  },
  {
    id: "3",
    title: "Office Electrical Wiring Installation",
    category: "ELECTRICAL",
    postedAgo: "1d ago",
    budget: "$1,200",
    image:
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80",
    proposalStatus: "accepted",
  },
  {
    id: "4",
    title: "Deep Cleaning for 2-Bedroom Apartment",
    category: "CLEANING",
    postedAgo: "1d ago",
    budget: "$180",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
    proposalStatus: "pending",
  },
  {
    id: "5",
    title: "AC Unit Maintenance and Filter Replacement",
    category: "HVAC",
    postedAgo: "2d ago",
    budget: "$250",
    image:
      "https://images.unsplash.com/photo-1631545308772-81a0e0a3a6ce?auto=format&fit=crop&w=1200&q=80",
    proposalStatus: "accepted",
  },
];

const FilterPill = ({
  label,
  value,
}: {
  label?: string;
  value: string;
}) => (
  <button
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "10px 16px",
      borderRadius: 12,
      border: "1px solid var(--divider)",
      background: "var(--card-bg)",
      color: "var(--text)",
      fontSize: "0.85rem",
      fontWeight: 500,
      cursor: "pointer",
      fontFamily: "inherit",
    }}
  >
    {label && (
      <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>
        {label}
      </span>
    )}
    {value}
    <ChevronDown size={14} color="var(--text-secondary)" />
  </button>
);

const JobCard = ({ job }: { job: Job }) => {
  const [hovered, setHovered] = useState(false);
  const { t } = useI18n();
  const d = t("myjobsscreen");

  const proposalStatusMap = {
    accepted: {
      label: d.proposalStatuses.accepted,
      bg: "rgba(46,188,204,0.12)",
      color: "#2EBCCC",
    },
    pending: {
      label: d.proposalStatuses.pending,
      bg: "rgba(255,178,0,0.12)",
      color: "#FFB200",
    },
  };
  const ps = proposalStatusMap[job.proposalStatus];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--card-bg)",
        borderRadius: 16,
        border: "1px solid var(--divider)",
        overflow: "hidden",
        transition: "box-shadow 0.2s, transform 0.2s",
        boxShadow: hovered
          ? "0 6px 24px rgba(0,0,0,0.12)"
          : "0 1px 4px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-1px)" : "none",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <img
        src={job.image}
        alt={job.title}
        style={{
          width: "100%",
          height: 180,
          objectFit: "cover",
          flexShrink: 0,
        }}
      />

      <div
        style={{
          padding: 20,
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
        }}
      >
        <div style={{ flex: 1, minHeight: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 8,
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  color: "#2EBCCC",
                  letterSpacing: 0.8,
                }}
              >
                {job.category}
              </span>
              <h3
                style={{
                  margin: "6px 0 0",
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  color: "var(--text)",
                }}
              >
                {job.title}
              </h3>
            </div>
            <span
              style={{
                padding: "5px 14px",
                borderRadius: 20,
                background: ps.bg,
                color: ps.color,
                fontSize: "0.72rem",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              {ps.label}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
              marginBottom: 18,
              flexWrap: "wrap",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Clock size={13} />
              {d.card.posted} {job.postedAgo}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Wallet size={13} />
              {d.card.budget}: {job.budget}
            </span>
          </div>
        </div>

        <button
          style={{
            width: "100%",
            background: "#2EBCCC",
            border: "none",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.85rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "10px 16px",
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
          {job.proposalStatus === "accepted"
            ? d.actions.viewMessages
            : d.actions.viewApplicants}
        </button>
      </div>
    </div>
  );
};

const MyJobsScreen: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { t } = useI18n();
  const d = t("myjobsscreen");

  return (
    <>
      <style>{`
        .mj-root {
          --card-bg: ${isDark ? "#1e2d5e" : "#ffffff"};
          --input-bg: ${isDark ? "#273570" : "#F8FAFC"};
          --text: ${isDark ? "#ffffff" : "#000000"};
          --text-secondary: #989898;
          --divider: ${isDark ? "#273570" : "#e5e7eb"};
        }
        .mj-search-wrapper {
          position: relative;
          flex: 1;
          min-width: 200;
        }
        .mj-search-wrapper input {
          width: 100%;
          padding: 11px 16px 11px 40px;
          border-radius: 12;
          border: 1px solid var(--divider);
          background: var(--card-bg);
          color: var(--text);
          font-size: 0.875rem;
          font-family: inherit;
          outline: none;
          box-sizing: border-box;
        }
        .mj-search-wrapper input::placeholder {
          color: var(--text-secondary);
        }
        .mj-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
        }
        .mj-jobs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }
        @media (max-width: 600px) {
          .mj-topbar {
            padding: 14px 16px !important;
          }
          .mj-content {
            padding: 16px !important;
          }
          .mj-filters {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .mj-jobs-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div
        className="mj-root page-enter"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <div
          className="mj-topbar"
          style={{
            padding: "20px 28px",
            borderBottom: "1px solid var(--divider)",
            background: "var(--sidebar-bg)",
          }}
        >
          <h1
            style={{
              margin: "0 0 4px",
              fontSize: "clamp(1.3rem, 3vw, 1.7rem)",
              fontWeight: 800,
              color: "var(--text)",
            }}
          >
            {d.title}
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: "0.9rem",
              color: "var(--text-secondary)",
            }}
          >
            {d.subtitle}
          </p>
        </div>

        <div
          className="mj-content"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 28,
            background: "var(--main-bg)",
          }}
        >
          <div
            className="mj-filters"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 24,
              flexWrap: "wrap",
            }}
          >
            <div className="mj-search-wrapper">
              <Search
                size={16}
                color="var(--text-secondary)"
                className="mj-search-icon"
              />
              <input type="text" placeholder={d.searchPlaceholder} />
            </div>
            <FilterPill value={d.filters.allStatuses} />
            <FilterPill value={d.filters.category} />
          </div>

          <div className="mj-jobs-grid">
            {JOBS.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default MyJobsScreen;
