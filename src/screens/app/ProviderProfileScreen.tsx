import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "motion/react";
import {
  Pencil,
  MoreHorizontal,
  BadgeCheck,
  Briefcase,
  DollarSign,
  MessageCircle,
  Star,
  Wrench,
  Zap,
  Paintbrush,
  Hammer,
  Camera,
  Check,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useI18n } from "../../i18n";
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

const EASE = [0.22, 1, 0.36, 1] as const;

const MOCK_STATS = {
  completedJobs: 87,
  totalEarnings: 42800,
  responseRate: 98,
  rating: 4.8,
  reviews: 64,
};

interface PortfolioItem {
  id: string;
  image: string;
  title: string;
  category: string;
}

interface Review {
  id: string;
  avatar: string;
  name: string;
  rating: number;
  date: string;
  comment: string;
}

const MOCK_PORTFOLIO: PortfolioItem[] = [
  {
    id: "1",
    image:
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80",
    title: "Kitchen Pipe Repair",
    category: "Plumbing",
  },
  {
    id: "2",
    image:
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80",
    title: "Electrical Panel Upgrade",
    category: "Electrical",
  },
  {
    id: "3",
    image:
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80",
    title: "Interior Painting",
    category: "Painting",
  },
  {
    id: "4",
    image:
      "https://images.unsplash.com/photo-1601058268499-e52658b8bb88?auto=format&fit=crop&w=600&q=80",
    title: "Custom Bookshelf",
    category: "Carpentry",
  },
];

const MOCK_REVIEWS: Review[] = [
  {
    id: "1",
    avatar: "https://i.pravatar.cc/128?img=47",
    name: "María Cazares",
    rating: 5,
    date: "2 days ago",
    comment:
      "Excellent work, arrived on time and fixed the leak quickly. Highly recommended!",
  },
  {
    id: "2",
    avatar: "https://i.pravatar.cc/128?img=12",
    name: "Carlos Ruiz",
    rating: 5,
    date: "1 week ago",
    comment:
      "Very professional and clean. The installation looks perfect and works flawlessly.",
  },
  {
    id: "3",
    avatar: "https://i.pravatar.cc/128?img=33",
    name: "Sara Jimenez",
    rating: 4,
    date: "2 weeks ago",
    comment:
      "Good quality work, completed within the agreed budget. Will hire again.",
  },
];

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

const PortfolioCard = ({
  item,
  index,
}: {
  item: PortfolioItem;
  index: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.35, delay: index * 0.08, ease: EASE }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        borderRadius: 14,
        overflow: "hidden",
        background: "var(--sidebar-bg)",
        border: "1px solid var(--divider)",
        boxShadow: hovered
          ? "0 8px 24px rgba(0,0,0,0.12)"
          : "0 1px 4px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-2px)" : "none",
        transition: "box-shadow 0.2s, transform 0.2s",
      }}
    >
      <div style={{ position: "relative", height: 140, overflow: "hidden" }}>
        <motion.img
          animate={{ scale: hovered ? 1.06 : 1 }}
          transition={{ duration: 0.3, ease: EASE }}
          src={item.image}
          alt={item.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.45) 100%)",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.2s",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: 12,
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "#fff",
            fontSize: "0.72rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.2s",
          }}
        >
          <Camera size={12} />
          {item.category}
        </div>
      </div>
      <div style={{ padding: "14px 16px" }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: "0.92rem",
            color: "var(--text)",
          }}
        >
          {item.title}
        </div>
      </div>
    </motion.div>
  );
};

const ReviewRow = ({ review, index }: { review: Review; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -12 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: EASE }}
      style={{
        display: "flex",
        gap: 14,
        padding: "16px 8px",
        borderTop: "1px solid var(--divider)",
      }}
    >
      <img
        src={review.avatar}
        alt={review.name}
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          objectFit: "cover",
          flex: "none",
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: "0.94rem", color: "var(--text)" }}>
            {review.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={12}
                fill={i < review.rating ? "#FFB200" : "none"}
                color={i < review.rating ? "#FFB200" : "#d6dbe2"}
              />
            ))}
          </div>
        </div>
        <div
          style={{
            fontSize: "0.75rem",
            color: "var(--text-secondary)",
            marginTop: 3,
            marginBottom: 8,
          }}
        >
          {review.date}
        </div>
        <p
          style={{
            margin: 0,
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
            lineHeight: 1.6,
          }}
        >
          {review.comment}
        </p>
      </div>
    </motion.div>
  );
};

