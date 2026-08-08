

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import {
  MapPin,
  ArrowRight,
  Navigation,
  Briefcase,
  Send,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import EmptyState from "../../components/emptystate/EmptyState";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useThemeMode } from "../../theme/useThemeMode";
import { useI18n } from "../../i18n";
import { useCurrency } from "../../context/CurrencyContext";
import { useAvailability } from "../../context/AvailabilityContext";
import { useWorkAreas } from "../../context/WorkAreasContext";
import { useToast } from "../../components/Toast/useToast";
import ToastContainer from "../../components/Toast/ToastContainer";
import { ROUTES } from "../../router/routes";
import type { JobDetails } from "../../types/job";
import type { MyJob, ProposalStatus } from "../../types/myjobs";
import JobDetailsModal from "../../components/jobdetailsmodal/JobDetailsModal";
import ApplyJobModal, {
  type ApplyJobData,
} from "../../components/applyjobmodal/ApplyJobModal";
import FilterSelect, {
  type FilterOption,
} from "../../components/filterselect/FilterSelect";
import { SkeletonLoader } from "./dashboard/components/SkeletonLoader";
import { fetchPostDetails, postularServicio } from "../../api/servicioApi";
import { ApiError } from "../../api/apiClient";
import { fetchProviderEarningsSummary } from "../../api/providerApi";
import {
  fetchTrabajosAplicados,
  fetchTrabajosDisponibles,
  type TrabajoDisponible,
} from "../../api/userApi";
import { timeAgo, mapPostDetailsToJobDetails } from "../../utils/servicio";
import { mapTrabajoAplicadoToMyJob } from "../../utils/proposals";
import { getCategoryStyle } from "../../utils/categoryStyle";
import {
  distanceKm,
  getApproxLocation,
  roundCoord,
  type ApproxCoords,
} from "../../utils/location";

interface JobFilters {
  category: string;
  distance: string;
  priceRange: string;
}

const PRICE_RANGES = ["", "0-100", "100-300", "300-500", "500+"] as const;

const formatPriceRange = (range: string): string => {
  if (range === "500+") return "$500+";
  const [min, max] = range.split("-");
  return `$${min} - $${max}`;
};

interface FeedJob {
  id: string;
  titulo: string;
  categoria_nombre: string;
  precio_inicial: number;
  postedAgo: string;
  location: string;
  mainImage: string;
  distanceKm: number | null;
  raw: TrabajoDisponible;
}

function trabajoToFeedJob(item: TrabajoDisponible): FeedJob {
  return {
    id: String(item.id_servicio),
    titulo: item.titulo,
    categoria_nombre: item.categoria,
    precio_inicial: Number(item.precio_inicial),
    postedAgo: timeAgo(item.fecha),
    location: "",
    mainImage: item.foto ?? "",
    distanceKm: null,
    raw: item,
  };
}

const PAGE_SIZE = 10;
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

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
  const d = t("jobfeedscreen");
  const pages = getPageList(page, totalPages);

  return (
    <nav className="jf-pagination" aria-label="Pagination">
      <button
        className="jf-page-arrow"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label={d.pagination.previous}
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="jf-page-ellipsis">
            &hellip;
          </span>
        ) : (
          <button
            key={p}
            className="jf-page-num"
            data-active={p === page}
            onClick={() => onChange(p)}
            aria-label={`${d.pagination.goToPage} ${p}`}
            aria-current={p === page ? "page" : undefined}
          >
            {p === page && (
              <motion.span
                layoutId="jf-page-active-bg"
                className="jf-page-active-bg"
                transition={{ type: "spring", duration: 0.45, bounce: 0.18 }}
              />
            )}
            <span className="jf-page-num-label">{p}</span>
          </button>
        ),
      )}

      <button
        className="jf-page-arrow"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label={d.pagination.next}
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
};

