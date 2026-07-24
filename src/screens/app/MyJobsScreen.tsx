// Provider my jobs: list of active/historical jobs with proposal status and actions.

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Clock,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  X,
} from "lucide-react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { useI18n } from "../../i18n";
import { useToast } from "../../components/Toast/useToast";
import ToastContainer from "../../components/Toast/ToastContainer";
import FilterSelect from "../../components/filterselect/FilterSelect";
import type { ThemeMode } from "../../theme/theme";
import { MOCK_JOBS, type MyJob, type ProposalStatus } from "../../data/mockJobs";
import type { JobDetails, JobClient } from "../../types/job";
import JobDetailsModal from "../../components/jobdetailsmodal/JobDetailsModal";
import EmptyState from "../../components/emptystate/EmptyState";

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

const MOCK_CLIENT: JobClient = {
  name: "Maria Cazares",
  avatar:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
  rating: 4.9,
  reviewCount: 12,
  memberSince: "Sep. 2025",
  jobsPosted: 8,
};

const JOB_DETAILS_RICH: Record<string, Omit<JobDetails, keyof MyJob | "price" | "priceRange" | "mainImage" | "thumbnails">> = {
  "1": {
    location: "El Refugio, Tijuana",
    when: "Today",
    urgency: "ASAP",
    description:
      "Hi, I managed to break my key inside the front door lock this morning while leaving for work. The key snapped, and half of it is stuck inside the cylinder.\n\nThe door is currently locked, but I have access through the back. I need a professional to extract the broken key piece and verify the lock still functions correctly.",
    client: MOCK_CLIENT,
    proposalCount: 5,
  },
  "2": {
    location: "Centro, Tijuana",
    when: "Tomorrow",
    urgency: "Flexible",
    description:
      "There is a leak under the bathroom sink that has been getting worse over the past few days. The pipe joint appears to be loose and may need replacement or tightening.",
    client: { ...MOCK_CLIENT, name: "Carlos Ruiz", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80", rating: 4.7, reviewCount: 8 },
    proposalCount: 3,
  },
  "3": {
    location: "Otay, Tijuana",
    when: "This week",
    urgency: "Flexible",
    description:
      "Need a certified electrician to install wiring for a new office space. Approximately 2000 sq ft. Must comply with local electrical codes.",
    client: { ...MOCK_CLIENT, name: "David Lopez", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80", rating: 4.8, reviewCount: 15, jobsPosted: 12 },
    proposalCount: 7,
  },
  "4": {
    location: "Playas, Tijuana",
    when: "Tomorrow",
    urgency: "Flexible",
    description:
      "Post-move deep cleaning of a 2-bedroom apartment. Includes kitchen, bathrooms, windows, and all surfaces. Apartment is empty of furniture.",
    client: { ...MOCK_CLIENT, name: "Sara Jimenez", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80", rating: 4.6, reviewCount: 6 },
    proposalCount: 4,
  },
  "5": {
    location: "La Mesa, Tijuana",
    when: "Today",
    urgency: "ASAP",
    description:
      "Paint 3 interior rooms (living room and 2 bedrooms) in neutral colors. Walls have minor patches that need sanding first. Paint and supplies provided.",
    client: { ...MOCK_CLIENT, name: "Roberto Mendez", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&q=80", rating: 4.3, reviewCount: 4 },
    proposalCount: 6,
  },
  "6": {
    location: "Cacho, Tijuana",
    when: "This week",
    urgency: "Flexible",
    description:
      "Regular garden maintenance needed for a residential property. Includes trimming hedges, mowing the lawn, and cleaning up leaves and debris.",
    client: MOCK_CLIENT,
    proposalCount: 2,
  },
  "7": {
    location: "Zona Rio, Tijuana",
    when: "Tomorrow",
    urgency: "ASAP",
    description:
      "Custom built-in bookshelf for a home office. Dimensions: 2.4m wide x 2.8m tall. White oak finish with adjustable shelves. Requires precise measurement and professional installation.",
    client: { ...MOCK_CLIENT, name: "Carlos Ruiz", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80", rating: 4.7, reviewCount: 8, jobsPosted: 5 },
    proposalCount: 3,
  },
  "8": {
    location: "El Refugio, Tijuana",
    when: "Tomorrow",
    urgency: "Flexible",
    description:
      "Moving service for a 2-bedroom apartment on the 3rd floor. Includes packing materials, truck, and 2 movers. Elevator is available in the building.",
    client: { ...MOCK_CLIENT, name: "David Lopez", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80", rating: 4.8, reviewCount: 15, jobsPosted: 12 },
    proposalCount: 10,
  },
  "9": {
    location: "Centro, Tijuana",
    when: "Today",
    urgency: "ASAP",
    description:
      "Bathroom sink has a slow leak from the drain pipe. Water is pooling under the cabinet. Need someone to diagnose and fix it before it causes water damage.",
    client: MOCK_CLIENT,
    proposalCount: 4,
  },
  "10": {
    location: "La Mesa, Tijuana",
    when: "Today",
    urgency: "ASAP",
    description:
      "Install a new ceiling fan in the master bedroom. Wiring is already in place from a previous light fixture. Fan and mounting bracket provided by client.",
    client: { ...MOCK_CLIENT, name: "Roberto Mendez", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&q=80", rating: 4.3, reviewCount: 4 },
    proposalCount: 2,
  },
  "11": {
    location: "Zona Rio, Tijuana",
    when: "This week",
    urgency: "Flexible",
    description:
      "Weekly office cleaning contract for a small tech company. 4 rooms, 1 kitchenette, 1 bathroom. Tasks include vacuuming, dusting, trash removal, and sanitizing surfaces.",
    client: { ...MOCK_CLIENT, name: "Sara Jimenez", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80", rating: 4.6, reviewCount: 6, jobsPosted: 3 },
    proposalCount: 8,
  },
  "12": {
    location: "Otay, Tijuana",
    when: "Tomorrow",
    urgency: "Flexible",
    description:
      "Paint the backyard fence approximately 15 meters long and 1.8 meters high. Wood surface needs light sanding and weatherproof sealant applied after painting. Paint color: dark walnut.",
    client: MOCK_CLIENT,
    proposalCount: 3,
  },
  "13": {
    location: "Cacho, Tijuana",
    when: "Today",
    urgency: "ASAP",
    description:
      "Central AC unit making unusual noise and not cooling properly. Needs diagnostic check, filter replacement, and basic maintenance service.",
    client: MOCK_CLIENT,
    proposalCount: 5,
  },
};

const mapMyJobToDetails = (job: MyJob): JobDetails => {
  const rich = JOB_DETAILS_RICH[job.id] ?? {
    location: "Tijuana, Mexico",
    when: "Today",
    urgency: "Flexible",
    description: job.title,
    client: MOCK_CLIENT,
    proposalCount: 0,
  };

  return {
    id: job.id,
    title: job.title,
    category: job.category.charAt(0).toUpperCase() + job.category.slice(1),
    location: rich.location,
    when: rich.when,
    urgency: rich.urgency,
    postedAgo: `${job.postedAgo}`,
    price: job.budget,
    priceRange: `$${job.budget.toLocaleString()} ${job.currency}`,
    description: rich.description,
    mainImage: job.imageUrl ?? "",
    thumbnails: job.imageUrl ? [job.imageUrl] : [],
    client: rich.client,
    proposalCount: rich.proposalCount,
  };
};

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
  onViewDetails,
}: {
  job: MyJob;
  index: number;
  isDark: boolean;
  onViewDetails: (job: MyJob) => void;
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
          />
          <MetaChip
            icon={<Wallet size={12} />}
            label={`${d.card.budget}: $${job.budget.toLocaleString()} ${job.currency}`}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onViewDetails(job)}
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

const MyJobsScreen: React.FC = () => {
  const { isDark, theme } = useTheme();
  const { t } = useI18n();
  const d = t("myjobsscreen");
  const { toasts, addToast, removeToast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [selectedJob, setSelectedJob] = useState<MyJob | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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

  const handleViewDetails = useCallback((job: MyJob) => {
    setSelectedJob(job);
    setIsDetailsOpen(true);
  }, []);

  const handleCancelProposal = useCallback(
    (job: MyJob) => {
      setJobs((prev) => prev.filter((j) => j.id !== job.id));
      setIsDetailsOpen(false);
      addToast("success", d.actions.cancelSuccess);
    },
    [addToast, d],
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
              <FilterSelect
                value={statusFilter}
                options={statusOptions}
                onChange={(v) => { setStatusFilter(v); setPage(1); }}
              />

              <FilterSelect
                value={categoryFilter}
                options={categoryOptions}
                onChange={(v) => { setCategoryFilter(v); setPage(1); }}
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
              icon={<Briefcase size={32} color="#2EBCCC" />}
              isDark={isDark}
              title={hasActiveFilters ? d.empty.noResults : d.empty.title}
              subtitle={hasActiveFilters ? undefined : d.empty.subtitle}
              action={
                hasActiveFilters
                  ? { label: d.empty.clearFilters, onClick: clearFilters, variant: "ghost" }
                  : undefined
              }
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
                    onViewDetails={handleViewDetails}
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

      <JobDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        job={selectedJob ? mapMyJobToDetails(selectedJob) : null}
        proposalStatus={selectedJob?.proposalStatus}
        onCancelProposal={
          selectedJob ? () => handleCancelProposal(selectedJob) : undefined
        }
      />
    </>
  );
};

export default MyJobsScreen;
