import { useState } from "react";
import {
  Briefcase,
  CheckCircle,
  DollarSign,
  Star,
  MapPin,
  Clock,
  Users,
  ArrowRight,
  RotateCcw,
  RefreshCw,
} from "lucide-react";
import SearchBar from "../../components/searchbar/SearchBar";
import type { ThemeMode } from "../../theme/theme";
import { useI18n } from "../../i18n";
import { useAuth } from "../../context/AuthContext";
import NotificationsPopover from "../../components/popover/notificationspopover/NotificationsPopover";
import IconTooltip from "../../components/tooltip/IconTooltip";

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
  location: string;
  postedAgo: string;
  description: string;
  budget: string;
  proposalCount: number;
  category: string;
}

interface Activity {
  id: string;
  timeAgo: string;
  content: string;
  highlight?: string;
  extra?: string;
  dotColor: string;
}

const JOBS: Job[] = [
  {
    id: "1",
    title: "Emergency Plumber Needed",
    location: "El Refugio, Tijuana",
    postedAgo: "2h ago",
    description: "Looking for a licensed plumber to fix a burst pipe in the kitchen. Needs to be done immediately.",
    budget: "$350 - $500",
    proposalCount: 5,
    category: "Plumbing",
  },
  {
    id: "2",
    title: "Electrical Wiring Installation",
    location: "Centro, Tijuana",
    postedAgo: "5h ago",
    description: "Need a certified electrician to install wiring for a new office space. Approximately 2000 sq ft.",
    budget: "$800 - $1,200",
    proposalCount: 3,
    category: "Electrical",
  },
  {
    id: "3",
    title: "Garden Landscaping",
    location: "Playas, Tijuana",
    postedAgo: "1d ago",
    description: "Looking for a landscaper to redesign and maintain a residential garden.",
    budget: "$500 - $700",
    proposalCount: 8,
    category: "Gardening",
  },
  {
    id: "4",
    title: "AC Repair & Maintenance",
    location: "Otay, Tijuana",
    postedAgo: "2d ago",
    description: "Central AC unit not cooling properly. Need diagnosis and repair.",
    budget: "$200 - $400",
    proposalCount: 2,
    category: "HVAC",
  },
];

const ACTIVITIES: Activity[] = [
  {
    id: "1",
    timeAgo: "30 mins ago",
    content: " you a proposal for 'Emergency Plumber Needed'.",
    highlight: "You submitted",
    extra: "Budget: $450",
    dotColor: "#2EBCCC",
  },
  {
    id: "2",
    timeAgo: "2 hours ago",
    content: " accepted your proposal for 'Office Cleaning'.",
    highlight: "Sara J.",
    dotColor: "#4AA825",
  },
  {
    id: "3",
    timeAgo: "5 hours ago",
    content: " successfully completed.",
    highlight: "'Electrical Repair'",
    dotColor: "#4AA825",
  },
  {
    id: "4",
    timeAgo: "Yesterday",
    content: "Payment received: ",
    highlight: "$350",
    extra: "From: 'Lock Installation'",
    dotColor: "#FFB200",
  },
  {
    id: "5",
    timeAgo: "2 days ago",
    content: " sent you a message about 'Garden Landscaping'.",
    highlight: "Mike R.",
    dotColor: "#2EBCCC",
  },
];

