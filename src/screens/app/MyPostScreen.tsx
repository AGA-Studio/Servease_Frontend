import { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus,
  Search,
  Clock,
  DollarSign,
  Users,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  MoreVertical,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n";
import { useToast } from "../../components/Toast/useToast";
import ToastContainer from "../../components/Toast/ToastContainer";
import type { ThemeMode } from "../../theme/theme";
import { ROUTES, buildPostOffersPath } from "../../router/routes";
import type { MyPost, PostStatus } from "../../data/mockPosts";
import JobDetailsModal from "../../components/jobdetailsmodal/JobDetailsModal";
import type { JobDetails } from "../../types/job";
import { useAuth } from "../../context/AuthContext";
import { fetchUltimasPublicacionesCliente } from "../../api/userApi";
import {
  deleteServicio,
  fetchAplicantes,
  fetchPostDetails,
  type PostDetails,
  type ServicioResponse,
} from "../../api/servicioApi";
import {
  timeAgo,
  mapEstadoToStatus,
  mapPostDetailsToJobDetails,
} from "../../utils/servicio";
import { getApproxLocation } from "../../utils/location";
import { ApiError } from "../../api/apiClient";
import ConfirmModal from "../../components/confirmmodal/ConfirmModal";
import EmptyState from "../../components/emptystate/EmptyState";
import EditPostModal from "../../components/editpostmodal/EditPostModal";

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

const PAGE_SIZE = 6;
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

const StatusBadge = ({
  status,
  isDark,
}: {
  status: PostStatus;
  isDark: boolean;
}) => {
  const { t } = useI18n();
  const mp = t("myposts");
  const map: Record<PostStatus, { label: string; bg: string; color: string }> =
    {
      receiving: {
        label: mp.status.receiving,
        bg: isDark ? "rgba(46,188,204,0.18)" : "rgba(46,188,204,0.12)",
        color: "#2EBCCC",
      },
      in_progress: {
        label: mp.status.inProgress,
        bg: isDark ? "rgba(255,178,0,0.18)" : "rgba(255,178,0,0.12)",
        color: "#FFB200",
      },
      completed: {
        label: mp.status.completed,
        bg: isDark ? "rgba(74,168,37,0.18)" : "rgba(74,168,37,0.12)",
        color: "#4AA825",
      },
    };
  const s = map[status];
  return (
    <span
      style={{
        padding: "4px 12px",
        borderRadius: 20,
        fontSize: "0.72rem",
        fontWeight: 700,
        background: s.bg,
        color: s.color,
        whiteSpace: "nowrap",
        letterSpacing: "0.01em",
      }}
    >
      {s.label}
    </span>
  );
};

const SkeletonCard = ({ isDark }: { isDark: boolean }) => (
  <div
    style={{
      background: isDark ? "#1e2d5e" : "#ffffff",
      borderRadius: 16,
      overflow: "hidden",
      border: `1px solid ${isDark ? "#273570" : "#e5e7eb"}`,
    }}
  >
    <div
      className="mp-skeleton"
      style={{ height: 180, background: isDark ? "#273570" : "#e5e7eb" }}
    />
    <div style={{ padding: "18px 20px" }}>
      <div
        className="mp-skeleton"
        style={{
          height: 12,
          width: "40%",
          borderRadius: 6,
          background: isDark ? "#273570" : "#e5e7eb",
          marginBottom: 12,
        }}
      />
      <div
        className="mp-skeleton"
        style={{
          height: 16,
          width: "85%",
          borderRadius: 6,
          background: isDark ? "#273570" : "#e5e7eb",
          marginBottom: 6,
        }}
      />
      <div
        className="mp-skeleton"
        style={{
          height: 16,
          width: "60%",
          borderRadius: 6,
          background: isDark ? "#273570" : "#e5e7eb",
          marginBottom: 18,
        }}
      />
      <div style={{ display: "flex", gap: 16 }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="mp-skeleton"
            style={{
              height: 12,
              width: 60,
              borderRadius: 6,
              background: isDark ? "#273570" : "#e5e7eb",
            }}
          />
        ))}
      </div>
    </div>
  </div>
);

