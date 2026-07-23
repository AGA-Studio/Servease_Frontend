// Client home screen: greeting, KPI stats, active posts list, and recent activity feed.

import { useState } from "react";
import {
  Plus,
  MapPin,
  Clock,
  Users,
  Star,
  FileText,
  ArrowRight,
  RotateCcw,
  Megaphone,
  Lock,
  Zap,
  Sparkles,
} from "lucide-react";
import SearchBar from "../../components/searchbar/SearchBar";
import { useThemeMode } from "../../theme/useThemeMode";
import { useI18n } from "../../i18n";
import { useAuth } from "../../context/AuthContext";
import NotificationsPopover from "../../components/popover/notificationspopover/NotificationsPopover";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../router/routes";

interface Post {
  id: string;
  title: string;
  location: string;
  postedAgo: string;
  description: string;
  status: "receiving" | "completed" | "in_progress";
  proposalCount?: number;
  avatarCount?: number;
  icon: "plumbing" | "lock" | "party";
  accentColor: string;
}

interface Activity {
  id: string;
  timeAgo: string;
  content: string;
  highlight?: string;
  extra?: string;
  dotColor: string;
}

const POSTS: Post[] = [
  {
    id: "1",
    title: "Emergency Plumber Needed",
    location: "El Refugio, Tijuana",
    postedAgo: "2h ago",
    description:
      "Looking for a licensed plumber to fix a burst pipe in the kitchen. Needs to be done immediately. Water has been shut off but need to repair.",
    status: "receiving",
    proposalCount: 5,
    avatarCount: 3,
    icon: "plumbing",
    accentColor: "#FF4444",
  },
  {
    id: "2",
    title: "Urgent Locksmith",
    location: "El Refugio, Tijuana",
    postedAgo: "2d ago",
    description:
      "I am looking for a locksmith in the area to help me with a door to my house.",
    status: "completed",
    icon: "lock",
    accentColor: "#2EBCCC",
  },
  {
    id: "3",
    title: "Children's Party",
    location: "El Refugio, Tijuana",
    postedAgo: "5d ago",
    description:
      "Need an entertainer for a children's birthday party. Decorations and games included.",
    status: "completed",
    icon: "party",
    accentColor: "#FFB200",
  },
  {
    id: "4",
    title: "Children's Party",
    location: "El Refugio, Tijuana",
    postedAgo: "5d ago",
    description:
      "Need an entertainer for a children's birthday party. Decorations and games included.",
    status: "completed",
    icon: "party",
    accentColor: "#FFB200",
  },
  {
    id: "5",
    title: "Children's Party",
    location: "El Refugio, Tijuana",
    postedAgo: "5d ago",
    description:
      "Need an entertainer for a children's birthday party. Decorations and games included.",
    status: "completed",
    icon: "party",
    accentColor: "#FFB200",
  },
];

const ACTIVITIES: Activity[] = [
  {
    id: "1",
    timeAgo: "10 mins ago",
    content: " submitted a counteroffer for 'Emergency Plumber'.",
    highlight: "Mike S.",
    extra: "Price: $450",
    dotColor: "#2EBCCC",
  },
  {
    id: "2",
    timeAgo: "2 hours ago",
    content: " service successfully completed.",
    highlight: "'Urgent locksmith'",
    dotColor: "#4AA825",
  },
  {
    id: "3",
    timeAgo: "Yesterday",
    content: "You posted a new job: 'Urgent locksmith'.",
    dotColor: "#989898",
  },
  {
    id: "4",
    timeAgo: "2 days ago",
    content: " sent you a message about 'Children's Party'.",
    highlight: "Sara J.",
    dotColor: "#FFB200",
  },
];

const PostIcon = ({
  icon,
  accentColor,
}: {
  icon: Post["icon"];
  accentColor: string;
}) => {
  const bg = accentColor + "22";
  const size = 42;
  return (
    <div
      className="hs-post-icon"
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon === "plumbing" && <Zap size={20} color={accentColor} />}
      {icon === "lock" && <Lock size={20} color={accentColor} />}
      {icon === "party" && <Sparkles size={20} color={accentColor} />}
    </div>
  );
};

