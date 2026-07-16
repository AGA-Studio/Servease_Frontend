import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "motion/react";
import {
  Pencil,
  MoreHorizontal,
  BadgeCheck,
  ClipboardList,
  Star,
  MessageSquare,
  Clock,
  Wrench,
  Sparkles,
  Zap,
  Lightbulb,
  Triangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useI18n } from "../../i18n";
import { ROUTES } from "../../router/routes";
import type { ThemeMode } from "../../theme/theme";

const useTheme = (): { theme: ThemeMode; isDark: boolean } => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem("servease-theme") as ThemeMode) || "light";
  });
  useEffect(() => {
    const obs = new MutationObserver(() => {
      const next =
        (document.documentElement.getAttribute("data-theme") as ThemeMode) ||
        "light";
      setTheme(next);
    });
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => obs.disconnect();
  }, []);
  return { theme, isDark: theme === "dark" };
};

type PostStatus = "completed" | "inProgress" | "receiving";

interface RecentPost {
  id: string;
  icon: React.ReactNode;
  title: string;
  postedAgo: string;
  price: string;
  status: PostStatus;
}

const EASE = [0.22, 1, 0.36, 1] as const;

const MOCK_POSTS: RecentPost[] = [
  {
    id: "1",
    icon: <Wrench size={18} />,
    title: "Roadside Assistance: Chain Break",
    postedAgo: "2h ago",
    price: "$450",
    status: "completed",
  },
  {
    id: "2",
    icon: <Sparkles size={18} />,
    title: "Full Service",
    postedAgo: "1 day ago",
    price: "$1,200",
    status: "inProgress",
  },
  {
    id: "3",
    icon: <Triangle size={18} />,
    title: "Exhaust System Adaptation",
    postedAgo: "5h ago",
    price: "$950",
    status: "completed",
  },
  {
    id: "4",
    icon: <Zap size={18} />,
    title: "Diagnostic - Electrical Failure",
    postedAgo: "3h ago",
    price: "$1,200",
    status: "inProgress",
  },
  {
    id: "5",
    icon: <Lightbulb size={18} />,
    title: "LED Lights & USB Port Install",
    postedAgo: "Yesterday",
    price: "$600",
    status: "completed",
  },
];

const MOCK_STATS = { postedJobs: 148, rating: 4.0, reviews: 128 };

const TextButton = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) => (
  <motion.button
    onClick={onClick}
    whileTap={{ scale: 0.95 }}
    style={{
      background: "none",
      border: "none",
      color: "#2EBCCC",
      fontWeight: 700,
      fontSize: "0.8rem",
      cursor: "pointer",
      padding: "5px 10px",
      borderRadius: 8,
      fontFamily: "inherit",
      transition: "background 0.2s",
    }}
    onMouseEnter={(e) =>
      (e.currentTarget.style.background = "rgba(46,188,204,0.10)")
    }
    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
  >
    {children}
  </motion.button>
);

const StatusPill = ({
  status,
  isDark,
  labels,
}: {
  status: PostStatus;
  isDark: boolean;
  labels: Record<PostStatus, string>;
}) => {
  const map: Record<PostStatus, { bg: string; color: string }> = {
    completed: {
      bg: isDark ? "rgba(74,168,37,0.18)" : "rgba(74,168,37,0.12)",
      color: "#4AA825",
    },
    inProgress: {
      bg: isDark ? "rgba(255,178,0,0.18)" : "rgba(255,178,0,0.12)",
      color: "#FFB200",
    },
    receiving: {
      bg: isDark ? "rgba(46,188,204,0.18)" : "rgba(46,188,204,0.12)",
      color: "#2EBCCC",
    },
  };
  const s = map[status];
  return (
    <span
      style={{
        padding: "6px 14px",
        borderRadius: 999,
        fontWeight: 700,
        fontSize: "0.72rem",
        background: s.bg,
        color: s.color,
        whiteSpace: "nowrap",
      }}
    >
      {labels[status]}
    </span>
  );
};