const JobCard = ({
  job,
  onViewDetails,
  isLoadingDetails,
}: {
  job: FeedJob;
  onViewDetails: () => void;
  isLoadingDetails: boolean;
}) => {
  const [hovered, setHovered] = useState(false);
  const { t } = useI18n();
  const d = t("jobfeedscreen");

  const categoryStyle = getCategoryStyle(job.categoria_nombre);
  const CategoryIcon = categoryStyle.icon;

  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: "var(--card-bg)",
          borderRadius: 14,
          border: "1px solid var(--divider)",
          padding: 16,
          display: "flex",
          gap: 16,
          transition: "box-shadow 0.2s, transform 0.2s",
          boxShadow: hovered
            ? "0 6px 24px rgba(0,0,0,0.12)"
            : "0 1px 4px rgba(0,0,0,0.04)",
          transform: hovered ? "translateY(-1px)" : "none",
        }}
      >
      <div style={{ position: "relative", flexShrink: 0 }}>
        {job.mainImage ? (
          <img
            src={job.mainImage}
            alt={job.titulo}
            style={{
              width: 140,
              height: 100,
              objectFit: "cover",
              borderRadius: 12,
            }}
          />
        ) : (
          <div
            style={{
              width: 140,
              height: 100,
              borderRadius: 12,
              background: "var(--input-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CategoryIcon size={24} color={categoryStyle.color} />
          </div>
        )}
        {job.distanceKm !== null && (
          <div
            style={{
              position: "absolute",
              bottom: 8,
              left: 8,
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "rgba(255,255,255,0.95)",
              padding: "4px 8px",
              borderRadius: 20,
              fontSize: "0.7rem",
              fontWeight: 700,
              color: "#1B244C",
            }}
          >
            <Navigation size={10} />
            {job.distanceKm.toFixed(1)} {d.filters.km ?? "km"}
          </div>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: "0.75rem",
              color: "var(--text-secondary)",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 10px",
                borderRadius: 20,
                background: `${categoryStyle.color}1F`,
                color: categoryStyle.color,
                fontWeight: 600,
              }}
            >
              <CategoryIcon size={12} />
              {job.categoria_nombre}
            </span>
            <span>
              {d.card.posted} {job.postedAgo}
            </span>
          </div>
          <span
            style={{
              fontSize: "1.1rem",
              fontWeight: 800,
              color: "var(--text)",
            }}
          >
            ${job.precio_inicial.toLocaleString()}
          </span>
        </div>

        <h3
          style={{
            margin: "10px 0 6px",
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--text)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 400,
          }}
        >
          {job.titulo}
        </h3>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginTop: 12,
            fontSize: "0.78rem",
            color: "var(--text-secondary)",
            minHeight: 18,
          }}
        >
          {job.location && (
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <MapPin size={12} />
              {job.location}
            </span>
          )}
        </div>

        <button
          onClick={onViewDetails}
          disabled={isLoadingDetails}
          style={{
            marginTop: 14,
            background: "#2EBCCC",
            border: "none",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.82rem",
            cursor: isLoadingDetails ? "default" : "pointer",
            opacity: isLoadingDetails ? 0.7 : 1,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            borderRadius: 10,
            fontFamily: "inherit",
            transition: "background 0.2s, box-shadow 0.2s, opacity 0.2s",
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
          {d.card.viewDetails}
          {isLoadingDetails ? (
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
            <ArrowRight size={14} />
          )}
        </button>
      </div>
    </motion.div>
  );
};