const StatusBadge = ({ status }: { status: Post["status"] }) => {
  const { t } = useI18n();
  const h = t("homescreen");

  const map = {
    receiving: {
      label: h.serviceCard.status.receivingProposals,
      bg: "rgba(46,188,204,0.15)",
      color: "#2EBCCC",
    },
    completed: {
      label: h.serviceCard.status.completed,
      bg: "rgba(74,168,37,0.15)",
      color: "#4AA825",
    },
    in_progress: {
      label: h.serviceCard.status.inProgress,
      bg: "rgba(255,178,0,0.15)",
      color: "#FFB200",
    },
  };
  const s = map[status];
  return (
    <span
      style={{
        padding: "4px 12px",
        borderRadius: 20,
        fontSize: "0.75rem",
        fontWeight: 600,
        background: s.bg,
        color: s.color,
        whiteSpace: "nowrap",
      }}
    >
      {status === "receiving" ? s.label : h.serviceCard.status.notAvailable}
    </span>
  );
};

const AvatarStack = ({ count }: { count: number }) => {
  const colors = ["#2EBCCC", "#FFB200", "#4AA825"];
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: colors[i],
            border: "2px solid var(--card-bg)",
            marginLeft: i === 0 ? 0 : -8,
            zIndex: 3 - i,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.65rem",
            fontWeight: 700,
            color: "#fff",
          }}
        >
          {String.fromCharCode(65 + i)}
        </div>
      ))}
      {count > 3 && (
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "var(--input-bg)",
            border: "2px solid var(--card-bg)",
            marginLeft: -8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.65rem",
            fontWeight: 700,
            color: "var(--text-secondary)",
          }}
        >
          +{count - 3}
        </div>
      )}
    </div>
  );
};