const StatCard = ({
  icon,
  label,
  index,
  isDark,
  children,
  action,
}: {
  icon: React.ReactNode;
  label: string;
  index: number;
  isDark: boolean;
  children: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.15 + index * 0.06, ease: EASE }}
    style={{
      borderRadius: 16,
      background: isDark ? "rgba(255,255,255,0.04)" : "#F7FAFB",
      padding: "20px 22px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: "var(--text-secondary)",
          fontSize: "0.72rem",
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {icon}
        {label}
      </div>
      {action}
    </div>
    {children}
  </motion.div>
);

const PostRow = ({
  post,
  index,
  isDark,
  statusLabels,
  postedLabel,
}: {
  post: RecentPost;
  index: number;
  isDark: boolean;
  statusLabels: Record<PostStatus, string>;
  postedLabel: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -12 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: EASE }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "16px 8px",
        borderTop: `1px solid var(--divider)`,
        borderRadius: 10,
        background: hovered
          ? isDark
            ? "rgba(255,255,255,0.03)"
            : "rgba(46,188,204,0.04)"
          : "transparent",
        transition: "background 0.18s",
      }}
    >
      <motion.div
        animate={{ scale: hovered ? 1.08 : 1 }}
        transition={{ duration: 0.2, ease: EASE }}
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: isDark ? "rgba(46,188,204,0.16)" : "rgba(46,188,204,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "none",
          color: "#2EBCCC",
        }}
      >
        {post.icon}
      </motion.div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: "0.94rem",
            color: "var(--text)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {post.title}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 3,
            color: "var(--text-secondary)",
            fontSize: "0.78rem",
          }}
        >
          <Clock size={12} />
          {postedLabel} {post.postedAgo}
        </div>
      </div>
      <div
        style={{
          fontWeight: 800,
          fontSize: "1rem",
          color: "var(--text)",
          flex: "none",
        }}
      >
        {post.price}
      </div>
      <div style={{ flex: "none" }}>
        <StatusPill status={post.status} isDark={isDark} labels={statusLabels} />
      </div>
    </motion.div>
  );
};