const JobCard = ({ job }: { job: Job }) => {
  const [hovered, setHovered] = useState(false);
  const { t } = useI18n();
  const d = t("dashboardscreen");

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--card-bg)",
        borderRadius: 14,
        border: `1px solid var(--divider)`,
        borderLeft: `4px solid #2EBCCC`,
        padding: "16px 20px",
        transition: "box-shadow 0.2s, transform 0.2s",
        boxShadow: hovered
          ? "0 6px 24px rgba(0,0,0,0.12)"
          : "0 1px 4px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-1px)" : "none",
        cursor: "default",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: "rgba(46,188,204,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Briefcase size={20} color="#2EBCCC" />
          </div>
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: "0.95rem",
                color: "var(--text)",
                marginBottom: 2,
              }}
            >
              {job.title}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: "0.78rem",
                color: "var(--text-secondary)",
                flexWrap: "wrap",
              }}
            >
              <MapPin size={11} />
              {job.location}
              <span style={{ opacity: 0.4 }}>•</span>
              <Clock size={11} />
              {job.postedAgo}
              <span style={{ opacity: 0.4 }}>•</span>
              <span style={{ fontWeight: 600, color: "#2EBCCC" }}>
                {job.budget}
              </span>
            </div>
          </div>
        </div>
        <span
          style={{
            padding: "4px 12px",
            borderRadius: 20,
            fontSize: "0.75rem",
            fontWeight: 600,
            background: "rgba(46,188,204,0.15)",
            color: "#2EBCCC",
            whiteSpace: "nowrap",
          }}
        >
          {job.category}
        </span>
      </div>

      <p
        style={{
          fontSize: "0.84rem",
          color: "var(--text-secondary)",
          margin: "12px 0",
          lineHeight: 1.55,
        }}
      >
        {job.description}
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: "0.8rem",
            color: "var(--text-secondary)",
          }}
        >
          <Users size={14} />
          <span>
            {job.proposalCount} {d.jobCard.proposals}
          </span>
        </div>
        <button
          style={{
            background: "#2EBCCC",
            border: "none",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.84rem",
            cursor: "pointer",
            display: "flex",
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
          {d.jobCard.apply}
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

const KpiCard = ({
  icon,
  label,
  value,
  iconBg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  iconBg: string;
}) => (
  <div
    style={{
      background: "var(--card-bg)",
      borderRadius: 16,
      border: "1px solid var(--divider)",
      padding: "20px 24px",
      display: "flex",
      alignItems: "center",
      gap: 16,
      flex: "1 1 180px",
    }}
  >
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: 14,
        background: iconBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div>
      <div
        style={{
          fontSize: "0.78rem",
          color: "var(--text-secondary)",
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "1.7rem",
          fontWeight: 800,
          color: "var(--text)",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  </div>
);

const ActivityDot = ({
  color,
  isFirst,
}: {
  color: string;
  isFirst: boolean;
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      flexShrink: 0,
    }}
  >
    <div
      style={{
        width: 14,
        height: 14,
        borderRadius: "50%",
        border: `3px solid ${color}`,
        background: isFirst ? color : "transparent",
        flexShrink: 0,
      }}
    />
  </div>
);

const DashboardScreen: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { t } = useI18n();
  const d = t("dashboardscreen");

  const { user } = useAuth();

  return (
    <>
      <style>{`
  .ds-root {
    --card-bg: ${isDark ? "#1e2d5e" : "#ffffff"};
    --input-bg: ${isDark ? "#273570" : "#F8FAFC"};
    --text: ${isDark ? "#ffffff" : "#000000"};
    --text-secondary: #989898;
    --divider: ${isDark ? "#273570" : "#e5e7eb"};
  }
  .ds-jobs-grid {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .ds-main-grid {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 24px;
    align-items: start;
  }
  .ds-kpi-row {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }
  .ds-left-col {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  .ds-jobs-scroll {
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: ${isDark ? "#2EBCCC40 #273570" : "#2EBCCC40 #e5e7eb"};
  }
  .ds-jobs-scroll::-webkit-scrollbar {
    width: 4px;
  }
  .ds-jobs-scroll::-webkit-scrollbar-track {
    background: ${isDark ? "#273570" : "#e5e7eb"};
    border-radius: 99px;
  }
  .ds-jobs-scroll::-webkit-scrollbar-thumb {
    background: ${isDark ? "#2EBCCC60" : "#2EBCCC80"};
    border-radius: 99px;
  }
  .ds-jobs-scroll::-webkit-scrollbar-thumb:hover {
    background: #2EBCCC;
  }
  @media (min-width: 601px) {
    .ds-root {
      height: 100vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .ds-content {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
    .ds-main-grid {
      flex: 1;
      min-height: 0;
      align-items: stretch;
    }
    .ds-left-col {
      min-height: 0;
      overflow: hidden;
    }
    .ds-jobs-scroll {
      flex: 1;
      min-height: 0;
    }
  }
  @media (max-width: 900px) {
    .ds-main-grid {
      grid-template-columns: 1fr;
    }
  }
  @media (max-width: 600px) {
    .ds-topbar {
      padding: 14px 16px !important;
    }
    .ds-content {
      padding: 16px !important;
      overflow-y: auto !important;
    }
    .ds-kpi-row {
      gap: 10px;
    }
  }
  .load-btn:hover {
    background: rgba(46,188,204,0.08) !important;
    color: #2EBCCC !important;
  }
`}</style>

      <div className="ds-root page-enter">
        <div
          className="ds-topbar"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "20px 28px",
            borderBottom: "1px solid var(--divider)",
            background: "var(--sidebar-bg)",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 200 }}>
            <SearchBar
              isDark={isDark}
              placeholder={d.searchPlaceholder}
              hintText="Press Escape to close"
              suggestions={[
                { id: "1", label: "Plumbing", description: "Home services", tag: "Service" },
                { id: "2", label: "Electrician", description: "Home services", tag: "Service" },
                { id: "3", label: "Cleaning", description: "Home services", tag: "Service" },
                { id: "4", label: "Locksmith", description: "Urgent jobs", tag: "Job" },
              ]}
              onSearch={(q) => console.log("dashboard search:", q)}
              onSelect={(s) => console.log("dashboard selected:", s)}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
            }}
          >
            <IconTooltip label={d.tooltips.refresh} isDark={isDark}>
              {({ ref, onMouseEnter, onMouseLeave }, hovered) => (
                <button
                  ref={ref}
                  onMouseEnter={onMouseEnter}
                  onMouseLeave={onMouseLeave}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    border: "1px solid var(--divider)",
                    background: hovered ? "var(--input-bg)" : "transparent",
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontFamily: "inherit",
                    flexShrink: 0,
                  }}
                >
                  <RefreshCw size={18} />
                </button>
              )}
            </IconTooltip>

            <NotificationsPopover isDark={isDark} />
          </div>
        </div>

        <div
          className="ds-content"
          style={{
            padding: 28,
            flex: 1,
            background: "var(--main-bg)",
            overflowY: "auto",
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <h1
              style={{
                fontSize: "clamp(1.3rem, 3vw, 1.7rem)",
                fontWeight: 800,
                color: "var(--text)",
                margin: 0,
                marginBottom: 4,
              }}
            >
              {d.title}, {user?.firstName || "provider"}!
            </h1>
            <p
              style={{
                color: "var(--text-secondary)",
                margin: 0,
                fontSize: "0.9rem",
              }}
            >
              {d.subtitle}
            </p>
          </div>

          <div className="ds-kpi-row" style={{ marginBottom: 28 }}>
            <KpiCard
              icon={<Briefcase size={22} color="#2EBCCC" />}
              label={d.kpis.activeJobs}
              value={5}
              iconBg="rgba(46,188,204,0.15)"
            />
            <KpiCard
              icon={<CheckCircle size={22} color="#4AA825" />}
              label={d.kpis.completedJobs}
              value={24}
              iconBg="rgba(74,168,37,0.15)"
            />
            <KpiCard
              icon={<DollarSign size={22} color="#FFB200" />}
              label={d.kpis.earnings}
              value="$3,450"
              iconBg="rgba(255,178,0,0.15)"
            />
            <KpiCard
              icon={<Star size={22} color="#FFB200" fill="#FFB200" />}
              label={d.kpis.averageRating}
              value="4.8"
              iconBg="rgba(255,178,0,0.15)"
            />
          </div>

          <div className="ds-main-grid">
            <div className="ds-left-col">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Briefcase size={20} color="#2EBCCC" />
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: "var(--text)",
                    }}
                  >
                    {d.availableJobs}
                  </span>
                </div>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    color: "#2EBCCC",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    padding: "5px 10px",
                    borderRadius: 8,
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(46,188,204,0.10)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "none")
                  }
                >
                  {d.viewAll}
                </button>
              </div>

              <div className="ds-jobs-scroll">
                <div className="ds-jobs-grid">
                  {JOBS.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                <RotateCcw size={20} color="#2EBCCC" />
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: "var(--text)",
                  }}
                >
                  {d.recentActivity}
                </span>
              </div>

              <div
                style={{
                  background: "var(--card-bg)",
                  borderRadius: 16,
                  border: "1px solid var(--divider)",
                  padding: "20px",
                }}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 0 }}
                >
                  {ACTIVITIES.map((act, i) => (
                    <div
                      key={act.id}
                      style={{
                        display: "flex",
                        gap: 14,
                        paddingBottom: i < ACTIVITIES.length - 1 ? 18 : 0,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <ActivityDot color={act.dotColor} isFirst={i === 0} />
                        {i < ACTIVITIES.length - 1 && (
                          <div
                            style={{
                              width: 2,
                              flex: 1,
                              background: "var(--divider)",
                              marginTop: 4,
                            }}
                          />
                        )}
                      </div>
                      <div style={{ paddingBottom: 4 }}>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-secondary)",
                            marginBottom: 3,
                          }}
                        >
                          {act.timeAgo}
                        </div>
                        <div
                          style={{
                            fontSize: "0.84rem",
                            color: "var(--text)",
                            lineHeight: 1.5,
                          }}
                        >
                          {act.highlight && (
                            <span
                              style={{ color: act.dotColor, fontWeight: 600 }}
                            >
                              {act.highlight}
                            </span>
                          )}
                          {act.content}
                        </div>
                        {act.extra && (
                          <div
                            style={{
                              marginTop: 6,
                              padding: "5px 10px",
                              background: "var(--input-bg)",
                              borderRadius: 8,
                              fontSize: "0.8rem",
                              color: "var(--text-secondary)",
                              display: "inline-block",
                            }}
                          >
                            {act.extra}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  className="load-btn"
                  style={{
                    width: "100%",
                    marginTop: 18,
                    padding: "10px",
                    borderRadius: 10,
                    border: "1.5px dashed var(--divider)",
                    background: "transparent",
                    color: "var(--text-secondary)",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.2s",
                  }}
                >
                  {d.loadOlder}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardScreen;
