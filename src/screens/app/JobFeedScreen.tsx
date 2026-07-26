// Provider job feed: filter bar, job cards, earnings summary and applied jobs sidebar.

import { useEffect, useMemo, useState } from "react";
import {
  MapPin,
  ArrowRight,
  Navigation,
  Briefcase,
  Send,
} from "lucide-react";
import EmptyState from "../../components/emptystate/EmptyState";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useThemeMode } from "../../theme/useThemeMode";
import { useI18n } from "../../i18n";
import { useToast } from "../../components/Toast/useToast";
import ToastContainer from "../../components/Toast/ToastContainer";
import { ROUTES } from "../../router/routes";
import type { JobDetails } from "../../types/job";
import JobDetailsModal from "../../components/jobdetailsmodal/JobDetailsModal";
import ApplyJobModal, {
  type ApplyJobData,
} from "../../components/applyjobmodal/ApplyJobModal";
import FilterSelect, {
  type FilterOption,
} from "../../components/filterselect/FilterSelect";
import { SkeletonLoader } from "./dashboard/components/SkeletonLoader";
import { fetchCategorias, type Categoria } from "../../api/categoriaApi";
import {
  fetchPostDetails,
  fetchServiciosCatalog,
  type ServicioListItem,
} from "../../api/servicioApi";
import { ApiError } from "../../api/apiClient";
import { timeAgo, mapPostDetailsToJobDetails } from "../../utils/servicio";
import {
  distanceKm,
  getApproxLocation,
  roundCoord,
  type ApproxCoords,
} from "../../utils/location";

interface AppliedJob {
  id: string;
  title: string;
  status: "reviewing" | "completed" | "declined" | "closed";
  sentAgo: string;
  price: string;
}

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

// Catálogo real (ServicioListItem) enriquecido con ubicación aproximada
// resuelta en cliente y, si el proveedor compartió su ubicación, distancia
// real en línea recta (nunca coordenadas exactas mostradas al usuario).
interface FeedJob {
  id: string;
  titulo: string;
  categoria_nombre: string;
  precio_inicial: number;
  postedAgo: string;
  location: string;
  mainImage: string;
  distanceKm: number | null;
  raw: ServicioListItem;
}

function servicioToFeedJob(item: ServicioListItem): FeedJob {
  return {
    id: String(item.id_servicio),
    titulo: item.titulo,
    categoria_nombre: item.categoria_nombre,
    precio_inicial: Number(item.precio_inicial),
    postedAgo: timeAgo(item.fecha),
    location: "",
    mainImage: item.imagenes[0] ?? "",
    distanceKm: null,
    raw: item,
  };
}

const APPLIED_JOBS: AppliedJob[] = [
  {
    id: "a1",
    title: "High-Security Lock Install",
    status: "reviewing",
    sentAgo: "2 hours ago",
    price: "$350.00",
  },
  {
    id: "a2",
    title: "Office Complex Rekey",
    status: "completed",
    sentAgo: "yesterday",
    price: "$1200.00",
  },
  {
    id: "a3",
    title: "Garage Door Fix",
    status: "declined",
    sentAgo: "3 days ago",
    price: "$180.00",
  },
];

const JobCard = ({
  job,
  addToast,
}: {
  job: FeedJob;
  addToast: (type: "success" | "error" | "info", message: string) => void;
}) => {
  const [hovered, setHovered] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const { t } = useI18n();
  const d = t("jobfeedscreen");

  const handleViewDetails = async () => {
    setIsLoadingDetails(true);
    try {
      const details = await fetchPostDetails(job.id);
      const location = await getApproxLocation(details.latitud, details.longitud);
      setJobDetails(mapPostDetailsToJobDetails(details, location));
      setIsDetailsOpen(true);
    } catch (error) {
      console.error("fetchPostDetails failed:", error);
      addToast(
        "error",
        error instanceof ApiError ? error.message : d.errors.detailsFailed,
      );
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleApplySubmit = (_data: ApplyJobData) => {
    setIsApplyOpen(false);
    addToast("info", d.actionUnavailable);
  };

  return (
    <>
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
            <MapPin size={24} color="var(--text-secondary)" />
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
                padding: "4px 10px",
                borderRadius: 20,
                background: "rgba(46,188,204,0.12)",
                color: "#2EBCCC",
                fontWeight: 600,
              }}
            >
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
          onClick={handleViewDetails}
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

    <JobDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        job={jobDetails}
        onApply={() => {
          setIsDetailsOpen(false);
          setIsApplyOpen(true);
        }}
      />

      <ApplyJobModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        jobTitle={job.titulo}
        clientPrice={job.precio_inicial}
        onSubmit={handleApplySubmit}
      />
    </>
  );
};

