// Provider my jobs: list of active/historical jobs with proposal status and actions.

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Clock,
  Wallet,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  X,
} from "lucide-react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { useI18n } from "../../i18n";
import { useToast } from "../../components/Toast/useToast";
import ToastContainer from "../../components/Toast/ToastContainer";
import type { ThemeMode } from "../../theme/theme";
import { MOCK_JOBS, type MyJob, type ProposalStatus } from "../../data/mockJobs";

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

const ProposalBadge = ({
  status,
  isDark,
}: {
  status: ProposalStatus;
  isDark: boolean;
}) => {
  const { t } = useI18n();
  const d = t("myjobsscreen");
  const map: Record<ProposalStatus, { label: string; bg: string; color: string }> =
    {
      accepted: {
        label: d.proposalStatuses.accepted,
        bg: isDark ? "rgba(46,188,204,0.18)" : "rgba(46,188,204,0.12)",
        color: "#2EBCCC",
      },
      pending: {
        label: d.proposalStatuses.pending,
        bg: isDark ? "rgba(255,178,0,0.18)" : "rgba(255,178,0,0.12)",
        color: "#FFB200",
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
      className="mj-skeleton"
      style={{ height: 180, background: isDark ? "#273570" : "#e5e7eb" }}
    />
    <div style={{ padding: "18px 20px" }}>
      <div
        className="mj-skeleton"
        style={{
          height: 12,
          width: "40%",
          borderRadius: 6,
          background: isDark ? "#273570" : "#e5e7eb",
          marginBottom: 12,
        }}
      />
      <div
        className="mj-skeleton"
        style={{
          height: 16,
          width: "85%",
          borderRadius: 6,
          background: isDark ? "#273570" : "#e5e7eb",
          marginBottom: 6,
        }}
      />
      <div
        className="mj-skeleton"
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
            className="mj-skeleton"
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

const AnimatedJobCard = ({
  job,
  index,
  isDark,
}: {
  job: MyJob;
  index: number;
  isDark: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { t } = useI18n();
  const d = t("myjobsscreen");

  const categoryLabel =
    d.categories[job.category as keyof typeof d.categories] ?? job.category;

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
      <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
        {job.imageUrl && !imgError ? (
          <img
            src={job.imageUrl}
            alt={job.title}
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
            <Briefcase size={36} color={isDark ? "#3d4f8a" : "#c0c9d4"} />
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
          <ProposalBadge status={job.proposalStatus} isDark={isDark} />
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
          {job.title}
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
            label={`${d.card.posted} ${job.postedAgo}`}
            isDark={isDark}
          />
          <MetaChip
            icon={<Wallet size={12} />}
            label={`${d.card.budget}: $${job.budget.toLocaleString()} ${job.currency}`}
            isDark={isDark}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
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
            transition: "background 160ms ease-out",
            marginTop: "auto",
          }}
          onHoverStart={(e) => {
            (e.target as HTMLButtonElement).style.background = "#239aaa";
          }}
          onHoverEnd={(e) => {
            (e.target as HTMLButtonElement).style.background = "#2EBCCC";
          }}
        >
          {d.actions.viewDetails}
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
  const d = t("myjobsscreen");
  const pages = getPageList(page, totalPages);

  return (
    <nav className="mj-pagination" aria-label="Pagination">
      <button
        className="mj-page-arrow"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label={d.pagination.previous}
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="mj-page-ellipsis">
            &hellip;
          </span>
        ) : (
          <button
            key={p}
            className="mj-page-num"
            data-active={p === page}
            onClick={() => onChange(p)}
            aria-label={`${d.pagination.goToPage} ${p}`}
            aria-current={p === page ? "page" : undefined}
          >
            {p === page && (
              <motion.span
                layoutId="mj-page-active-bg"
                className="mj-page-active-bg"
                transition={{ type: "spring", duration: 0.45, bounce: 0.18 }}
              />
            )}
            <span className="mj-page-num-label">{p}</span>
          </button>
        )
      )}

      <button
        className="mj-page-arrow"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label={d.pagination.next}
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
}: {
  hasFilters: boolean;
  isDark: boolean;
  onClear: () => void;
}) => {
  const { t } = useI18n();
  const d = t("myjobsscreen");
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
        <Briefcase size={32} color="#2EBCCC" />
      </div>
      <p
        style={{
          fontWeight: 700,
          fontSize: "1.05rem",
          color: "var(--text)",
          margin: 0,
        }}
      >
        {hasFilters ? d.empty.noResults : d.empty.title}
      </p>
      <p
        style={{
          color: "var(--text-secondary)",
          fontSize: "0.875rem",
          margin: 0,
          maxWidth: 320,
        }}
      >
        {hasFilters ? "" : d.empty.subtitle}
      </p>
      {hasFilters && (
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
          {d.empty.clearFilters}
        </button>
      )}
    </motion.div>
  );
};