const MENU_EASE = [0.23, 1, 0.32, 1] as const;

const CardMenu = ({
  isDark,
  isLoadingEdit,
  onEdit,
  onDelete,
}: {
  isDark: boolean;
  isLoadingEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const { t } = useI18n();
  const mp = t("myposts");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      ref={ref}
      style={{ position: "absolute", top: 10, right: 10, zIndex: 2 }}
      onClick={(e) => e.stopPropagation()}
    >
      <motion.button
        onClick={() => (isLoadingEdit ? undefined : setOpen((o) => !o))}
        whileHover={{ scale: isLoadingEdit ? 1 : 1.08 }}
        whileTap={{ scale: isLoadingEdit ? 1 : 0.92 }}
        transition={{ duration: 0.15 }}
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          border: "none",
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(4px)",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: isLoadingEdit ? "default" : "pointer",
        }}
      >
        {isLoadingEdit ? (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
            style={{
              width: 13,
              height: 13,
              borderRadius: "50%",
              border: "2px solid currentColor",
              borderTopColor: "transparent",
              display: "inline-block",
            }}
          />
        ) : (
          <MoreVertical size={16} />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -6 }}
            transition={{ duration: 0.16, ease: MENU_EASE }}
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              right: 0,
              transformOrigin: "top right",
              minWidth: 150,
              background: isDark ? "#1e2d5e" : "#ffffff",
              border: `1.5px solid ${isDark ? "#273570" : "#e5e7eb"}`,
              borderRadius: 12,
              boxShadow: "0 8px 28px rgba(0,0,0,0.18)",
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                width: "100%",
                padding: "10px 14px",
                background: "transparent",
                border: "none",
                color: "var(--text)",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
                transition: "background 140ms ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(46,188,204,0.10)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <Pencil size={14} color="#2EBCCC" />
              {mp.card.edit}
            </button>
            <button
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                width: "100%",
                padding: "10px 14px",
                background: "transparent",
                border: "none",
                color: "#FF4444",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
                transition: "background 140ms ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,68,68,0.10)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <Trash2 size={14} color="#FF4444" />
              {mp.card.delete}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AnimatedCard = ({
  post,
  index,
  isDark,
  onViewDetails,
  isLoadingDetails,
  onEdit,
  onDelete,
  isLoadingEdit,
}: {
  post: MyPost;
  index: number;
  isDark: boolean;
  onViewDetails: (post: MyPost) => void;
  isLoadingDetails: boolean;
  onEdit: (post: MyPost) => void;
  onDelete: (post: MyPost) => void;
  isLoadingEdit: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const { t } = useI18n();
  const mp = t("myposts");

  const categoryLabel =
    mp.categories[post.category as keyof typeof mp.categories] ?? post.category;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{
        duration: 0.45,
        delay: index * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        background: isDark ? "#1e2d5e" : "#ffffff",
        borderRadius: 16,
        overflow: "hidden",
        border: `1px solid ${isDark ? "#273570" : "#e5e7eb"}`,
        transition: "box-shadow 0.22s, transform 0.22s",
        boxShadow: hovered
          ? "0 8px 32px rgba(0,0,0,0.14)"
          : "0 1px 4px rgba(0,0,0,0.05)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        cursor: "default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{ position: "relative", height: 180, overflow: "hidden" }}
      >
        {post.imageUrl && !imgError ? (
          <img
            src={post.imageUrl}
            alt={post.title}
            onError={() => setImgError(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.4s ease",
              transform: hovered ? "scale(1.04)" : "scale(1)",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: isDark ? "#273570" : "#e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileText size={36} color={isDark ? "#3d4f8a" : "#c0c9d4"} />
          </div>
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.35) 100%)",
          }}
        />
        {post.status === "receiving" && (
          <CardMenu
            isDark={isDark}
            isLoadingEdit={isLoadingEdit}
            onEdit={() => onEdit(post)}
            onDelete={() => onDelete(post)}
          />
        )}
      </div>

      <div style={{ padding: "16px 20px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
            flexWrap: "wrap",
            gap: 6,
          }}
        >
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 800,
              color: "#2EBCCC",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {categoryLabel}
          </span>
          <StatusBadge status={post.status} isDark={isDark} />
        </div>

        <h3
          style={{
            margin: "0 0 14px",
            fontSize: "0.97rem",
            fontWeight: 700,
            color: "var(--text)",
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "calc(0.97rem * 1.4 * 2)",
          }}
        >
          {post.title}
        </h3>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          <MetaChip
            icon={<Clock size={12} />}
            label={`${mp.card.postedAgo} ${post.postedAgo}`}
          />
          <MetaChip
            icon={<DollarSign size={12} />}
            label={`${mp.card.budget}: $${post.budget.toLocaleString()} ${post.currency}`}
          />
          <MetaChip
            icon={<Users size={12} />}
            label={`${post.applicantCount} ${mp.card.applicants}`}
            accent={post.applicantCount > 0 && post.status === "receiving"}
          />
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(buildPostOffersPath(post.id), { state: { post } })}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 10,
              border: "none",
              background: "#2EBCCC",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "0.83rem",
              cursor: "pointer",
              fontFamily: "inherit",
              letterSpacing: "0.01em",
              transition: "background 160ms ease-out",
            }}
            onHoverStart={(e) => {
              (e.target as HTMLButtonElement).style.background = "#239aaa";
            }}
            onHoverEnd={(e) => {
              (e.target as HTMLButtonElement).style.background = "#2EBCCC";
            }}
          >
            {mp.card.viewApplicants}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onViewDetails(post)}
            disabled={isLoadingDetails}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 10,
              border: `1.5px solid ${isDark ? "#273570" : "#e5e7eb"}`,
              background: "transparent",
              color: "var(--text)",
              fontWeight: 700,
              fontSize: "0.83rem",
              cursor: isLoadingDetails ? "default" : "pointer",
              opacity: isLoadingDetails ? 0.6 : 1,
              fontFamily: "inherit",
              letterSpacing: "0.01em",
              transition: "border-color 160ms ease-out, color 160ms ease-out, opacity 160ms ease-out",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
            }}
            onHoverStart={(e) => {
              if (isLoadingDetails) return;
              (e.target as HTMLButtonElement).style.borderColor = "#2EBCCC";
              (e.target as HTMLButtonElement).style.color = "#2EBCCC";
            }}
            onHoverEnd={(e) => {
              (e.target as HTMLButtonElement).style.borderColor = isDark
                ? "#273570"
                : "#e5e7eb";
              (e.target as HTMLButtonElement).style.color = "var(--text)";
            }}
          >
            {isLoadingDetails && (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  border: "2px solid currentColor",
                  borderTopColor: "transparent",
                  display: "inline-block",
                }}
              />
            )}
            {mp.card.viewDetails}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const MetaChip = ({
  icon,
  label,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  accent?: boolean;
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 5,
      fontSize: "0.78rem",
      color: accent ? "#2EBCCC" : "var(--text-secondary)",
      fontWeight: accent ? 600 : 400,
    }}
  >
    <span style={{ color: accent ? "#2EBCCC" : "var(--text-secondary)", display: "flex" }}>
      {icon}
    </span>
    {label}
  </div>
);