const AppliedJobItem = ({ job }: { job: AppliedJob }) => {
  const { t } = useI18n();
  const d = t("jobfeedscreen");

  const statusMap = {
    reviewing: {
      label: d.statuses.reviewing,
      bg: "rgba(255,178,0,0.15)",
      color: "#FFB200",
    },
    completed: {
      label: d.statuses.completed,
      bg: "rgba(74,168,37,0.15)",
      color: "#4AA825",
    },
    declined: {
      label: d.statuses.declined,
      bg: "rgba(152,152,152,0.15)",
      color: "#989898",
    },
    closed: {
      label: d.statuses.closed,
      bg: "rgba(152,152,152,0.15)",
      color: "#989898",
    },
  };
  const s = statusMap[job.status];

  return (
    <div
      style={{
        padding: "14px 0",
        borderBottom: "1px solid var(--divider)",
      }}
    >
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
            fontSize: "0.88rem",
            fontWeight: 700,
            color: "var(--text)",
            flex: 1,
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
            fontSize: "0.68rem",
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {s.label}
        </span>
      </div>
      <p
        style={{
          margin: "0 0 6px",
          fontSize: "0.78rem",
          color: "var(--text-secondary)",
        }}
      >
        {d.card.posted} {job.sentAgo}
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
          {job.price}
        </span>
        <button
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
  );
};

const JobFeedScreen: React.FC = () => {
  const { isDark } = useThemeMode();
  const { t } = useI18n();
  const d = t("jobfeedscreen");
  const navigate = useNavigate();

  const { toasts, addToast, removeToast } = useToast();

  const [filters, setFilters] = useState<JobFilters>({
    category: "",
    distance: "",
    priceRange: "",
  });

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [providerCoords, setProviderCoords] = useState<ApproxCoords | null>(
    null,
  );
  const [jobs, setJobs] = useState<FeedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Ubicación del proveedor, en segundo plano y sin bloquear el feed, solo
  // para calcular distancias reales — nunca se muestra ni se guarda.
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
        /* sin permiso: el feed sigue funcionando, solo sin distancia */
      },
      { timeout: 8000, enableHighAccuracy: false },
    );
  }, []);

  useEffect(() => {
    fetchCategorias()
      .then(setCategorias)
      .catch((error) => console.error("fetchCategorias failed:", error));
  }, []);

  useEffect(() => {
    const categoriaId = filters.category ? Number(filters.category) : undefined;
    let cancelled = false;

    fetchServiciosCatalog({ categoriaId, estado: "abierto" })
      .then(async (items) => {
        if (cancelled) return;
        const feedJobs = items.map(servicioToFeedJob);
        const locations = await Promise.all(
          items.map((item) => getApproxLocation(item.latitud, item.longitud)),
        );
        if (cancelled) return;
        setJobs(
          feedJobs.map((job, i) => ({
            ...job,
            location: locations[i],
            distanceKm: providerCoords
              ? distanceKm(providerCoords, {
                  lat: Number(items[i].latitud),
                  lon: Number(items[i].longitud),
                })
              : null,
          })),
        );
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("fetchServiciosCatalog failed:", error);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category, providerCoords]);

  const categoryOptions: FilterOption[] = [
    { value: "", label: d.filters.allCategories },
    ...categorias.map((c) => ({
      value: String(c.id_categoria),
      label: c.nombre,
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
  };

  const visibleJobs = useMemo(() => {
    return jobs.filter((job) => {
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
  }, [jobs, filters.distance, filters.priceRange]);

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
                background: "rgba(74,168,37,0.15)",
                color: "#4AA825",
                fontWeight: 700,
                fontSize: "0.78rem",
              }}
            >
              {d.availableForWork}
            </span>
          </div>
        </div>

        <div
          className="jf-content"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 28,
            background: "var(--main-bg)",
          }}
        >
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
                    title={d.empty}
                    subtitle={d.emptySubtitle}
                  />
                </div>
              ) : (
                visibleJobs.map((job) => (
                  <JobCard key={job.id} job={job} addToast={addToast} />
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
                  $840.50
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
                      $120.00
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
                      $960.00
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
                {APPLIED_JOBS.length === 0 ? (
                  <EmptyState
                    icon={<Send size={20} color="#2EBCCC" />}
                    isDark={isDark}
                    title={d.noAppliedJobs}
                    size="compact"
                  />
                ) : (
                  APPLIED_JOBS.map((job) => (
                    <AppliedJobItem key={job.id} job={job} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        toasts={toasts}
        onRemove={removeToast}
        theme={isDark ? "dark" : "light"}
      />
    </>
  );
};

export default JobFeedScreen;