const AppliedJobItem = ({
  job,
  onViewStatus,
}: {
  job: MyJob;
  onViewStatus: (job: MyJob) => void;
}) => {
  const { t } = useI18n();
  const { formatMoney } = useCurrency();
  const d = t("jobfeedscreen");

  const statusMap: Record<
    ProposalStatus,
    { label: string; bg: string; color: string }
  > = {
    accepted: {
      label: d.statuses.accepted,
      bg: "rgba(46,188,204,0.15)",
      color: "#2EBCCC",
    },
    pending: {
      label: d.statuses.pending,
      bg: "rgba(255,178,0,0.15)",
      color: "#FFB200",
    },
    rejected: {
      label: d.statuses.rejected,
      bg: "rgba(239,68,68,0.15)",
      color: "#EF4444",
    },
    counteroffer: {
      label: d.statuses.counteroffer,
      bg: "rgba(139,92,246,0.15)",
      color: "#8B5CF6",
    },
  };
  const s = statusMap[job.proposalStatus];

  return (
    <div
      onClick={() => onViewStatus(job)}
      style={{
        display: "flex",
        gap: 12,
        background: "var(--input-bg)",
        border: "1px solid var(--divider)",
        borderRadius: 12,
        padding: "12px 14px",
        cursor: "pointer",
        transition: "box-shadow 0.2s, transform 0.2s, border-color 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.10)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {job.imageUrl ? (
        <img
          src={job.imageUrl}
          alt={job.title}
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            objectFit: "cover",
            flexShrink: 0,
          }}
        />
      ) : (
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--sidebar-bg)",
            color: "var(--text-secondary)",
          }}
        >
          <Briefcase size={20} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <h4
            style={{
              margin: 0,
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "var(--text)",
              flex: 1,
              lineHeight: 1.35,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {job.title}
          </h4>
          <span
            style={{
              padding: "3px 10px",
              borderRadius: 20,
              background: s.bg,
              color: s.color,
              fontSize: "0.66rem",
              fontWeight: 700,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {s.label}
          </span>
        </div>
        <p
          style={{
            margin: "0 0 6px",
            fontSize: "0.74rem",
            color: "var(--text-secondary)",
          }}
        >
          {d.card.posted} {job.postedAgo}
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            {formatMoney(job.budget)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewStatus(job);
            }}
            style={{
              background: "none",
              border: "none",
              color: "#2EBCCC",
              fontSize: "0.76rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              padding: "4px 8px",
              borderRadius: 6,
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(46,188,204,0.10)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "none")
            }
          >
            {d.viewStatus}
          </button>
        </div>
      </div>
    </div>
  );
};

const JobFeedScreen: React.FC = () => {
  const { isDark } = useThemeMode();
  const { t } = useI18n();
  const { formatMoney } = useCurrency();
  const d = t("jobfeedscreen");
  const p = t("profile").provider;
  const navigate = useNavigate();
  const { disponible, isLoading: isAvailabilityLoading, setDisponible } = useAvailability();
  const { areas } = useWorkAreas();

  const { toasts, addToast, removeToast } = useToast();

  const [filters, setFilters] = useState<JobFilters>({
    category: "",
    distance: "",
    priceRange: "",
  });

  const [providerCoords, setProviderCoords] = useState<ApproxCoords | null>(
    null,
  );
  const [jobs, setJobs] = useState<FeedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [earningsSummary, setEarningsSummary] = useState<{
    thisWeek: number;
    pending: number;
    projected: number;
  } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [appliedJobs, setAppliedJobs] = useState<MyJob[]>([]);
  const [isLoadingApplied, setIsLoadingApplied] = useState(true);
  const [appliedDetails, setAppliedDetails] = useState<JobDetails | null>(null);
  const [isAppliedDetailsOpen, setIsAppliedDetailsOpen] = useState(false);

  const [selectedJob, setSelectedJob] = useState<FeedJob | null>(null);
  const [selectedJobDetails, setSelectedJobDetails] = useState<JobDetails | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const items = await fetchTrabajosAplicados();
        if (cancelled) return;
        setAppliedJobs(items.map(mapTrabajoAplicadoToMyJob).slice(0, 5));
      } catch {
        if (cancelled) return;
        setAppliedJobs([]);
      } finally {
        if (!cancelled) setIsLoadingApplied(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setProviderCoords({
          lat: roundCoord(position.coords.latitude),
          lon: roundCoord(position.coords.longitude),
        });
      },
      () => {

      },
      { timeout: 8000, enableHighAccuracy: false },
    );
  }, []);

  useEffect(() => {
    fetchProviderEarningsSummary()
      .then(setEarningsSummary)
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const res = await fetchTrabajosDisponibles({
        page,
        pageSize: PAGE_SIZE,
        categoriaId: filters.category ? Number(filters.category) : undefined,
      });
      if (cancelled) return;
      setJobs(res.results.map(trabajoToFeedJob));
      setTotalItems(res.count);
    };

    run()
      .catch((error) => {
        if (cancelled) return;
        console.error("fetchTrabajosDisponibles failed:", error);
        addToast(
          "error",
          error instanceof ApiError ? error.message : d.errors.fetchFailed,
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
      setIsLoading(true);
    };
  }, [filters.category, page, addToast, d.errors.fetchFailed]);

  const handleViewDetails = async (job: FeedJob) => {
    setSelectedJob(job);
    setIsDetailsLoading(true);
    setIsDetailsOpen(true);
    try {
      const details = await fetchPostDetails(job.id);
      const location = await getApproxLocation(
        details.latitud,
        details.longitud,
      );
      setSelectedJobDetails(mapPostDetailsToJobDetails(details, location));
    } catch (error) {
      console.error("fetchPostDetails failed:", error);
      addToast(
        "error",
        error instanceof ApiError ? error.message : d.errors.detailsFailed,
      );
      setIsDetailsOpen(false);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleApplySubmit = async (data: ApplyJobData) => {
    if (!selectedJob) return;
    setIsApplying(true);
    try {
      await postularServicio(selectedJob.id, {
        precio_propuesto: data.price,
        mensaje: data.coverLetter || undefined,
      });
      setIsApplyOpen(false);
      addToast("success", d.applySuccess);
      const items = await fetchTrabajosAplicados();
      setAppliedJobs(items.map(mapTrabajoAplicadoToMyJob).slice(0, 5));
    } catch (err) {
      addToast(
        "error",
        err instanceof ApiError ? err.message : d.applyFailed,
      );
    } finally {
      setIsApplying(false);
    }
  };

  const jobsWithDistance = useMemo(() => {
    if (!providerCoords) return jobs;
    return jobs.map((job) => {
      const lat = Number(job.raw.latitud_aprox);
      const lon = Number(job.raw.longitud_aprox);
      if (Number.isNaN(lat) || Number.isNaN(lon)) return job;
      return { ...job, distanceKm: distanceKm(providerCoords, { lat, lon }) };
    });
  }, [jobs, providerCoords]);

  const categoryOptions: FilterOption[] = [
    { value: "", label: d.filters.allCategories },
    ...areas.map((a) => ({
      value: String(a.id_categoria),
      label: a.nombre,
    })),
  ];

  const distanceOptions: FilterOption[] = [
    { value: "", label: d.filters.anyDistance ?? d.filters.allCategories },
    { value: "5", label: `5 ${d.filters.km ?? "km"}` },
    { value: "10", label: `10 ${d.filters.km ?? "km"}` },
    { value: "25", label: `25 ${d.filters.km ?? "km"}` },
    { value: "50", label: `50 ${d.filters.km ?? "km"}` },
  ];

  const priceRangeOptions: FilterOption[] = PRICE_RANGES.map((range) => ({
    value: range,
    label: range === "" ? d.filters.anyPrice : formatPriceRange(range),
  }));

  const handleFilterChange = (key: keyof JobFilters) => (value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleViewAppliedDetails = async (job: MyJob) => {
    setIsAppliedDetailsOpen(true);
    try {
      const details = await fetchPostDetails(job.id_servicio);
      const location = await getApproxLocation(
        details.latitud,
        details.longitud,
      );
      setAppliedDetails(mapPostDetailsToJobDetails(details, location));
    } catch (error) {
      console.error("fetchPostDetails failed:", error);
      addToast(
        "error",
        error instanceof ApiError ? error.message : d.errors.detailsFailed,
      );
      setIsAppliedDetailsOpen(false);
    }
  };

  const visibleJobs = useMemo(() => {
    return jobsWithDistance.filter((job) => {
      if (filters.distance && job.distanceKm !== null) {
        if (job.distanceKm > Number(filters.distance)) return false;
      }
      if (filters.priceRange) {
        if (filters.priceRange === "500+") {
          if (job.precio_inicial < 500) return false;
        } else {
          const [min, max] = filters.priceRange.split("-").map(Number);
          if (job.precio_inicial < min || job.precio_inicial > max) return false;
        }
      }
      return true;
    });
  }, [jobsWithDistance, filters.distance, filters.priceRange]);

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = visibleJobs;

  const handlePageChange = useCallback(
    (p: number) => {
      if (p < 1 || p > totalPages || p === safePage) return;
      setPage(p);
      contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    },
    [totalPages, safePage],
  );

  return (
    <>
      <style>{`
        .jf-root {
          --card-bg: ${isDark ? "#1e2d5e" : "#ffffff"};
          --input-bg: ${isDark ? "#273570" : "#F8FAFC"};
          --text: ${isDark ? "#ffffff" : "#000000"};
          --text-secondary: #989898;
          --divider: ${isDark ? "#273570" : "#e5e7eb"};
        }
        .jf-main-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
          align-items: start;
        }
        .jf-jobs-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          min-width: 0;
        }
        @media (max-width: 900px) {
          .jf-main-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 600px) {
          .jf-topbar {
            padding: 14px 16px !important;
          }
          .jf-content {
            padding: 16px !important;
          }
          .jf-filter-grid {
            grid-template-columns: 1fr !important;
          }
          .jf-job-card {
            flex-direction: column !important;
          }
          .jf-job-card img {
            width: 100% !important;
            height: 160px !important;
          }
        }
        .jf-pagination-bar {
          padding: 12px 0;
          border-top: 1px solid var(--divider);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .jf-pagination {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .jf-page-arrow {
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
          .jf-page-arrow:not(:disabled):hover {
            border-color: #2EBCCC;
            color: #2EBCCC;
            background: ${isDark ? "rgba(46,188,204,0.07)" : "rgba(46,188,204,0.05)"};
          }
        }
        .jf-page-arrow:active:not(:disabled) {
          transform: scale(0.93);
        }
        .jf-page-arrow:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .jf-page-num {
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
          .jf-page-num:not([data-active="true"]):hover {
            color: #2EBCCC;
          }
        }
        .jf-page-num:active {
          transform: scale(0.93);
        }
        .jf-page-num[data-active="true"] {
          color: #ffffff;
        }
        .jf-page-num-label {
          position: relative;
          z-index: 1;
        }
        .jf-page-active-bg {
          position: absolute;
          inset: 0;
          border-radius: 9px;
          background: #2EBCCC;
          box-shadow: 0 3px 10px rgba(46,188,204,0.35);
        }
        .jf-page-ellipsis {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 24px;
          height: 34px;
          color: var(--text-secondary);
          font-size: 0.85rem;
          user-select: none;
        }
      `}</style>

      <div
        className="jf-root page-enter"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <div
          className="jf-topbar"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            padding: "20px 28px",
            borderBottom: "1px solid var(--divider)",
            background: "var(--sidebar-bg)",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(1.3rem, 3vw, 1.7rem)",
                fontWeight: 800,
                color: "var(--text)",
              }}
            >
              {d.title}
            </h1>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "0.9rem",
                color: "var(--text-secondary)",
              }}
            >
              {d.subtitle}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
            }}
          >
            {d.status}
            <span
              style={{
                padding: "6px 12px",
                borderRadius: 20,
                background: disponible
                  ? "rgba(74,168,37,0.15)"
                  : "rgba(255,0,0,0.08)",
                color: disponible ? "#4AA825" : "#FF0000",
                fontWeight: 700,
                fontSize: "0.78rem",
              }}
            >
              {disponible ? d.availableForWork : p.currentlyUnavailable}
            </span>
          </div>
        </div>

        <div
          className="jf-content"
          ref={contentRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 28,
            background: "var(--main-bg)",
          }}
        >
          {!disponible && !isAvailabilityLoading ? (
            <div
              style={{
                background: "var(--card-bg)",
                borderRadius: 16,
                border: "1px solid var(--divider)",
              }}
            >
              <EmptyState
                icon={<Briefcase size={32} color="#2EBCCC" />}
                isDark={isDark}
                title={p.unavailableTitle}
                subtitle={p.unavailableSubtitle}
                action={{
                  label: p.unavailableActivate,
                  onClick: () =>
                    setDisponible(true).catch(() =>
                      addToast("error", p.availabilityUpdateFailed),
                    ),
                }}
              />
            </div>
          ) : (
            <>
              <div
                className="jf-filter-bar"
                style={{
                  background: "var(--card-bg)",
                  borderRadius: 16,
                  border: "1px solid var(--divider)",
                  padding: 20,
                  marginBottom: 24,
                }}
              >
                <div
                  className="jf-filter-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: 16,
                  }}
                >
                  <FilterSelect
                    label={d.filters.category}
                    value={filters.category}
                    options={categoryOptions}
                    placeholder={d.filters.allCategories}
                    onChange={handleFilterChange("category")}
                  />
                  {providerCoords && (
                    <FilterSelect
                      label={d.filters.distance}
                      value={filters.distance}
                      options={distanceOptions}
                      placeholder={d.filters.anyDistance ?? d.filters.allCategories}
                      onChange={handleFilterChange("distance")}
                    />
                  )}
                  <FilterSelect
                    label={d.filters.priceRange}
                    value={filters.priceRange}
                    options={priceRangeOptions}
                    placeholder={d.filters.anyPrice}
                    onChange={handleFilterChange("priceRange")}
                  />
                </div>
              </div>

              <div className="jf-main-grid">
                <div className="jf-jobs-list">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <SkeletonLoader key={i} isDark={isDark} variant="job-card" />
                    ))
                  ) : visibleJobs.length === 0 ? (
                    <div
                      style={{
                        background: "var(--card-bg)",
                        borderRadius: 16,
                        border: "1px solid var(--divider)",
                      }}
                    >
                      <EmptyState
                        icon={<Briefcase size={32} color="#2EBCCC" />}
                        isDark={isDark}
                        title={areas.length === 0 && !filters.category ? d.noAreasTitle : d.empty}
                        subtitle={areas.length === 0 && !filters.category ? d.noAreasSubtitle : d.emptySubtitle}
                      />
                    </div>
                  ) : (
                    paginated.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        onViewDetails={() => handleViewDetails(job)}
                        isLoadingDetails={isDetailsLoading && selectedJob?.id === job.id}
                      />
                    ))
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div
                    style={{
                      background: "#1B244C",
                      borderRadius: 16,
                      padding: 20,
                  color: "#fff",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 16px",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.7)",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {d.earningsSummary}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.85rem",
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  {d.thisWeek}
                </p>
                <p
                  style={{
                    margin: "4px 0 18px",
                    fontSize: "1.8rem",
                    fontWeight: 800,
                  }}
                >
                  {formatMoney(earningsSummary?.thisWeek ?? 0)}
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.75rem",
                        color: "rgba(255,255,255,0.7)",
                      }}
                    >
                      {d.pending}
                    </p>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: "1rem",
                        fontWeight: 700,
                      }}
                    >
                      {formatMoney(earningsSummary?.pending ?? 0)}
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.75rem",
                        color: "rgba(255,255,255,0.7)",
                      }}
                    >
                      {d.projected}
                    </p>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: "1rem",
                        fontWeight: 700,
                      }}
                    >
                      {formatMoney(earningsSummary?.projected ?? 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: "var(--card-bg)",
                  borderRadius: 16,
                  border: "1px solid var(--divider)",
                  padding: "16px 20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "0.85rem",
                      fontWeight: 800,
                      color: "var(--text)",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    {d.myAppliedJobs}
                  </h3>
                  <button
                    onClick={() => navigate(ROUTES.APP.MY_JOBS)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#2EBCCC",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      padding: "4px 8px",
                      borderRadius: 6,
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(46,188,204,0.10)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "none")
                    }
                  >
                    {d.viewAll}
                  </button>
                </div>
                {isLoadingApplied ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      marginTop: 10,
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: [0.4, 0, 0.6, 1] }}
                        style={{
                          height: 58,
                          borderRadius: 12,
                          background: isDark ? "#273570" : "#e5e7eb",
                        }}
                      />
                    ))}
                  </div>
                ) : appliedJobs.length === 0 ? (
                  <EmptyState
                    icon={<Send size={20} color="#2EBCCC" />}
                    isDark={isDark}
                    title={d.noAppliedJobs}
                    size="compact"
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      marginTop: 10,
                    }}
                  >
                    {appliedJobs.map((job) => (
                      <AppliedJobItem
                        key={job.id}
                        job={job}
                        onViewStatus={handleViewAppliedDetails}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {!isLoading && totalPages > 1 && (
            <div className="jf-pagination-bar">
              <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: 0 }}>
                {d.pagination.page} {safePage} {d.pagination.of} {totalPages}
              </p>
              <Pagination
                page={safePage}
                totalPages={totalPages}
                onChange={handlePageChange}
              />
            </div>
          )}
            </>
          )}
        </div>
      </div>

      <JobDetailsModal
        isOpen={isAppliedDetailsOpen}
        onClose={() => setIsAppliedDetailsOpen(false)}
        job={appliedDetails}
      />

      <JobDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        job={selectedJobDetails}
        onApply={() => {
          setIsDetailsOpen(false);
          setIsApplyOpen(true);
        }}
      />

      <ApplyJobModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        jobTitle={selectedJob?.titulo ?? ""}
        clientPrice={selectedJob?.precio_inicial ?? 0}
        isSubmitting={isApplying}
        onSubmit={handleApplySubmit}
      />

      <ToastContainer
        toasts={toasts}
        onRemove={removeToast}
        theme={isDark ? "dark" : "light"}
      />
    </>
  );
};

export default JobFeedScreen;