const ProviderProfileScreen: React.FC = () => {
  const { isDark } = useTheme();
  const { user, profile } = useAuth();
  const { t, locale } = useI18n();
  const p = t("profile").provider;

  const [isAvailable, setIsAvailable] = useState(true);

  const fullName = user
    ? `${user.firstName} ${user.lastnameP}${user.lastnameM ? ` ${user.lastnameM}` : ""}`
    : "";

  const memberSince = profile?.fecha_registro
    ? new Date(profile.fecha_registro).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      })
    : "—";

  const languageLabel = locale === "es" ? "Español" : "English";
  const currency = locale === "es" ? "MXN" : "USD";

  const avatarUrl =
    profile?.url_foto_perfil ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      fullName || "S",
    )}&background=2EBCCC&color=fff&size=200&bold=true`;

  const services = [
    { icon: <Wrench size={14} />, label: p.services.plumbing },
    { icon: <Zap size={14} />, label: p.services.electrical },
    { icon: <Paintbrush size={14} />, label: p.services.painting },
    { icon: <Hammer size={14} />, label: p.services.carpentry },
  ];

  return (
    <div
      className="page-enter"
      style={{ padding: "32px 40px 56px", maxWidth: 1200, margin: "0 auto" }}
    >
      <style>{`
        .pp-btn-ghost { transition: background 0.18s, transform 0.12s ease; }
        .pp-btn-ghost:active { transform: scale(0.95); }
        .pp-star { transition: transform 0.2s ease; }
        .pp-toggle {
          appearance: none;
          width: 44px;
          height: 24px;
          border-radius: 999px;
          background: #d1d5db;
          position: relative;
          cursor: pointer;
          transition: background 0.2s;
          outline: none;
        }
        .pp-toggle:checked {
          background: #4AA825;
        }
        .pp-toggle::after {
          content: "";
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #fff;
          transition: transform 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .pp-toggle:checked::after {
          transform: translateX(20px);
        }
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
          <div
            style={{
              position: "absolute",
              top: 20,
              right: 24,
              display: "flex",
              gap: 10,
            }}
          >
            <motion.button
              className="pp-btn-ghost"
              whileHover={{
                scale: 1.03,
                background: "rgba(255,255,255,0.22)",
              }}
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
              className="pp-btn-ghost"
              whileHover={{
                scale: 1.05,
                background: "rgba(255,255,255,0.22)",
              }}
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

        <div
          style={{
            padding: "0 36px 32px",
            display: "flex",
            flexDirection: "column",
          }}
        >
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
            <div
              style={{
                fontSize: "1.7rem",
                fontWeight: 800,
                color: "var(--text)",
                letterSpacing: "-0.02em",
              }}
            >
              {fullName}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginTop: 8,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <BadgeCheck size={16} color="#2EBCCC" />
                <span
                  style={{
                    color: "#2EBCCC",
                    fontWeight: 600,
                    fontSize: "0.84rem",
                  }}
                >
                  {p.verifiedProvider}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 10px",
                  borderRadius: 20,
                  background: isAvailable
                    ? "rgba(74,168,37,0.12)"
                    : "rgba(255,0,0,0.08)",
                  color: isAvailable ? "#4AA825" : "#FF0000",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                }}
              >
                {isAvailable ? (
                  <>
                    <Check size={12} /> {p.availableForWork}
                  </>
                ) : (
                  <>
                    <X size={12} /> {p.currentlyUnavailable}
                  </>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                }}
              >
                <span style={{ color: "#FFB200", fontWeight: 700 }}>
                  {MOCK_STATS.rating.toFixed(1)}
                </span>
                <div style={{ display: "flex", gap: 2 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={13}
                      fill={i < Math.round(MOCK_STATS.rating) ? "#FFB200" : "none"}
                      color={
                        i < Math.round(MOCK_STATS.rating) ? "#FFB200" : "#d6dbe2"
                      }
                    />
                  ))}
                </div>
                <span>({MOCK_STATS.reviews} {p.reviews.viewAll})</span>
              </div>
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
            <StatCard
              icon={<Briefcase size={15} />}
              label={p.stats.completedJobs}
              index={0}
              isDark={isDark}
            >
              <div
                style={{
                  fontSize: "1.9rem",
                  fontWeight: 800,
                  color: "var(--text)",
                }}
              >
                {MOCK_STATS.completedJobs}
              </div>
            </StatCard>

            <StatCard
              icon={<DollarSign size={15} />}
              label={p.stats.totalEarnings}
              index={1}
              isDark={isDark}
            >
              <div
                style={{
                  fontSize: "1.9rem",
                  fontWeight: 800,
                  color: "var(--text)",
                }}
              >
                ${MOCK_STATS.totalEarnings.toLocaleString()} {currency}
              </div>
            </StatCard>

            <StatCard
              icon={<MessageCircle size={15} />}
              label={p.stats.responseRate}
              index={2}
              isDark={isDark}
            >
              <div
                style={{
                  fontSize: "1.9rem",
                  fontWeight: 800,
                  color: "var(--text)",
                }}
              >
                {MOCK_STATS.responseRate}%
              </div>
            </StatCard>

            <StatCard
              icon={<Star size={15} />}
              label={p.stats.overallRating}
              index={3}
              isDark={isDark}
              action={<TextButton>{p.stats.seeAll} →</TextButton>}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <span
                  style={{
                    fontSize: "1.9rem",
                    fontWeight: 800,
                    color: "var(--text)",
                  }}
                >
                  {MOCK_STATS.rating.toFixed(1)}
                </span>
                <div style={{ display: "flex", gap: 2 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.span
                      key={i}
                      className="pp-star"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.25,
                        delay: 0.3 + i * 0.05,
                        ease: EASE,
                      }}
                    >
                      <Star
                        size={16}
                        fill={i < Math.round(MOCK_STATS.rating) ? "#FFB200" : "none"}
                        color={
                          i < Math.round(MOCK_STATS.rating) ? "#FFB200" : "#d6dbe2"
                        }
                      />
                    </motion.span>
                  ))}
                </div>
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
        className="pp-body-grid"
      >
        <style>{`
          @media (max-width: 860px) {
            .pp-body-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>

        {/* Sidebar: About + Services */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* About card */}
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
            <div
              style={{
                fontSize: "1.02rem",
                fontWeight: 800,
                color: "var(--text)",
                marginBottom: 16,
              }}
            >
              {p.about.title}
            </div>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.9rem",
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              Professional handyman with experience in plumbing, electrical
              repairs, painting, and carpentry. Committed to delivering quality
              work on time and keeping every job site clean.
            </p>
            <div
              style={{ height: 1, background: "var(--divider)", margin: "22px 0" }}
            />
            <div
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}
                >
                  {p.about.yearsExperience}
                </span>
                <span
                  style={{
                    color: "var(--text)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                  }}
                >
                  8
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}
                >
                  {p.about.languages}
                </span>
                <span
                  style={{
                    color: "var(--text)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                  }}
                >
                  {languageLabel}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}
                >
                  {p.about.hourlyRate}
                </span>
                <span
                  style={{
                    color: "var(--text)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                  }}
                >
                  $450 {currency}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}
                >
                  {p.about.memberSince}
                </span>
                <span
                  style={{
                    color: "var(--text)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    textTransform: "capitalize",
                  }}
                >
                  {memberSince}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Availability card */}
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
                fontSize: "1.02rem",
                fontWeight: 800,
                color: "var(--text)",
                marginBottom: 16,
              }}
            >
              {p.availability}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                {isAvailable ? p.availableForWork : p.currentlyUnavailable}
              </span>
              <input
                type="checkbox"
                className="pp-toggle"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                aria-label={p.availability}
              />
            </div>
          </motion.div>

          {/* Services card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4, ease: EASE }}
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
                fontSize: "1.02rem",
                fontWeight: 800,
                color: "var(--text)",
                marginBottom: 16,
              }}
            >
              {p.about.services}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {services.map((service, i) => (
                <motion.div
                  key={service.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: 0.45 + i * 0.05, ease: EASE }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 14px",
                    borderRadius: 999,
                    background: isDark
                      ? "rgba(46,188,204,0.12)"
                      : "rgba(46,188,204,0.08)",
                    color: "#2EBCCC",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                  }}
                >
                  {service.icon}
                  {service.label}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Main: Portfolio + Reviews */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Portfolio */}
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
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontSize: "1.02rem",
                  fontWeight: 800,
                  color: "var(--text)",
                }}
              >
                {p.portfolio.title}
              </div>
              <TextButton>{p.portfolio.viewAll} →</TextButton>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 16,
              }}
            >
              {MOCK_PORTFOLIO.map((item, i) => (
                <PortfolioCard key={item.id} item={item} index={i} />
              ))}
            </div>
          </motion.div>

          {/* Reviews */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4, ease: EASE }}
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
              <div
                style={{
                  fontSize: "1.02rem",
                  fontWeight: 800,
                  color: "var(--text)",
                }}
              >
                {p.reviews.title}
              </div>
              <TextButton>{p.reviews.viewAll} →</TextButton>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {MOCK_REVIEWS.map((review, i) => (
                <ReviewRow key={review.id} review={review} index={i} />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfileScreen;
