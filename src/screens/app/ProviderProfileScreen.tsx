import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { motion, useInView } from "motion/react";
import {
  Pencil,
  MoreHorizontal,
  BadgeCheck,
  Briefcase,
  DollarSign,
  Star,
  Camera,
  Check,
  X,
  Trash2,
} from "lucide-react";
import { getCategoryStyle } from "../../utils/categoryStyle";
import { useAuth } from "../../context/AuthContext";
import { useCurrency } from "../../context/CurrencyContext";
import { useAvailability } from "../../context/AvailabilityContext";
import { useWorkAreas } from "../../context/WorkAreasContext";
import { useI18n } from "../../i18n";
import type { ThemeMode } from "../../theme/theme";
import { uploadProfilePhoto } from "../../api/userApi";
import { fetchReviewsCliente, type ReviewCliente } from "../../api/userApi";
import {
  fetchPerfilProveedor,
  fetchCategoriasProveedor,
  type PerfilProveedor,
  type AreaTrabajo,
} from "../../api/userApi";
import { fetchDashboardProveedor, type ProviderKpisResponse } from "../../api/providerApi";
import { useToast } from "../../components/Toast/useToast";
import ToastContainer from "../../components/Toast/ToastContainer";
import { friendlyErrorMessage } from "../../utils/apiError";
import Avatar from "../../components/avatar/Avatar";
import ImageWithFallback from "../../components/imagewithfallback/ImageWithFallback";
import EditAreasModal from "../../components/editareasmodal/EditAreasModal";
import PortafolioModal from "../../components/portafoliomodal/PortafolioModal";
import PortfolioItemModal from "../../components/portfolioitemmodal/PortfolioItemModal";
import { CustomizableModal } from "../../components/modal/CustomizableModal";
import ReviewsModal from "../../components/reviewsmodal/ReviewsModal";
import EmptyState from "../../components/emptystate/EmptyState";
import { timeAgo } from "../../utils/servicio";
import {
  fetchPortafolio,
  deletePortafolioItem,
  type PortafolioItem as PortafolioApiItem,
} from "../../api/portafolioApi";

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

interface PortfolioItem {
  id: string;
  image: string;
  title: string;
  category: string;
  id_portafolio: number;
}