const ClientProfileScreen: React.FC = () => {
  const { isDark } = useTheme();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { t, locale } = useI18n();
  const p = t("profile").client;
  const languageLabel = locale === "es" ? "Español" : "English";

  const fullName = user
    ? `${user.firstName} ${user.lastnameP}${user.lastnameM ? ` ${user.lastnameM}` : ""}`
    : "";

  const memberSince = profile?.fecha_registro
    ? new Date(profile.fecha_registro).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      })
    : "—";

  const avatarUrl =
    profile?.url_foto_perfil ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || "S")}&background=2EBCCC&color=fff&size=200&bold=true`;

  const statusLabels: Record<PostStatus, string> = {
    completed: p.status.completed,
    inProgress: p.status.inProgress,
    receiving: p.status.receiving,
  };

  return (
    <div className="page-enter" style={{ padding: "32px 40px 56px", maxWidth: 1200, margin: "0 auto" }}>
      <style>{`
        .cp-btn-ghost { transition: background 0.18s, transform 0.12s ease; }
        .cp-btn-ghost:active { transform: scale(0.95); }
        .cp-star { transition: transform 0.2s ease; }
      `}</style>

      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        style={{
          borderRadius: 24,
          background: "var(--sidebar-bg)",
          boxShadow: isDark
            ? "0 12px 32px -16px rgba(0,0,0,0.4)"
            : "0 1px 2px rgba(20,30,40,.04), 0 12px 32px -16px rgba(20,30,40,.10)",
          overflow: "hidden",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            height: 128,
            background: "linear-gradient(120deg, #2EBCCC, #1B244C)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(600px 200px at 85% -20%, rgba(255,255,255,.18), transparent)",
            }}
          />
          <div style={{ position: "absolute", top: 20, right: 24, display: "flex", gap: 10 }}>
            <motion.button
              className="cp-btn-ghost"
              whileHover={{ scale: 1.03, background: "rgba(255,255,255,0.22)" }}
              whileTap={{ scale: 0.96 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                borderRadius: 11,
                border: "1px solid rgba(255,255,255,.35)",
                background: "rgba(255,255,255,.14)",
                backdropFilter: "blur(6px)",
                color: "#fff",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <Pencil size={15} />
              {p.editProfile}
            </motion.button>
            <motion.button
              className="cp-btn-ghost"
              whileHover={{ scale: 1.05, background: "rgba(255,255,255,0.22)" }}
              whileTap={{ scale: 0.94 }}
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                border: "1px solid rgba(255,255,255,.35)",
                background: "rgba(255,255,255,.14)",
                backdropFilter: "blur(6px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#fff",
              }}
            >
              <MoreHorizontal size={18} />
            </motion.button>
          </div>
        </div>

        <div style={{ padding: "0 36px 32px", display: "flex", flexDirection: "column" }}>
          <motion.img
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.1, ease: EASE }}
            src={avatarUrl}
            alt={fullName}
            style={{
              width: 112,
              height: 112,
              borderRadius: "50%",
              objectFit: "cover",
              border: "5px solid var(--sidebar-bg)",
              boxShadow: "0 4px 16px rgba(20,30,40,.18)",
              marginTop: -52,
              zIndex: 1,
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: EASE }}
            style={{ marginTop: 14 }}
          >
            <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>
              {fullName}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
              <BadgeCheck size={16} color="#2EBCCC" />
              <span style={{ color: "#2EBCCC", fontWeight: 600, fontSize: "0.84rem" }}>
                {p.verifiedClient}
              </span>
            </div>
          </motion.div>

          {/* Stats row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 18,
              marginTop: 28,
            }}
          >
            <StatCard icon={<ClipboardList size={15} />} label={p.stats.postedJobs} index={0} isDark={isDark}>
              <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "var(--text)" }}>
                {MOCK_STATS.postedJobs}
              </div>
            </StatCard>

            <StatCard icon={<Star size={15} />} label={p.stats.overallRating} index={1} isDark={isDark}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.9rem", fontWeight: 800, color: "var(--text)" }}>
                  {MOCK_STATS.rating.toFixed(1)}
                </span>
                <div style={{ display: "flex", gap: 2 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.span
                      key={i}
                      className="cp-star"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.25, delay: 0.3 + i * 0.05, ease: EASE }}
                    >
                      <Star
                        size={16}
                        fill={i < Math.round(MOCK_STATS.rating) ? "#2EBCCC" : "none"}
                        color={i < Math.round(MOCK_STATS.rating) ? "#2EBCCC" : "#d6dbe2"}
                      />
                    </motion.span>
                  ))}
                </div>
              </div>
            </StatCard>

            <StatCard
              icon={<MessageSquare size={15} />}
              label={p.stats.writtenReviews}
              index={2}
              isDark={isDark}
              action={<TextButton>{p.stats.seeAll} →</TextButton>}
            >
              <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "var(--text)" }}>
                {MOCK_STATS.reviews}
              </div>
            </StatCard>
          </div>
        </div>
      </motion.div>

      {/* Two column body */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(260px, 340px) 1fr",
          gap: 24,
          alignItems: "start",
        }}
        className="cp-body-grid"
      >
        <style>{`
          @media (max-width: 860px) {
            .cp-body-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>

        {/* Personal info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: EASE }}
          style={{
            borderRadius: 20,
            background: "var(--sidebar-bg)",
            boxShadow: isDark
              ? "0 12px 32px -16px rgba(0,0,0,0.4)"
              : "0 1px 2px rgba(20,30,40,.04), 0 12px 32px -16px rgba(20,30,40,.10)",
            padding: 28,
          }}
        >
          <div style={{ fontSize: "1.02rem", fontWeight: 800, color: "var(--text)", marginBottom: 16 }}>
            {p.personalInfo.title}
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.7, margin: 0 }}>
            {p.personalInfo.defaultBio}
          </p>
          <div style={{ height: 1, background: "var(--divider)", margin: "22px 0" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                {p.personalInfo.memberSince}
              </span>
              <span style={{ color: "var(--text)", fontWeight: 700, fontSize: "0.85rem", textTransform: "capitalize" }}>
                {memberSince}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                {p.personalInfo.language}
              </span>
              <span style={{ color: "var(--text)", fontWeight: 700, fontSize: "0.85rem" }}>
                {languageLabel}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Recent posts */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35, ease: EASE }}
          style={{
            borderRadius: 20,
            background: "var(--sidebar-bg)",
            boxShadow: isDark
              ? "0 12px 32px -16px rgba(0,0,0,0.4)"
              : "0 1px 2px rgba(20,30,40,.04), 0 12px 32px -16px rgba(20,30,40,.10)",
            padding: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <div style={{ fontSize: "1.02rem", fontWeight: 800, color: "var(--text)" }}>
              {p.recentPosts.title}
            </div>
            <TextButton onClick={() => navigate(ROUTES.APP.MY_POST)}>
              {p.recentPosts.viewAll}
            </TextButton>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {MOCK_POSTS.map((post, i) => (
              <PostRow
                key={post.id}
                post={post}
                index={i}
                isDark={isDark}
                statusLabels={statusLabels}
                postedLabel={p.recentPosts.postedAgo}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ClientProfileScreen;
