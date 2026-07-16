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
  X,
} from "lucide-react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n";
import { useToast } from "../../components/Toast/useToast";
import ToastContainer from "../../components/Toast/ToastContainer";
import type { ThemeMode } from "../../theme/theme";
import { ROUTES, buildPostOffersPath } from "../../router/routes";
import { MOCK_POSTS, type MyPost, type PostStatus } from "../../data/mockPosts";

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

const CATEGORY_KEYS = [
  "locksmith",
  "plumbing",
  "electrical",
  "cleaning",
  "painting",
  "carpentry",
  "moving",
  "gardening",
  "other",
] as const;

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

const AnimatedCard = ({
  post,
  index,
  isDark,
}: {
  post: MyPost;
  index: number;
  isDark: boolean;
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
            isDark={isDark}
          />
          <MetaChip
            icon={<DollarSign size={12} />}
            label={`${mp.card.budget}: $${post.budget.toLocaleString()} ${post.currency}`}
            isDark={isDark}
          />
          <MetaChip
            icon={<Users size={12} />}
            label={`${post.applicantCount} ${mp.card.applicants}`}
            isDark={isDark}
            accent={post.applicantCount > 0 && post.status === "receiving"}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(buildPostOffersPath(post.id), { state: { post } })}
          style={{
            width: "100%",
            padding: "10px 0",
            borderRadius: 10,
            border: "none",
            background: "#2EBCCC",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: "0.875rem",
            cursor: "pointer",
            fontFamily: "inherit",
            letterSpacing: "0.01em",
            transition: "background 0.18s",
            marginTop: "auto",
          }}
          onHoverStart={(e) => {
            (e.target as HTMLButtonElement).style.background = "#239aaa";
          }}
          onHoverEnd={(e) => {
            (e.target as HTMLButtonElement).style.background = "#2EBCCC";
          }}
        >
          {post.status === "receiving"
            ? mp.card.viewApplicants
            : mp.card.viewDetails}
        </motion.button>
      </div>
    </motion.div>
  );
};

const MetaChip = ({
  icon,
  label,
  isDark,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  isDark: boolean;
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

const EmptyState = ({
  hasFilters,
  isDark,
  onClear,
  onPost,
}: {
  hasFilters: boolean;
  isDark: boolean;
  onClear: () => void;
  onPost: () => void;
}) => {
  const { t } = useI18n();
  const mp = t("myposts");
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 24px",
        textAlign: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: isDark
            ? "rgba(46,188,204,0.12)"
            : "rgba(46,188,204,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 4,
        }}
      >
        <FileText size={32} color="#2EBCCC" />
      </div>
      <p
        style={{
          fontWeight: 700,
          fontSize: "1.05rem",
          color: "var(--text)",
          margin: 0,
        }}
      >
        {hasFilters ? mp.empty.noResults : mp.empty.title}
      </p>
      <p
        style={{
          color: "var(--text-secondary)",
          fontSize: "0.875rem",
          margin: 0,
          maxWidth: 320,
        }}
      >
        {hasFilters ? "" : mp.empty.subtitle}
      </p>
      {hasFilters ? (
        <button
          onClick={onClear}
          style={{
            marginTop: 8,
            padding: "9px 22px",
            borderRadius: 10,
            border: `1.5px solid ${isDark ? "#273570" : "#e5e7eb"}`,
            background: "transparent",
            color: "var(--text)",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {mp.empty.clearFilters}
        </button>
      ) : (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onPost}
          style={{
            marginTop: 8,
            padding: "10px 24px",
            borderRadius: 10,
            border: "none",
            background: "#2EBCCC",
            color: "#ffffff",
            fontSize: "0.875rem",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          <Plus size={16} strokeWidth={2.5} />
          {mp.empty.cta}
        </motion.button>
      )}
    </motion.div>
  );
};

const MyPostScreen: React.FC = () => {
  const { isDark, theme } = useTheme();
  const navigate = useNavigate();
  const { t } = useI18n();
  const mp = t("myposts");
  const { toasts, addToast, removeToast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<MyPost[]>([]);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        setPosts(MOCK_POSTS);
        setIsLoading(false);
      } catch {
        addToast("error", mp.errors.fetchFailed);
        setIsLoading(false);
      }
    }, 900);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const categoryOptions = [
    { value: "all", label: mp.filters.allCategories },
    ...CATEGORY_KEYS.map((k) => ({
      value: k,
      label: mp.categories[k],
    })),
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

              <FilterDropdown
                value={categoryFilter}
                options={categoryOptions}
                onChange={(v) => { setCategoryFilter(v); setPage(1); }}
                isDark={isDark}
              />
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
              hasFilters={hasActiveFilters}
              isDark={isDark}
              onClear={clearFilters}
              onPost={() => navigate(ROUTES.APP.NEW_SERVICE)}
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
    </>
  );
};

export default MyPostScreen;
