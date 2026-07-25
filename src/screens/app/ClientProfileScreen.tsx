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
import { useToast } from "../../components/Toast/useToast";
import ToastContainer from "../../components/Toast/ToastContainer";
import EditPersonalInfoModal from "../../components/editpersonalinfomodal/EditPersonalInfoModal";
import { useCachedResource } from "../../hooks/useCachedResource";
import {
  fetchPerfilCliente,
  fetchReviewsCliente,
  fetchUltimasPublicacionesCliente,
  type ServicioCliente,
} from "../../api/userApi";
import { SkeletonLoader } from "./dashboard/components/SkeletonLoader";
import { timeAgo, mapEstadoToStatus } from "../../utils/servicio";
import ReviewsModal from "../../components/reviewsmodal/ReviewsModal";

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

// El backend no manda un ícono por categoría, así que se cicla un set
// decorativo por índice — mismo criterio que POST_ICONS en HomeScreen.
const RECENT_POST_ICONS = [
  <Wrench size={18} />,
  <Sparkles size={18} />,
  <Triangle size={18} />,
  <Zap size={18} />,
  <Lightbulb size={18} />,
];

function servicioEstadoToPostStatus(estado: string): PostStatus {
  const mapped = mapEstadoToStatus(estado);
  return mapped === "in_progress" ? "inProgress" : mapped;
}

function servicioToRecentPost(
  servicio: ServicioCliente,
  index: number,
): RecentPost {
  return {
    id: String(servicio.id_servicio),
    icon: RECENT_POST_ICONS[index % RECENT_POST_ICONS.length],
    title: servicio.titulo,
    postedAgo: timeAgo(servicio.fecha),
    price: `$${Number(servicio.precio_inicial).toLocaleString()}`,
    status: servicioEstadoToPostStatus(servicio.estado),
  };
}


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
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { t, locale } = useI18n();
  const p = t("profile").client;
  const languageLabel = locale === "es" ? "Español" : "English";
  const { toasts, addToast, removeToast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data: perfilCliente, isLoading: isLoadingStats } = useCachedResource(
    user?.id ? `perfil-cliente:${user.id}` : null,
    () => fetchPerfilCliente(user!.id),
  );
  const stats = {
    postedJobs: perfilCliente?.num_publicaciones ?? 0,
    rating: perfilCliente?.rating ?? 0,
    reviews: perfilCliente?.num_reviews ?? 0,
  };

  // Misma key de cache que HomeScreen — si ya visitaste Home, esto carga al
  // instante en vez de refetch.
  const { data: recentServicios, isLoading: isLoadingRecentPosts } =
    useCachedResource(
      user?.id ? `ultimas-publicaciones:${user.id}` : null,
      () => fetchUltimasPublicacionesCliente(user!.id),
    );
  const recentPosts = (recentServicios ?? []).map(servicioToRecentPost);

  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  // Se pide solo hasta que se abre el modal la primera vez (key null antes
  // de eso), no en cada visita al perfil.
  const { data: reviews, isLoading: isLoadingReviews } = useCachedResource(
    isReviewsOpen && user?.id ? `reviews:${user.id}` : null,
    () => fetchReviewsCliente(user!.id),
  );

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
              onClick={() => setIsEditOpen(true)}
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
          {isLoadingStats ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 18,
                marginTop: 28,
              }}
            >
              {[0, 1, 2].map((i) => (
                <SkeletonLoader key={i} isDark={isDark} variant="kpi" />
              ))}
            </div>
          ) : (
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
                  {stats.postedJobs}
                </div>
              </StatCard>

              <StatCard icon={<Star size={15} />} label={p.stats.overallRating} index={1} isDark={isDark}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: "1.9rem", fontWeight: 800, color: "var(--text)" }}>
                    {stats.rating.toFixed(1)}
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
                          fill={i < Math.round(stats.rating) ? "#2EBCCC" : "none"}
                          color={i < Math.round(stats.rating) ? "#2EBCCC" : "#d6dbe2"}
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
                action={
                  <TextButton onClick={() => setIsReviewsOpen(true)}>
                    {p.stats.seeAll} →
                  </TextButton>
                }
              >
                <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "var(--text)" }}>
                  {stats.reviews}
                </div>
              </StatCard>
            </div>
          )}
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
            {profile?.descripcion_perfil || p.personalInfo.defaultBio}
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
                {p.personalInfo.phone}
              </span>
              <span style={{ color: "var(--text)", fontWeight: 700, fontSize: "0.85rem" }}>
                {profile?.celular || p.personalInfo.phoneNotSet}
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
            {isLoadingRecentPosts ? (
              [0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "16px 8px",
                    borderTop: i > 0 ? `1px solid var(--divider)` : undefined,
                  }}
                >
                  <motion.div
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: [0.4, 0, 0.6, 1] }}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      background: isDark ? "#273570" : "#e5e7eb",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <motion.div
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: [0.4, 0, 0.6, 1] }}
                      style={{
                        width: "60%",
                        height: 14,
                        borderRadius: 6,
                        background: isDark ? "#273570" : "#e5e7eb",
                      }}
                    />
                  </div>
                </div>
              ))
            ) : recentPosts.length === 0 ? (
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                  textAlign: "center",
                  padding: "24px 8px",
                  margin: 0,
                }}
              >
                {p.recentPosts.empty}
              </p>
            ) : (
              recentPosts.map((post, i) => (
                <PostRow
                  key={post.id}
                  post={post}
                  index={i}
                  isDark={isDark}
                  statusLabels={statusLabels}
                  postedLabel={p.recentPosts.postedAgo}
                />
              ))
            )}
          </div>
        </motion.div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} theme={isDark ? "dark" : "light"} />

      <EditPersonalInfoModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        profile={profile}
        onSaved={(updated) => {
          updateProfile(updated);
          addToast("success", p.success.profileUpdated);
        }}
        onError={(message) => addToast("error", message)}
      />

      <ReviewsModal
        isOpen={isReviewsOpen}
        onClose={() => setIsReviewsOpen(false)}
        reviews={reviews ?? []}
        isLoading={isLoadingReviews}
        isDark={isDark}
        strings={p.reviewsModal}
      />
    </div>
  );
};

export default ClientProfileScreen;