interface Review {
  id: string;
  avatar: string;
  name: string;
  rating: number;
  date: string;
  comment: string;
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
  onDelete,
  onClick,
  isDark,
}: {
  item: PortfolioItem;
  index: number;
  onDelete?: () => void;
  onClick?: () => void;
  isDark: boolean;
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
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
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
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div style={{ position: "relative", height: 140, overflow: "hidden" }}>
        <motion.div
          animate={{ scale: hovered ? 1.06 : 1 }}
          transition={{ duration: 0.3, ease: EASE }}
          style={{ width: "100%", height: "100%" }}
        >
          <ImageWithFallback
            src={item.image}
            alt={item.title}
            isDark={isDark}
            borderRadius={0}
            size="md"
            style={{ width: "100%", height: "100%" }}
          />
        </motion.div>
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
        {onDelete && (
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              opacity: hovered ? 1 : 0,
              transition: "opacity 0.2s",
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "none",
                background: "rgba(0,0,0,0.55)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: 0,
              }}
              onMouseEnter={(ev) =>
                (ev.currentTarget.style.background = "rgba(220,38,38,0.8)")
              }
              onMouseLeave={(ev) =>
                (ev.currentTarget.style.background = "rgba(0,0,0,0.55)")
              }
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
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
      <Avatar photoUrl={review.avatar} name={review.name} size={44} style={{ flex: "none" }} />
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
  const { user, profile, updateProfile } = useAuth();
  const { id: routeProviderId } = useParams<{ id?: string }>();
  // Sin :id en la ruta => perfil propio del proveedor logueado (editable).
  // Con :id (ej. /app/providers/:id, usado por el cliente) => solo lectura.
  const isOwnProfile = !routeProviderId;
  const targetUserId = routeProviderId ?? user?.id;
  const { t, locale } = useI18n();
  const { formatMoney } = useCurrency();
  const p = t("profile").provider;
  const { toasts, addToast, removeToast } = useToast();

  const { disponible, isLoading: isAvailabilityLoading, setDisponible } = useAvailability();
  const { areas, isLoading: isAreasLoading, update: updateAreas } = useWorkAreas();
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showEditAreasModal, setShowEditAreasModal] = useState(false);
  const [areasModalKey, setAreasModalKey] = useState(0);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [portfolio, setPortfolio] = useState<PortafolioApiItem[]>([]);
  const [isPortfolioLoading, setIsPortfolioLoading] = useState(true);
  const [showPortafolioModal, setShowPortafolioModal] = useState(false);
  const [portafolioModalKey, setPortafolioModalKey] = useState(0);
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<PortafolioApiItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [reviewsList, setReviewsList] = useState<ReviewCliente[]>([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);
  const [showReviewsModal, setShowReviewsModal] = useState(false);

  const reviewsData: Review[] = reviewsList.map((r) => ({
    id: String(r.id_calificacion),
    avatar: r.foto_evaluador ?? "",
    name: r.nombre_evaluador,
    rating: r.puntuacion,
    date: timeAgo(r.fecha),
    comment: r.comentario ?? "",
  }));

  const portfolioItems: PortfolioItem[] = portfolio.map((item) => ({
    id: String(item.id_portafolio),
    id_portafolio: item.id_portafolio,
    image: item.fotos[0] ?? "",
    title: item.titulo,
    category: item.categoria_nombre,
  }));

  const refreshPortfolio = async () => {
    if (!targetUserId) return;
    try {
      const data = await fetchPortafolio(targetUserId);
      setPortfolio(data);
    } catch (err) {
      console.error("fetchPortafolio failed:", err);
    }
  };

  // GET .../portafolio/ y .../reviews/ son públicos (sin chequeo de dueño en
  // backend), por eso sirven igual para el propio perfil y para el de un
  // tercero — basta con pedirlos por targetUserId en vez de user.id.
  useEffect(() => {
    if (!targetUserId) return;
    let cancelled = false;
    fetchPortafolio(targetUserId)
      .then((data) => {
        if (!cancelled) setPortfolio(data);
      })
      .catch(() => {
        if (!cancelled) setPortfolio([]);
      })
      .finally(() => {
        if (!cancelled) setIsPortfolioLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [targetUserId]);

  useEffect(() => {
    if (!targetUserId) return;
    let cancelled = false;
    fetchReviewsCliente(targetUserId)
      .then((data) => {
        if (!cancelled) setReviewsList(data);
      })
      .catch(() => {
        if (!cancelled) setReviewsList([]);
      })
      .finally(() => {
        if (!cancelled) setIsReviewsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [targetUserId]);

  const handleDeletePortafolio = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deletePortafolioItem(deleteTarget.id);
      setPortfolio((prev) =>
        prev.filter((item) => item.id_portafolio !== deleteTarget.id),
      );
      setDeleteTarget(null);
      addToast("success", p.portfolio.deleteSuccess);
    } catch (err) {
      console.error("deletePortafolioItem failed:", err);
      addToast(
        "error",
        err instanceof Error ? err.message : p.portfolio.error,
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveAreas = useCallback(
    async (categoriaIds: number[]) => {
      try {
        await updateAreas(categoriaIds);
        addToast("success", p.workAreas.updateSuccess);
      } catch (error) {
        addToast("error", friendlyErrorMessage(error, p.workAreas.updateFailed));
        throw error;
      }
    },
    [updateAreas, addToast, p],
  );

  const [kpis, setKpis] = useState<ProviderKpisResponse | null>(null);
  const [isKpisLoading, setIsKpisLoading] = useState(true);

  useEffect(() => {
    // El dashboard de KPIs (con ganancias) es privado del dueño — el backend
    // lo rechaza para cualquier otro id_usuario, así que solo se pide en el
    // propio perfil.
    if (!isOwnProfile || !user?.id) return;
    let cancelled = false;
    fetchDashboardProveedor(user.id)
      .then((res) => {
        if (!cancelled) setKpis(res);
      })
      .catch(() => {
        if (!cancelled) setKpis(null);
      })
      .finally(() => {
        if (!cancelled) setIsKpisLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOwnProfile, user?.id]);

  // Perfil público (sin ganancias) para cuando se ve el perfil de otro
  // proveedor — usa la misma info que el dashboard de KPIs necesita para
  // trabajos completados/rating/reviews, pero por un endpoint público.
  const [perfilProveedor, setPerfilProveedor] = useState<PerfilProveedor | null>(null);
  const [isPerfilLoading, setIsPerfilLoading] = useState(true);

  useEffect(() => {
    if (isOwnProfile || !targetUserId) return;
    let cancelled = false;
    fetchPerfilProveedor(targetUserId)
      .then((res) => {
        if (!cancelled) setPerfilProveedor(res);
      })
      .catch(() => {
        if (!cancelled) setPerfilProveedor(null);
      })
      .finally(() => {
        if (!cancelled) setIsPerfilLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOwnProfile, targetUserId]);

  // Áreas de trabajo de otro proveedor (endpoint público) — useWorkAreas()
  // solo sirve para el propio usuario logueado.
  const [otherAreas, setOtherAreas] = useState<AreaTrabajo[]>([]);
  const [isOtherAreasLoading, setIsOtherAreasLoading] = useState(true);

  useEffect(() => {
    if (isOwnProfile || !targetUserId) return;
    let cancelled = false;
    fetchCategoriasProveedor(targetUserId)
      .then((data) => {
        if (!cancelled) setOtherAreas(data);
      })
      .catch(() => {
        if (!cancelled) setOtherAreas([]);
      })
      .finally(() => {
        if (!cancelled) setIsOtherAreasLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOwnProfile, targetUserId]);

  const effectiveAreas = isOwnProfile ? areas : otherAreas;
  const effectiveAreasLoading = isOwnProfile ? isAreasLoading : isOtherAreasLoading;

  const completedJobs = isOwnProfile
    ? isKpisLoading ? null : (kpis?.completedJobs ?? 0)
    : isPerfilLoading ? null : (perfilProveedor?.trabajos_completados ?? 0);
  const totalEarnings = isOwnProfile
    ? (isKpisLoading ? null : (kpis?.earnings ?? 0))
    : null;
  const rating = isOwnProfile
    ? isKpisLoading ? null : (kpis?.rating ?? 0)
    : isPerfilLoading ? null : (perfilProveedor?.rating ?? 0);
  const reviews = isOwnProfile
    ? isKpisLoading ? null : (kpis?.reviews ?? 0)
    : isPerfilLoading ? null : (perfilProveedor?.num_reviews ?? 0);

  const handleAvailabilityChange = async (next: boolean) => {
    try {
      await setDisponible(next);
    } catch {
      addToast("error", p.availabilityUpdateFailed);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user?.id) return;
    setIsUploadingPhoto(true);
    try {
      const publicUrl = await uploadProfilePhoto(user.id, file);
      if (profile) updateProfile({ ...profile, url_foto_perfil: publicUrl });
    } catch {
      addToast("error", p.photoUploadError);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const fullName = isOwnProfile
    ? user
      ? `${user.firstName} ${user.lastnameP}${user.lastnameM ? ` ${user.lastnameM}` : ""}`
      : ""
    : perfilProveedor?.nombre ?? "";

  const avatarUrl = isOwnProfile ? profile?.url_foto_perfil : perfilProveedor?.url_foto_perfil;

  const memberSinceRaw = isOwnProfile ? profile?.fecha_registro : perfilProveedor?.fecha_registro;
  const memberSince = memberSinceRaw
    ? new Date(memberSinceRaw).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      })
    : "—";

  const profileDescription = isOwnProfile
    ? profile?.descripcion_perfil?.trim() || ""
    : perfilProveedor?.descripcion_perfil?.trim() || "";

  const languageLabel = locale === "es" ? "Español" : "English";

  const services = effectiveAreas.map((area) => {
    const style = getCategoryStyle(area.nombre);
    const Icon = style.icon;
    return {
      icon: <Icon size={14} color={style.color} />,
      color: style.color,
      label: area.nombre,
    };
  });

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

      {}
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
          {isOwnProfile && (
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
          )}
        </div>

        <div
          style={{
            padding: "0 36px 32px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.1, ease: EASE }}
            style={{
              position: "relative",
              width: 112,
              height: 112,
              marginTop: -52,
              zIndex: 1,
            }}
          >
            <Avatar
              photoUrl={avatarUrl}
              name={isOwnProfile ? user?.firstName : perfilProveedor?.nombre}
              lastName={isOwnProfile ? user?.lastnameP : undefined}
              size={112}
              style={{
                fontSize: "2.2rem",
                border: "5px solid var(--sidebar-bg)",
                boxShadow: "0 4px 16px rgba(20,30,40,.18)",
                opacity: isUploadingPhoto ? 0.5 : 1,
              }}
              alt={fullName}
            />
            {isOwnProfile && (
              <>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  style={{
                    position: "absolute",
                    bottom: 2,
                    right: 2,
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    border: "3px solid var(--sidebar-bg)",
                    background: "#2EBCCC",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: isUploadingPhoto ? "default" : "pointer",
                    fontFamily: "inherit",
                  }}
                  aria-label={p.changePhoto}
                >
                  <Camera size={14} />
                </button>
              </>
            )}
          </motion.div>
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
              {isOwnProfile && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "4px 10px",
                    borderRadius: 20,
                    background: disponible
                      ? "rgba(74,168,37,0.12)"
                      : "rgba(255,0,0,0.08)",
                    color: disponible ? "#4AA825" : "#FF0000",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                  }}
                >
                  {disponible ? (
                    <>
                      <Check size={12} /> {p.availableForWork}
                    </>
                  ) : (
                    <>
                      <X size={12} /> {p.currentlyUnavailable}
                    </>
                  )}
                </div>
              )}
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
                  {rating === null ? "—" : rating.toFixed(1)}
                </span>
                <div style={{ display: "flex", gap: 2 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={13}
                      fill={i < Math.round(rating ?? 0) ? "#FFB200" : "none"}
                      color={
                        i < Math.round(rating ?? 0) ? "#FFB200" : "#d6dbe2"
                      }
                    />
                  ))}
                </div>
                <span>({reviews === null ? "—" : reviews} {p.reviews.viewAll})</span>
              </div>
            </div>
          </motion.div>

          {}
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
                {completedJobs === null ? "—" : completedJobs}
              </div>
            </StatCard>

            {isOwnProfile && (
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
                  {totalEarnings === null ? "—" : formatMoney(totalEarnings)}
                </div>
              </StatCard>
            )}

            <StatCard
              icon={<Star size={15} />}
              label={p.stats.overallRating}
              index={2}
              isDark={isDark}
              action={<TextButton onClick={() => setShowReviewsModal(true)}>{p.stats.seeAll} →</TextButton>}
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
                  {rating === null ? "—" : rating.toFixed(1)}
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
                        fill={i < Math.round(rating ?? 0) ? "#FFB200" : "none"}
                        color={
                          i < Math.round(rating ?? 0) ? "#FFB200" : "#d6dbe2"
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

      {}
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

        {}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {}
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
              {profileDescription || p.about.defaultBio}
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
              {isOwnProfile && (
                <>
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
                      {p.about.hourlyRate}
                    </span>
                    <span
                      style={{
                        color: "var(--text)",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                      }}
                    >
                      {formatMoney(450)}
                    </span>
                  </div>
                </>
              )}
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

          {isOwnProfile && (
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
                {disponible ? p.availableForWork : p.currentlyUnavailable}
              </span>
              <input
                type="checkbox"
                className="pp-toggle"
                checked={disponible}
                disabled={isAvailabilityLoading}
                onChange={(e) => handleAvailabilityChange(e.target.checked)}
                aria-label={p.availability}
              />
            </div>
          </motion.div>
          )}

          {}
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
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: "1.02rem",
                  fontWeight: 800,
                  color: "var(--text)",
                }}
              >
                {p.workAreas.title}
              </div>
              {isOwnProfile && (
                <motion.button
                  className="pp-btn-ghost"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => { setAreasModalKey((k) => k + 1); setShowEditAreasModal(true); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 14px",
                    borderRadius: 999,
                    border: "none",
                    background: isDark
                      ? "rgba(46,188,204,0.15)"
                      : "rgba(46,188,204,0.1)",
                    color: "#2EBCCC",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <Pencil size={13} />
                  {p.workAreas.edit}
                </motion.button>
              )}
            </div>
            {effectiveAreasLoading ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: [0.4, 0, 0.6, 1] }}
                    style={{
                      width: 90 + i * 20,
                      height: 34,
                      borderRadius: 999,
                      background: isDark ? "#273570" : "#e5e7eb",
                    }}
                  />
                ))}
              </div>
            ) : services.length === 0 ? (
              <EmptyState
                icon={<Briefcase size={22} color="#2EBCCC" />}
                isDark={isDark}
                title={p.workAreas.empty}
                size="compact"
              />
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {services.map((service, i) => (
                  <motion.div
                    key={service.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.05 + i * 0.05, ease: EASE }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 14px",
                      borderRadius: 999,
                      background: `${service.color}${isDark ? "1F" : "14"}`,
                      color: service.color,
                      fontSize: "0.8rem",
                      fontWeight: 700,
                    }}
                  >
                    {service.icon}
                    {service.label}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {}
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
              {isOwnProfile && (
                <TextButton
                  onClick={() => {
                    setPortafolioModalKey((k) => k + 1);
                    setShowPortafolioModal(true);
                  }}
                >
                  + {p.portfolio.add}
                </TextButton>
              )}
            </div>
            {isPortfolioLoading ? (
              <div
                style={{
                  textAlign: "center",
                  color: "var(--text-secondary)",
                  fontSize: "0.85rem",
                  padding: "32px 0",
                }}
              >
                Cargando...
              </div>
            ) : portfolioItems.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "var(--text-secondary)",
                  fontSize: "0.85rem",
                  padding: "32px 0",
                }}
              >
                {p.portfolio.empty}
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: 16,
                }}
              >
                {portfolioItems.map((item, i) => (
                  <PortfolioCard
                    key={item.id}
                    item={item}
                    index={i}
                    isDark={isDark}
                    onClick={() => {
                      const full = portfolio.find(
                        (p) => p.id_portafolio === item.id_portafolio,
                      );
                      if (full) setSelectedPortfolioItem(full);
                    }}
                    onDelete={
                      isOwnProfile
                        ? () =>
                            setDeleteTarget({
                              id: item.id_portafolio,
                              title: item.title,
                            })
                        : undefined
                    }
                  />
                ))}
              </div>
            )}
          </motion.div>

          {}
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
              <TextButton onClick={() => setShowReviewsModal(true)}>
                {p.reviews.viewAll} →
              </TextButton>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {isReviewsLoading ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "var(--text-secondary)",
                    fontSize: "0.85rem",
                    padding: "24px 0",
                  }}
                >
                  Cargando...
                </div>
              ) : reviewsData.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "var(--text-secondary)",
                    fontSize: "0.85rem",
                    padding: "24px 0",
                  }}
                >
                  {p.reviews.empty}
                </div>
              ) : (
                reviewsData.slice(0, 3).map((review, i) => (
                  <ReviewRow key={review.id} review={review} index={i} />
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} theme={isDark ? "dark" : "light"} />
      <ReviewsModal
        isOpen={showReviewsModal}
        onClose={() => setShowReviewsModal(false)}
        reviews={reviewsList}
        isLoading={isReviewsLoading}
        isDark={isDark}
        strings={p.reviewsModal}
      />
      {isOwnProfile && (
        <>
          <EditAreasModal
            key={areasModalKey}
            isOpen={showEditAreasModal}
            onClose={() => setShowEditAreasModal(false)}
            onSave={handleSaveAreas}
          />

          <PortafolioModal
            key={portafolioModalKey}
            isOpen={showPortafolioModal}
            onClose={() => setShowPortafolioModal(false)}
            onCreated={() => {
              refreshPortfolio();
              addToast("success", p.portfolio.createSuccess);
            }}
          />

          <CustomizableModal
            isOpen={deleteTarget !== null}
            onClose={() => setDeleteTarget(null)}
            variant="warning"
            title={p.portfolio.deleteTitle}
            subtitle={p.portfolio.deleteBody}
            confirmText={p.portfolio.delete}
            onConfirm={handleDeletePortafolio}
            isSubmitting={isDeleting}
          />
        </>
      )}

      <PortfolioItemModal
        isOpen={selectedPortfolioItem !== null}
        onClose={() => setSelectedPortfolioItem(null)}
        item={selectedPortfolioItem}
      />
    </div>
  );
};

export default ProviderProfileScreen;