const MyJobsScreen: React.FC = () => {
  const { isDark, theme } = useTheme();
  const { t } = useI18n();
  const d = t("myjobsscreen");
  const { toasts, addToast, removeToast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState<MyJob[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setJobs(MOCK_JOBS);
        setIsLoading(false);
      } catch {
        addToast("error", d.errors.fetchFailed);
        setIsLoading(false);
      }
    }, 900);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = jobs.filter((j) => {
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" || j.proposalStatus === statusFilter;
    const matchCategory =
      categoryFilter === "all" || j.category === categoryFilter;
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
    { value: "all", label: d.filters.allStatuses },
    { value: "accepted", label: d.proposalStatuses.accepted },
    { value: "pending", label: d.proposalStatuses.pending },
  ];

  const categoryOptions = [
    { value: "all", label: d.filters.allCategories },
    ...CATEGORY_KEYS.map((k) => ({
      value: k,
      label: d.categories[k],
    })),
  ];

  return (
    <>
      <style>{`
        .mj-root {
          --card-bg: ${isDark ? "#1e2d5e" : "#ffffff"};
          --input-bg: ${isDark ? "#273570" : "#F8FAFC"};
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }
        .mj-topbar {
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
        .mj-content {
          flex: 1;
          overflow-y: auto;
          padding: 28px;
          background: var(--main-bg);
        }
        .mj-pagination-bar {
          padding: 12px 28px;
          border-top: 1px solid var(--divider);
          background: var(--sidebar-bg);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-shrink: 0;
        }
        .mj-filters {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .mj-search-wrap {
          flex: 1;
          min-width: 180px;
          max-width: 420px;
          position: relative;
        }
        .mj-search-input {
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
        .mj-search-input::placeholder {
          color: var(--text-secondary);
        }
        .mj-search-input:focus {
          border-color: #2EBCCC;
        }
        .mj-search-icon {
          position: absolute;
          left: 11px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
          pointer-events: none;
          display: flex;
        }
        .mj-search-clear {
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
        .mj-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }
        @keyframes mj-shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .mj-skeleton {
          background: ${
            isDark
              ? "linear-gradient(90deg, #273570 25%, #2d3d7a 50%, #273570 75%)"
              : "linear-gradient(90deg, #e5e7eb 25%, #f0f2f4 50%, #e5e7eb 75%)"
          };
          background-size: 800px 100%;
          animation: mj-shimmer 1.4s infinite linear;
        }
        .mj-pagination {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .mj-page-arrow {
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
          .mj-page-arrow:not(:disabled):hover {
            border-color: #2EBCCC;
            color: #2EBCCC;
            background: ${isDark ? "rgba(46,188,204,0.07)" : "rgba(46,188,204,0.05)"};
          }
        }
        .mj-page-arrow:active:not(:disabled) {
          transform: scale(0.93);
        }
        .mj-page-arrow:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .mj-page-num {
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
          .mj-page-num:not([data-active="true"]):hover {
            color: #2EBCCC;
          }
        }
        .mj-page-num:active {
          transform: scale(0.93);
        }
        .mj-page-num[data-active="true"] {
          color: #ffffff;
        }
        .mj-page-num-label {
          position: relative;
          z-index: 1;
        }
        .mj-page-active-bg {
          position: absolute;
          inset: 0;
          border-radius: 9px;
          background: #2EBCCC;
          box-shadow: 0 3px 10px rgba(46,188,204,0.35);
        }
        .mj-page-ellipsis {
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
          .mj-topbar {
            padding: 14px 16px;
          }
          .mj-content {
            padding: 16px;
          }
          .mj-grid {
            grid-template-columns: 1fr;
          }
          .mj-title-row h1 {
            font-size: 1.25rem !important;
          }
          .mj-pagination-bar {
            padding: 10px 16px;
            flex-direction: column;
            gap: 8px;
          }
        }
        @media (max-width: 480px) {
          .mj-search-wrap {
            flex-basis: 100%;
            max-width: 100%;
          }
          .mj-filter-row {
            flex: 1;
          }
          .mj-filter-row > * {
            flex: 1;
          }
          .mj-filter-row > * button {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>

      <ToastContainer toasts={toasts} onRemove={removeToast} theme={theme} />

      <div className="mj-root page-enter">
        <div className="mj-topbar">
          <div className="mj-title-row">
            <h1
              style={{
                margin: 0,
                fontWeight: 800,
                fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)",
                color: "var(--text)",
              }}
            >
              {d.title}
            </h1>
            <p
              style={{
                margin: "3px 0 0",
                color: "var(--text-secondary)",
                fontSize: "0.84rem",
              }}
            >
              {d.subtitle}
            </p>
          </div>
        </div>

        <div className="mj-content" ref={contentRef}>
          <div className="mj-filters">
            <div className="mj-search-wrap">
              <span className="mj-search-icon">
                <Search size={15} />
              </span>
              <input
                className="mj-search-input"
                type="text"
                placeholder={d.searchPlaceholder}
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
                    className="mj-search-clear"
                    onClick={() => setSearch("")}
                  >
                    <X size={14} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <div className="mj-filter-row" style={{ display: "flex", gap: 10 }}>
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
            <div className="mj-grid">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <SkeletonCard key={i} isDark={isDark} />
              ))}
            </div>
          ) : paginated.length === 0 ? (
            <EmptyState
              hasFilters={hasActiveFilters}
              isDark={isDark}
              onClear={clearFilters}
            />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={safePage}
                className="mj-grid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              >
                {paginated.map((job, i) => (
                  <AnimatedJobCard
                    key={job.id}
                    job={job}
                    index={i}
                    isDark={isDark}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {!isLoading && totalPages > 1 && (
          <div className="mj-pagination-bar">
            <p
              style={{
                fontSize: "0.78rem",
                color: "var(--text-secondary)",
                margin: 0,
              }}
            >
              {d.pagination.page} {safePage} {d.pagination.of} {totalPages}
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

export default MyJobsScreen;