const FilterDropdown = ({
  value,
  options,
  onChange,
  isDark,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  isDark: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} style={{ position: "relative", display: "flex", flexDirection: "column" }}>
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 7,
          padding: "0 14px",
          height: 42,
          width: "100%",
          borderRadius: 10,
          border: `1.5px solid ${isDark ? "#273570" : "#e5e7eb"}`,
          background: isDark ? "#1e2d5e" : "#ffffff",
          color: "var(--text)",
          fontSize: "0.875rem",
          fontWeight: 500,
          cursor: "pointer",
          fontFamily: "inherit",
          whiteSpace: "nowrap",
          transition: "border-color 0.18s",
          boxSizing: "border-box",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.borderColor = "#2EBCCC")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.borderColor = isDark ? "#273570" : "#e5e7eb")
        }
      >
        {selected?.label}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.18 }}
          style={{ display: "flex" }}
        >
          <ChevronDown size={15} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              minWidth: 180,
              background: isDark ? "#1e2d5e" : "#ffffff",
              border: `1.5px solid ${isDark ? "#273570" : "#e5e7eb"}`,
              borderRadius: 12,
              boxShadow: "0 8px 28px rgba(0,0,0,0.14)",
              zIndex: 100,
              overflow: "hidden",
            }}
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "9px 14px",
                  background:
                    opt.value === value
                      ? isDark
                        ? "rgba(46,188,204,0.12)"
                        : "rgba(46,188,204,0.08)"
                      : "transparent",
                  color:
                    opt.value === value ? "#2EBCCC" : "var(--text)",
                  fontSize: "0.875rem",
                  fontWeight: opt.value === value ? 600 : 400,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "background 0.14s",
                }}
                onMouseEnter={(e) => {
                  if (opt.value !== value)
                    e.currentTarget.style.background = isDark
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.03)";
                }}
                onMouseLeave={(e) => {
                  if (opt.value !== value)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const getPageList = (page: number, totalPages: number): (number | "...")[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
  const sorted = Array.from(pages)
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  const result: (number | "...")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push("...");
    result.push(p);
  });
  return result;
};