const PostCard = ({ post }: { post: Post }) => {
  const [hovered, setHovered] = useState(false);
  const { t } = useI18n();
  const h = t("homescreen");
  return (
    <div
      className="hs-post-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--card-bg)",
        borderRadius: 14,
        border: `1px solid var(--divider)`,
        borderLeft: `4px solid ${post.accentColor}`,
        padding: "16px 20px",
        transition:
          "box-shadow 220ms cubic-bezier(0.23,1,0.32,1), transform 220ms cubic-bezier(0.23,1,0.32,1)",
        boxShadow: hovered
          ? "0 6px 24px rgba(0,0,0,0.12)"
          : "0 1px 4px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-2px)" : "none",
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
          <PostIcon icon={post.icon} accentColor={post.accentColor} />
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: "0.95rem",
                color: "var(--text)",
                marginBottom: 2,
              }}
            >
              {post.title}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: "0.78rem",
                color: "var(--text-secondary)",
              }}
            >
              <MapPin size={11} />
              {post.location}
              <span style={{ opacity: 0.4 }}>•</span>
              <Clock size={11} />
              Posted {post.postedAgo}
            </div>
          </div>
        </div>
        <StatusBadge status={post.status} />
      </div>

      <p
        className="hs-post-desc"
        style={{
          fontSize: "0.84rem",
          color: "var(--text-secondary)",
          margin: "12px 0",
          lineHeight: 1.55,
        }}
      >
        {post.description}
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
        <div>
          {post.avatarCount && post.status === "receiving" && (
            <AvatarStack count={post.avatarCount + 3} />
          )}
        </div>
        <button
          className="hs-post-link"
          style={{
            background: "none",
            border: "none",
            color: "#2EBCCC",
            fontWeight: 600,
            fontSize: "0.84rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "5px 10px",
            borderRadius: 8,
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(46,188,204,0.10)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          {post.status === "receiving"
            ? h.serviceCard.link.reviewProposals
            : h.serviceCard.link.viewDetails}
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
    className="hs-kpi-card"
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
      className="hs-kpi-icon"
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
    <div className="hs-kpi-text">
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
        className="hs-kpi-value"
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

const HomeScreen: React.FC = () => {
  const { isDark } = useThemeMode();
  const navigate = useNavigate();

  const { t } = useI18n();
  const h = t("homescreen");

  const { user } = useAuth();

  return (
    <>
      <style>{`
  .hs-root {
    --card-bg: ${isDark ? "#1e2d5e" : "#ffffff"};
    --input-bg: ${isDark ? "#273570" : "#F8FAFC"};
    --text: ${isDark ? "#ffffff" : "#000000"};
    --text-secondary: #989898;
    --divider: ${isDark ? "#273570" : "#e5e7eb"};
  }
  .hs-posts-grid {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .hs-main-grid {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 24px;
    align-items: start;
  }
  .hs-kpi-row {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }
  .hs-kpi-card {
    opacity: 0;
    animation: hs-fade-up 380ms cubic-bezier(0.23,1,0.32,1) forwards;
    transition: transform 200ms cubic-bezier(0.23,1,0.32,1), box-shadow 200ms cubic-bezier(0.23,1,0.32,1);
  }
  .hs-kpi-card:nth-child(1) { animation-delay: 0ms; }
  .hs-kpi-card:nth-child(2) { animation-delay: 60ms; }
  .hs-kpi-card:nth-child(3) { animation-delay: 120ms; }
  @media (hover: hover) and (pointer: fine) {
    .hs-kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.08);
    }
  }
  .hs-post-card {
    opacity: 0;
    animation: hs-fade-up 380ms cubic-bezier(0.23,1,0.32,1) forwards;
  }
  .hs-posts-grid .hs-post-card:nth-child(1) { animation-delay: 0ms; }
  .hs-posts-grid .hs-post-card:nth-child(2) { animation-delay: 50ms; }
  .hs-posts-grid .hs-post-card:nth-child(3) { animation-delay: 100ms; }
  .hs-posts-grid .hs-post-card:nth-child(4) { animation-delay: 150ms; }
  .hs-posts-grid .hs-post-card:nth-child(5) { animation-delay: 200ms; }
  @keyframes hs-fade-up {
    from { opacity: 0; translate: 0 10px; }
    to { opacity: 1; translate: 0 0; }
  }
  .hs-left-col {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  .hs-posts-scroll {
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: ${isDark ? "#2EBCCC40 #273570" : "#2EBCCC40 #e5e7eb"};
  }
  .hs-posts-scroll::-webkit-scrollbar {
    width: 4px;
  }
  .hs-posts-scroll::-webkit-scrollbar-track {
    background: ${isDark ? "#273570" : "#e5e7eb"};
    border-radius: 99px;
  }
  .hs-posts-scroll::-webkit-scrollbar-thumb {
    background: ${isDark ? "#2EBCCC60" : "#2EBCCC80"};
    border-radius: 99px;
  }
  .hs-posts-scroll::-webkit-scrollbar-thumb:hover {
    background: #2EBCCC;
  }
  @media (min-width: 601px) {
    .hs-root {
      height: 100vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .hs-content {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
    .hs-main-grid {
      flex: 1;
      min-height: 0;
      align-items: stretch;
    }
    .hs-left-col {
      min-height: 0;
      overflow: hidden;
    }
    .hs-posts-scroll {
      flex: 1;
      min-height: 0;
    }
  }
  @media (max-width: 900px) {
    .hs-main-grid {
      grid-template-columns: 1fr;
    }
  }
  @media (max-width: 600px) {
    .hs-root,
    .hs-content,
    .hs-main-grid,
    .hs-left-col {
      max-width: 100vw;
      overflow-x: hidden;
    }
    .hs-topbar {
      padding: 14px 16px !important;
    }
    .hs-content {
      padding: 16px !important;
      overflow-y: auto !important;
      box-sizing: border-box;
    }

    /* KPI cards: horizontal row, evenly spaced, centered content */
    .hs-kpi-row {
      gap: 10px;
      flex-wrap: nowrap;
    }
    .hs-kpi-card {
      flex: 1 1 0 !important;
      min-width: 0;
      padding: 14px 10px !important;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px !important;
      text-align: center;
    }
    .hs-kpi-icon {
      width: 38px !important;
      height: 38px !important;
      border-radius: 10px !important;
    }
    .hs-kpi-icon svg {
      width: 17px;
      height: 17px;
    }
    .hs-kpi-text {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .hs-kpi-value {
      font-size: 1.25rem !important;
    }

    /* Posts: horizontal swipeable carousel instead of a stacked list */
    .hs-posts-scroll {
      overflow-x: auto;
      overflow-y: visible;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
      margin: 0 -16px;
      padding: 4px 16px 10px;
    }
    .hs-posts-grid {
      flex-direction: row;
      gap: 12px;
    }
    .hs-post-card {
      scroll-snap-align: start;
      flex: 0 0 88%;
      min-width: 88%;
      box-sizing: border-box;
      padding: 12px 14px !important;
    }
    .hs-post-card .hs-post-icon {
      width: 34px !important;
      height: 34px !important;
    }
    .hs-post-desc {
      margin: 8px 0 !important;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Recent activity: compact panel, must fit viewport width exactly */
    .hs-recent-activity-card {
      padding: 14px !important;
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
    }
    .hs-recent-activity-card .hs-activity-row {
      padding-bottom: 12px !important;
      gap: 10px !important;
    }
    .hs-recent-activity-card .hs-activity-time {
      font-size: 0.68rem !important;
    }
    .hs-recent-activity-card .hs-activity-content {
      font-size: 0.78rem !important;
    }
    .hs-recent-activity-card .load-btn {
      margin-top: 12px !important;
      padding: 8px !important;
      font-size: 0.76rem !important;
    }
  }
  @media (max-width: 767px) {
    .post-btn {
      display: none !important;
    }
  }
  .load-btn:hover {
    background: rgba(46,188,204,0.08) !important;
    color: #2EBCCC !important;
  }
  .load-btn,
  .hs-post-link {
    transition: transform 140ms cubic-bezier(0.23,1,0.32,1), background 200ms ease, color 200ms ease;
  }
  .load-btn:active,
  .hs-post-link:active,
  .post-btn:active {
    transform: scale(0.97);
  }
  @media (max-width: 600px) {
    .hs-posts-scroll {
      scrollbar-width: none;
    }
    .hs-posts-scroll::-webkit-scrollbar {
      display: none;
    }
  }
`}</style>

      <div className="hs-root page-enter">
        <div
          className="hs-topbar"
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
              placeholder={h.searchPlaceholder}
              hintText="Press Escape to search"
              suggestions={[
                {
                  id: "1",
                  label: "Plumbing",
                  description: "Home services",
                  tag: "Service",
                },
                {
                  id: "2",
                  label: "Electrician",
                  description: "Home services",
                  tag: "Service",
                },
                {
                  id: "3",
                  label: "Cleaning",
                  description: "Home services",
                  tag: "Service",
                },
              ]}
              onSearch={(q) => console.log("search:", q)}
              onSelect={(s) => console.log("selected:", s)}
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
            <NotificationsPopover isDark={isDark} />

            <button
              onClick={() => navigate(ROUTES.APP.NEW_SERVICE)}
              className="post-btn"
              style={{
                height: 44,
                borderRadius: 12,
                border: "none",
                background: "#2EBCCC",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "0 18px",
                fontSize: "0.875rem",
                fontWeight: 700,
                cursor: "pointer",
                transition:
                  "background 0.2s, box-shadow 0.2s, transform 140ms cubic-bezier(0.23,1,0.32,1)",
                fontFamily: "inherit",
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#239aaa";
                e.currentTarget.style.boxShadow =
                  "0 4px 14px rgba(46,188,204,0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#2EBCCC";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <Plus size={17} strokeWidth={2.5} />
              <span>{h.tooltips.postService}</span>
            </button>
          </div>
        </div>

        <div
          className="hs-content hs-scrollable"
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
              {h.title}, {user?.firstName || "user"}!
            </h1>
            <p
              style={{
                color: "var(--text-secondary)",
                margin: 0,
                fontSize: "0.9rem",
              }}
            >
              {h.subtitle}
            </p>
          </div>

          <div className="hs-kpi-row" style={{ marginBottom: 28 }}>
            <KpiCard
              icon={<FileText size={22} color="#2EBCCC" />}
              label={h.kpis.activeRequest}
              value={3}
              iconBg="rgba(46,188,204,0.15)"
            />
            <KpiCard
              icon={<Users size={22} color="#4AA825" />}
              label={h.kpis.totalHired}
              value={12}
              iconBg="rgba(74,168,37,0.15)"
            />
            <KpiCard
              icon={<Star size={22} color="#FFB200" fill="#FFB200" />}
              label={h.kpis.averageRating}
              value="4.8"
              iconBg="rgba(255,178,0,0.15)"
            />
          </div>

          <div className="hs-main-grid">
            <div className="hs-left-col">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Megaphone size={20} color="#2EBCCC" />
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: "var(--text)",
                    }}
                  >
                    {h.myActivePost}
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
                  onClick={() => navigate(ROUTES.APP.MY_POST) }
                >
                  {h.viewAll}
                </button>
              </div>

              <div className="hs-posts-scroll">
                <div className="hs-posts-grid">
                  {POSTS.map((post) => (
                    <PostCard key={post.id} post={post} />
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
                  {h.recentActivity}
                </span>
              </div>

              <div
                className="hs-recent-activity-card"
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
                      className="hs-activity-row"
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
                          className="hs-activity-time"
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-secondary)",
                            marginBottom: 3,
                          }}
                        >
                          {act.timeAgo}
                        </div>
                        <div
                          className="hs-activity-content"
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
                  Load older activity
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeScreen;