const Pagination = ({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) => {
  const { t } = useI18n();
  const mp = t("myposts");
  const pages = getPageList(page, totalPages);

  return (
    <nav className="mp-pagination" aria-label="Pagination">
      <button
        className="mp-page-arrow"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label={mp.pagination.previous}
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="mp-page-ellipsis">
            &hellip;
          </span>
        ) : (
          <button
            key={p}
            className="mp-page-num"
            data-active={p === page}
            onClick={() => onChange(p)}
            aria-label={`${mp.pagination.goToPage} ${p}`}
            aria-current={p === page ? "page" : undefined}
          >
            {p === page && (
              <motion.span
                layoutId="mp-page-active-bg"
                className="mp-page-active-bg"
                transition={{ type: "spring", duration: 0.45, bounce: 0.18 }}
              />
            )}
            <span className="mp-page-num-label">{p}</span>
          </button>
        )
      )}

      <button
        className="mp-page-arrow"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label={mp.pagination.next}
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
};


const MyPostScreen: React.FC = () => {
  const { isDark, theme } = useTheme();
  const navigate = useNavigate();
  const { t } = useI18n();
  const mp = t("myposts");
  const { toasts, addToast, removeToast } = useToast();
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [selectedPost, setSelectedPost] = useState<MyPost | null>(null);
  const [selectedJobDetails, setSelectedJobDetails] =
    useState<JobDetails | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<MyPost | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editTarget, setEditTarget] = useState<PostDetails | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loadingEditPostId, setLoadingEditPostId] = useState<string | null>(
    null,
  );

  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<MyPost[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    fetchUltimasPublicacionesCliente(user.id)
      .then(async (servicios) => {
        const counts = await Promise.all(
          servicios.map((servicio) =>
            fetchAplicantes(servicio.id_servicio)
              .then((list) => list.length)
              .catch(() => 0),
          ),
        );
        if (cancelled) return;
        setPosts(
          servicios.map((servicio, i) => ({
            id: String(servicio.id_servicio),
            title: servicio.titulo,
            category: String(servicio.id_categoria),
            status: mapEstadoToStatus(servicio.estado),
            postedAgo: timeAgo(servicio.fecha),
            budget: Number(servicio.precio_inicial),
            currency: "MXN",
            applicantCount: counts[i],
            imageUrl: servicio.imagenes[0],
          })),
        );
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("fetchUltimasPublicacionesCliente failed:", error);
        addToast("error", mp.errors.fetchFailed);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const filtered = posts.filter((p) => {
    const matchSearch = p.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" || p.status === statusFilter;
    const matchCategory =
      categoryFilter === "all" || p.category === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const contentRef = useRef<HTMLDivElement>(null);

  const handlePageChange = useCallback(
    (p: number) => {
      if (p < 1 || p > totalPages || p === safePage) return;
      setPage(p);
      contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    },
    [totalPages, safePage]
  );

  const handleViewDetails = useCallback(
    (post: MyPost) => {
      setSelectedPost(post);
      setSelectedJobDetails(null);
      setIsLoadingDetails(true);
      fetchPostDetails(post.id)
        .then(async (details) => {
          const location = await getApproxLocation(
            details.latitud,
            details.longitud,
          );
          setSelectedJobDetails(mapPostDetailsToJobDetails(details, location));
          setIsDetailsOpen(true);
        })
        .catch((error) => {
          console.error("fetchPostDetails failed:", error);
          addToast("error", mp.errors.generic);
        })
        .finally(() => setIsLoadingDetails(false));
    },
    [addToast, mp.errors.generic],
  );

  const handleDeleteClick = useCallback((post: MyPost) => {
    setDeleteTarget(post);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteServicio(deleteTarget.id);
      setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      addToast("success", mp.success.deleted);
    } catch (error) {
      addToast(
        "error",
        error instanceof ApiError ? error.message : mp.errors.deleteFailed,
      );
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, addToast, mp.success.deleted, mp.errors.deleteFailed]);

  const handleEditClick = useCallback(
    (post: MyPost) => {
      setLoadingEditPostId(post.id);
      fetchPostDetails(post.id)
        .then((details) => {
          setEditTarget(details);
          setIsEditOpen(true);
        })
        .catch((error) => {
          console.error("fetchPostDetails failed:", error);
          addToast("error", mp.errors.generic);
        })
        .finally(() => setLoadingEditPostId(null));
    },
    [addToast, mp.errors.generic],
  );

  const handleEditSaved = useCallback(
    (updated: ServicioResponse) => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === String(updated.id_servicio)
            ? { ...p, title: updated.titulo, budget: Number(updated.precio_inicial) }
            : p,
        ),
      );
      addToast("success", mp.success.edited);
    },
    [addToast, mp.success.edited],
  );

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setPage(1);
  };

  const hasActiveFilters =
    search !== "" || statusFilter !== "all" || categoryFilter !== "all";


  const statusOptions = [
    { value: "all", label: mp.filters.allStatuses },
    { value: "receiving", label: mp.status.receiving },
    { value: "in_progress", label: mp.status.inProgress },
    { value: "completed", label: mp.status.completed },
  ];

  return (
    <>
      <style>{`
        .mp-root {
          --card-bg: ${isDark ? "#1e2d5e" : "#ffffff"};
          --input-bg: ${isDark ? "#273570" : "#F8FAFC"};
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }
        .mp-topbar {
          padding: 20px 28px;
          border-bottom: 1px solid var(--divider);
          background: var(--sidebar-bg);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-shrink: 0;
          flex-wrap: wrap;
        }
        .mp-content {
          flex: 1;
          overflow-y: auto;
          padding: 28px;
          background: var(--main-bg);
        }
        .mp-pagination-bar {
          padding: 12px 28px;
          border-top: 1px solid var(--divider);
          background: var(--sidebar-bg);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-shrink: 0;
        }
        .mp-filters {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .mp-search-wrap {
          flex: 1;
          min-width: 180px;
          max-width: 420px;
          position: relative;
        }
        .mp-search-input {
          width: 100%;
          height: 42px;
          padding: 0 14px 0 38px;
          border-radius: 10px;
          border: 1.5px solid ${isDark ? "#273570" : "#e5e7eb"};
          background: ${isDark ? "#1e2d5e" : "#ffffff"};
          color: var(--text);
          font-size: 0.875rem;
          font-family: inherit;
          outline: none;
          transition: border-color 0.18s;
          box-sizing: border-box;
        }
        .mp-search-input::placeholder {
          color: var(--text-secondary);
        }
        .mp-search-input:focus {
          border-color: #2EBCCC;
        }
        .mp-search-icon {
          position: absolute;
          left: 11px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
          pointer-events: none;
          display: flex;
        }
        .mp-search-clear {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-secondary);
          display: flex;
          padding: 2px;
          border-radius: 4px;
        }
        .mp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }
        @keyframes mp-shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .mp-skeleton {
          background: ${
            isDark
              ? "linear-gradient(90deg, #273570 25%, #2d3d7a 50%, #273570 75%)"
              : "linear-gradient(90deg, #e5e7eb 25%, #f0f2f4 50%, #e5e7eb 75%)"
          };
          background-size: 800px 100%;
          animation: mp-shimmer 1.4s infinite linear;
        }
        .mp-pagination {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .mp-page-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 9px;
          border: 1.5px solid ${isDark ? "#273570" : "#e5e7eb"};
          background: transparent;
          color: var(--text);
          cursor: pointer;
          transition: transform 120ms ${EASE_OUT}, border-color 160ms ease, color 160ms ease, background 160ms ease;
        }
        @media (hover: hover) and (pointer: fine) {
          .mp-page-arrow:not(:disabled):hover {
            border-color: #2EBCCC;
            color: #2EBCCC;
            background: ${isDark ? "rgba(46,188,204,0.07)" : "rgba(46,188,204,0.05)"};
          }
        }
        .mp-page-arrow:active:not(:disabled) {
          transform: scale(0.93);
        }
        .mp-page-arrow:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .mp-page-num {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 34px;
          height: 34px;
          padding: 0 4px;
          border-radius: 9px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: color 160ms ease, transform 120ms ${EASE_OUT};
        }
        @media (hover: hover) and (pointer: fine) {
          .mp-page-num:not([data-active="true"]):hover {
            color: #2EBCCC;
          }
        }
        .mp-page-num:active {
          transform: scale(0.93);
        }
        .mp-page-num[data-active="true"] {
          color: #ffffff;
        }
        .mp-page-num-label {
          position: relative;
          z-index: 1;
        }
        .mp-page-active-bg {
          position: absolute;
          inset: 0;
          border-radius: 9px;
          background: #2EBCCC;
          box-shadow: 0 3px 10px rgba(46,188,204,0.35);
        }
        .mp-page-ellipsis {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 24px;
          height: 34px;
          color: var(--text-secondary);
          font-size: 0.85rem;
          user-select: none;
        }
        @media (max-width: 600px) {
          .mp-topbar {
            padding: 14px 16px;
          }
          .mp-content {
            padding: 16px;
          }
          .mp-grid {
            grid-template-columns: 1fr;
          }
          .mp-title-row h1 {
            font-size: 1.25rem !important;
          }
          .mp-pagination-bar {
            padding: 10px 16px;
            flex-direction: column;
            gap: 8px;
          }
        }
        @media (max-width: 767px) {
          .mp-post-btn {
            display: none !important;
          }
        }
        @media (max-width: 480px) {
          .mp-search-wrap {
            flex-basis: 100%;
            max-width: 100%;
          }
          .mp-filter-row {
            flex: 1;
          }
          .mp-filter-row > * {
            flex: 1;
          }
          .mp-filter-row > * button {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>

      <ToastContainer toasts={toasts} onRemove={removeToast} theme={theme} />

      <div className="mp-root page-enter">
        <div className="mp-topbar">
          <div className="mp-title-row">
            <h1
              style={{
                margin: 0,
                fontWeight: 800,
                fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)",
                color: "var(--text)",
              }}
            >
              {mp.title}
            </h1>
            <p
              style={{
                margin: "3px 0 0",
                color: "var(--text-secondary)",
                fontSize: "0.84rem",
              }}
            >
              {mp.subtitle}
            </p>
          </div>

          <motion.button
            className="mp-post-btn"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(ROUTES.APP.NEW_SERVICE)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "0 18px",
              height: 42,
              borderRadius: 11,
              border: "none",
              background: "#2EBCCC",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "0.875rem",
              cursor: "pointer",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
              flexShrink: 0,
              transition: "background 0.18s, box-shadow 0.18s",
            }}
            onHoverStart={(e) => {
              (e.target as HTMLButtonElement).style.background = "#239aaa";
              (e.target as HTMLButtonElement).style.boxShadow =
                "0 4px 14px rgba(46,188,204,0.4)";
            }}
            onHoverEnd={(e) => {
              (e.target as HTMLButtonElement).style.background = "#2EBCCC";
              (e.target as HTMLButtonElement).style.boxShadow = "none";
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span className="mp-btn-label">{mp.postService}</span>
          </motion.button>
        </div>

        <div className="mp-content" ref={contentRef}>
          <div className="mp-filters">
            <div className="mp-search-wrap">
              <span className="mp-search-icon">
                <Search size={15} />
              </span>
              <input
                className="mp-search-input"
                type="text"
                placeholder={mp.searchPlaceholder}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
              <AnimatePresence>
                {search && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.14 }}
                    className="mp-search-clear"
                    onClick={() => setSearch("")}
                  >
                    <X size={14} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <div className="mp-filter-row" style={{ display: "flex", gap: 10 }}>
              <FilterDropdown
                value={statusFilter}
                options={statusOptions}
                onChange={(v) => { setStatusFilter(v); setPage(1); }}
                isDark={isDark}
              />
              {/* Filtro de categoría oculto: el backend no expone nombres de
                  categoría en este listado (solo id_categoria), así que no hay
                  forma de mapear el filtro a algo legible ni funcional. */}
            </div>
          </div>

          {isLoading ? (
            <div className="mp-grid">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <SkeletonCard key={i} isDark={isDark} />
              ))}
            </div>
          ) : paginated.length === 0 ? (
            <EmptyState
              icon={<FileText size={32} color="#2EBCCC" />}
              isDark={isDark}
              title={hasActiveFilters ? mp.empty.noResults : mp.empty.title}
              subtitle={hasActiveFilters ? undefined : mp.empty.subtitle}
              action={
                hasActiveFilters
                  ? { label: mp.empty.clearFilters, onClick: clearFilters, variant: "ghost" }
                  : {
                      label: mp.empty.cta,
                      onClick: () => navigate(ROUTES.APP.NEW_SERVICE),
                      icon: <Plus size={16} strokeWidth={2.5} />,
                    }
              }
            />
          ) : (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={safePage}
                  className="mp-grid"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                >
                  {paginated.map((post, i) => (
                    <AnimatedCard
                      key={post.id}
                      post={post}
                      index={i}
                      isDark={isDark}
                      onViewDetails={handleViewDetails}
                      isLoadingDetails={
                        isLoadingDetails && selectedPost?.id === post.id
                      }
                      onEdit={handleEditClick}
                      onDelete={handleDeleteClick}
                      isLoadingEdit={loadingEditPostId === post.id}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>

        {!isLoading && totalPages > 1 && (
          <div className="mp-pagination-bar">
            <p
              style={{
                fontSize: "0.78rem",
                color: "var(--text-secondary)",
                margin: 0,
              }}
            >
              {mp.pagination.page} {safePage} {mp.pagination.of} {totalPages}
            </p>
            <Pagination
              page={safePage}
              totalPages={totalPages}
              onChange={handlePageChange}
            />
          </div>
        )}
      </div>

      <JobDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        job={selectedJobDetails}
        postStatus={selectedPost?.status}
        onViewApplicants={
          selectedPost
            ? () => navigate(buildPostOffersPath(selectedPost.id))
            : undefined
        }
      />

      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        isDark={isDark}
        title={mp.deleteConfirm.title}
        message={mp.deleteConfirm.message}
        confirmLabel={isDeleting ? mp.pagination.loading : mp.deleteConfirm.confirm}
        cancelLabel={mp.deleteConfirm.cancel}
        onConfirm={handleConfirmDelete}
        onClose={() => setIsDeleteConfirmOpen(false)}
      />

      <EditPostModal
        key={editTarget?.id_servicio ?? "none"}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        post={editTarget}
        onSaved={handleEditSaved}
        onError={(message) => addToast("error", message)}
      />
    </>
  );
};

export default MyPostScreen;
