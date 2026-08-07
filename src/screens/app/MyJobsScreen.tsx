

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
import type { JobDetails } from "../../types/job";
import JobDetailsModal from "../../components/jobdetailsmodal/JobDetailsModal";
import EmptyState from "../../components/emptystate/EmptyState";
import RatingModal, { type RatingData } from "../../components/ratingmodal/RatingModal";
import CompleteServiceModal from "../../components/completeservicemodal/CompleteServiceModal";
import PaymentWaitingModal, {
  type PaymentWaitStatus,
} from "../../components/completeservicemodal/PaymentWaitingModal";
import { timeAgo, mapPostDetailsToJobDetails } from "../../utils/servicio";
import { getApproxLocation } from "../../utils/location";
import { friendlyErrorMessage } from "../../utils/apiError";
import { useRealtimeChannel } from "../../hooks/useRealtimeChannel";
import {
  cancelarPago,
  cancelPostulacion,
  completarServicio,
  fetchPagoEnCursoProveedor,
  fetchPagoEstado,
  fetchPostDetails,
  iniciarPago,
  type PagoEstado,
} from "../../api/servicioApi";
import { fetchTrabajosAplicados, type TrabajoAplicado } from "../../api/userApi";

type ProposalStatus =
  | "accepted"
  | "pending"
  | "rejected"
  | "counteroffer"
  | "completed";
type PaymentMethod = "efectivo" | "tarjeta";

interface DisplayJob {
  id: string;
  idServicio: number;
  idPostulacion: number;
  title: string;
  category: string;
  proposalStatus: ProposalStatus;
  postedAgo: string;
  budget: number;
  currency: string;
  imageUrl?: string;
}

function mapTrabajoAplicadoToDisplay(job: TrabajoAplicado): DisplayJob {
  const estado = job.estado.trim().toLowerCase();
  const proposalStatus: ProposalStatus =
    estado === "aceptado" || estado === "aceptada"
      ? "accepted"
      : estado === "rechazada" || estado === "rechazado"
        ? "rejected"
        : estado === "contraoferta"
          ? "counteroffer"
          : estado === "completado"
            ? "completed"
            : "pending";

  return {
    id: String(job.id_postulacion),
    idServicio: job.id_servicio,
    idPostulacion: job.id_postulacion,
    title: job.titulo,
    category: job.categoria,
    proposalStatus,
    postedAgo: timeAgo(job.fecha_publicacion),
    budget: Number(job.precio_final),
    currency: "MXN",
    imageUrl: job.foto ?? undefined,
  };
}


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

const PAGE_SIZE = 8;
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

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
      rejected: {
        label: d.proposalStatuses.rejected,
        bg: isDark ? "rgba(239,68,68,0.18)" : "rgba(239,68,68,0.12)",
        color: "#EF4444",
      },
      counteroffer: {
        label: d.proposalStatuses.counteroffer,
        bg: isDark ? "rgba(168,85,247,0.18)" : "rgba(168,85,247,0.12)",
        color: "#A855F7",
      },
      completed: {
        label: d.proposalStatuses.completed,
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
  isLoadingDetails,
  onViewDetails,
  onMarkCompleted,
}: {
  job: DisplayJob;
  index: number;
  isDark: boolean;
  isLoadingDetails: boolean;
  onViewDetails: (job: DisplayJob) => void;
  onMarkCompleted: (job: DisplayJob) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { t } = useI18n();
  const d = t("myjobsscreen");

  const categoryLabel = job.category;

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

        <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onViewDetails(job)}
            disabled={isLoadingDetails}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 10,
              border: `1.5px solid ${isDark ? "#273570" : "#e5e7eb"}`,
              background: "transparent",
              color: "var(--text)",
              fontWeight: 700,
              fontSize: "0.875rem",
              cursor: isLoadingDetails ? "default" : "pointer",
              opacity: isLoadingDetails ? 0.6 : 1,
              fontFamily: "inherit",
              letterSpacing: "0.01em",
              transition: "border-color 160ms ease-out, color 160ms ease-out",
            }}
            onHoverStart={(e) => {
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
            {d.actions.viewDetails}
            {isLoadingDetails && (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                style={{
                  width: 13,
                  height: 13,
                  marginLeft: 6,
                  borderRadius: "50%",
                  border: "2px solid currentColor",
                  borderTopColor: "transparent",
                  display: "inline-block",
                  verticalAlign: "middle",
                }}
              />
            )}
          </motion.button>

          {job.proposalStatus === "accepted" && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onMarkCompleted(job)}
              style={{
                flex: 1,
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
              }}
              onHoverStart={(e) => {
                (e.target as HTMLButtonElement).style.background = "#239aaa";
              }}
              onHoverEnd={(e) => {
                (e.target as HTMLButtonElement).style.background = "#2EBCCC";
              }}
            >
              {d.actions.markCompleted}
            </motion.button>
          )}
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

  const [selectedJob, setSelectedJob] = useState<DisplayJob | null>(null);
  const [selectedJobDetails, setSelectedJobDetails] = useState<JobDetails | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState<DisplayJob[]>([]);

  // "Marcar completado" flow: complete-service modal -> (cash: drag confirm | card: Stripe via realtime) -> rating modal.
  const [completingJob, setCompletingJob] = useState<DisplayJob | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isStartingCardPayment, setIsStartingCardPayment] = useState(false);
  const [clientInfo, setClientInfo] = useState<{ name: string; avatarUrl?: string } | null>(null);

  const [paymentWait, setPaymentWait] = useState<{
    job: DisplayJob;
    idTransaccion: number;
    status: PaymentWaitStatus;
  } | null>(null);
  const [isRetryingPayment, setIsRetryingPayment] = useState(false);
  const [isCancellingPayment, setIsCancellingPayment] = useState(false);

  const [ratingJob, setRatingJob] = useState<DisplayJob | null>(null);
  const [ratingMethod, setRatingMethod] = useState<PaymentMethod>("efectivo");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchTrabajosAplicados()
      .then((data) => {
        if (cancelled) return;
        setJobs(data.map(mapTrabajoAplicadoToDisplay));
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("fetchTrabajosAplicados failed:", error);
        addToast("error", friendlyErrorMessage(error, d.errors.fetchFailed));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Provider waiting for the client to confirm a card payment (realtime-driven).
  useRealtimeChannel<{ estado: string }>({
    table: "transaccion",
    event: "UPDATE",
    filter: paymentWait ? `id_transaccion=eq.${paymentWait.idTransaccion}` : undefined,
    enabled: !!paymentWait && paymentWait.status === "waiting",
    onChange: (payload) => {
      const nuevoEstado = (payload.new as { estado?: string }).estado;
      // A decline ("rechazada") isn't terminal — the client can keep
      // retrying with another card on the same intent, so the provider just
      // keeps waiting no matter how many attempts it takes. Only a genuine
      // expiry (30 min timeout, intent actually cancelled server-side) ends
      // the wait and needs the provider to start a fresh charge.
      if (nuevoEstado === "completada") {
        setPaymentWait((prev) => (prev ? { ...prev, status: "success" } : prev));
      } else if (nuevoEstado === "expirada") {
        setPaymentWait((prev) => (prev ? { ...prev, status: "failed" } : prev));
      }
    },
  });

  // Backstop for the subscription above: browser tab backgrounding, a dropped
  // socket, or any other silent Realtime failure would otherwise strand the
  // provider on "waiting" forever with no way to notice the payment resolved.
  useEffect(() => {
    if (!paymentWait || paymentWait.status !== "waiting") return;
    const interval = setInterval(() => {
      fetchPagoEstado(paymentWait.job.idServicio)
        .then((pago) => {
          if (!pago || pago.id_transaccion !== paymentWait.idTransaccion) return;
          if (pago.estado === "completada") {
            setPaymentWait((prev) => (prev ? { ...prev, status: "success" } : prev));
          } else if (pago.estado === "expirada") {
            setPaymentWait((prev) => (prev ? { ...prev, status: "failed" } : prev));
          }
        })
        .catch((error) => {
          console.error("fetchPagoEstado poll failed:", error);
        });
    }, 4000);
    return () => clearInterval(interval);
  }, [paymentWait]);

  const filtered = jobs
    .filter((j) => {
      const matchSearch = j.title.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "all" || j.proposalStatus === statusFilter;
      const matchCategory =
        categoryFilter === "all" || j.category === categoryFilter;
      return matchSearch && matchStatus && matchCategory;
    })
    // Completed jobs sink to the bottom when viewing "all" — they're done,
    // active/pending work stays the priority at a glance.
    .sort((a, b) => {
      if (statusFilter !== "all") return 0;
      const aCompleted = a.proposalStatus === "completed" ? 1 : 0;
      const bCompleted = b.proposalStatus === "completed" ? 1 : 0;
      return aCompleted - bCompleted;
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
    async (job: DisplayJob) => {
      setSelectedJob(job);
      setSelectedJobDetails(null);
      setIsDetailsLoading(true);
      setIsDetailsOpen(true);
      try {
        const details = await fetchPostDetails(job.idServicio);
        const location = await getApproxLocation(
          details.latitud,
          details.longitud,
        );
        setSelectedJobDetails(mapPostDetailsToJobDetails(details, location));
      } catch (error) {
        console.error("fetchPostDetails failed:", error);
        addToast("error", friendlyErrorMessage(error, d.errors.detailsFailed));
        setIsDetailsOpen(false);
      } finally {
        setIsDetailsLoading(false);
      }
    },
    [addToast, d],
  );

  const handleCancelProposal = useCallback(
    async (job: DisplayJob) => {
      try {
        await cancelPostulacion(job.idPostulacion);
        setJobs((prev) => prev.filter((j) => j.id !== job.id));
        setIsDetailsOpen(false);
        addToast("success", d.actions.cancelSuccess);
      } catch (error) {
        console.error("cancelPostulacion failed:", error);
        addToast("error", friendlyErrorMessage(error, d.actions.cancelFailed));
      }
    },
    [addToast, d],
  );

  // Shared by the manual "marcar completado" recheck and the auto-resume-on-
  // mount effect below: a decline just means keep waiting (client can retry
  // the same intent), only a genuine expiry needs the provider to restart.
  const resumePaymentFlow = useCallback((job: DisplayJob, pago: PagoEstado) => {
    if (pago.estado === "completada") {
      setRatingMethod("tarjeta");
      setRatingJob(job);
      setClientInfo(null);
      fetchPostDetails(job.idServicio)
        .then((details) => {
          setClientInfo({ name: details.nombre_cliente, avatarUrl: details.url_foto_perfil ?? undefined });
        })
        .catch((error) => {
          console.error("fetchPostDetails failed:", error);
        });
    } else if (pago.estado === "expirada") {
      setPaymentWait({ job, idTransaccion: pago.id_transaccion, status: "failed" });
    } else {
      setPaymentWait({ job, idTransaccion: pago.id_transaccion, status: "waiting" });
    }
  }, []);

  // Auto-resumes an in-flight card payment on mount — if the provider closed
  // the tab or navigated away mid-wait, they land back exactly where they
  // left off (waiting, rating, or a genuine expiry) instead of a silent job
  // card with no indication anything was ever in progress.
  const hasCheckedResumeRef = useRef(false);
  useEffect(() => {
    if (hasCheckedResumeRef.current || isLoading) return;
    hasCheckedResumeRef.current = true;
    fetchPagoEnCursoProveedor()
      .then((pago) => {
        if (!pago) return;
        const job = jobs.find((j) => j.idServicio === pago.id_servicio);
        if (!job) return;
        resumePaymentFlow(job, pago);
      })
      .catch((error) => {
        console.error("fetchPagoEnCursoProveedor failed:", error);
      });
  }, [isLoading, jobs, resumePaymentFlow]);

  const handleMarkCompletedClick = useCallback(
    (job: DisplayJob) => {
      setCompletingJob(job);
      setClientInfo(null);
      fetchPostDetails(job.idServicio)
        .then((details) => {
          setClientInfo({ name: details.nombre_cliente, avatarUrl: details.url_foto_perfil ?? undefined });
        })
        .catch((error) => {
          console.error("fetchPostDetails failed:", error);
        });

      // Recovers the true payment state if a previous card attempt is already
      // resolved (or still in flight) — Realtime only catches transitions
      // live, so a reload/navigation while waiting would otherwise strand it.
      fetchPagoEstado(job.idServicio)
        .then((pago) => {
          if (!pago) {
            setIsCompleteModalOpen(true);
            return;
          }
          resumePaymentFlow(job, pago);
        })
        .catch((error) => {
          console.error("fetchPagoEstado failed:", error);
          setIsCompleteModalOpen(true);
        });
    },
    [resumePaymentFlow],
  );

  const handleConfirmCash = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    setTimeout(() => {
      setIsCompleteModalOpen(false);
      setRatingMethod("efectivo");
      setRatingJob(completingJob);
    }, 550);
  }, [completingJob]);

  const handleStartCardPayment = useCallback(async () => {
    if (!completingJob) return;
    setIsStartingCardPayment(true);
    try {
      const res = await iniciarPago(completingJob.idServicio);
      setIsCompleteModalOpen(false);
      setPaymentWait({ job: completingJob, idTransaccion: res.id_transaccion, status: "waiting" });
    } catch (error) {
      console.error("iniciarPago failed:", error);
      addToast("error", friendlyErrorMessage(error, d.actions.paymentStartFailed));
    } finally {
      setIsStartingCardPayment(false);
    }
  }, [completingJob, addToast, d]);

  const handlePaymentSuccessContinue = useCallback(() => {
    if (!paymentWait) return;
    setRatingMethod("tarjeta");
    setRatingJob(paymentWait.job);
    setPaymentWait(null);
  }, [paymentWait]);

  const handlePaymentRetry = useCallback(async () => {
    if (!paymentWait) return;
    setIsRetryingPayment(true);
    try {
      const res = await iniciarPago(paymentWait.job.idServicio);
      setPaymentWait({ job: paymentWait.job, idTransaccion: res.id_transaccion, status: "waiting" });
    } catch (error) {
      console.error("iniciarPago retry failed:", error);
      addToast("error", friendlyErrorMessage(error, d.actions.paymentStartFailed));
    } finally {
      setIsRetryingPayment(false);
    }
  }, [paymentWait, addToast, d]);

  const handlePaymentCancel = useCallback(async () => {
    if (!paymentWait) return;
    setIsCancellingPayment(true);
    try {
      await cancelarPago(paymentWait.idTransaccion);
      setPaymentWait(null);
    } catch (error) {
      console.error("cancelarPago failed:", error);
      addToast("error", friendlyErrorMessage(error, d.actions.paymentCancelFailed));
    } finally {
      setIsCancellingPayment(false);
    }
  }, [paymentWait, addToast, d]);

  const handleProviderRatingSubmit = useCallback(
    async (data: RatingData) => {
      if (!ratingJob) return;
      setIsSubmittingRating(true);
      try {
        await completarServicio(ratingJob.idServicio, {
          metodo_pago: ratingMethod,
          puntuacion: data.rating,
          comentario: data.comment,
        });
        setJobs((prev) =>
          prev.map((j) => (j.id === ratingJob.id ? { ...j, proposalStatus: "completed" as const } : j)),
        );
        addToast("success", d.actions.completeSuccess);
        setRatingJob(null);
      } catch (error) {
        console.error("completarServicio failed:", error);
        addToast("error", friendlyErrorMessage(error, d.actions.completeFailed));
        throw error;
      } finally {
        setIsSubmittingRating(false);
      }
    },
    [ratingJob, ratingMethod, addToast, d],
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
    { value: "rejected", label: d.proposalStatuses.rejected },
    { value: "counteroffer", label: d.proposalStatuses.counteroffer },
    { value: "completed", label: d.proposalStatuses.completed },
  ];

  const categoryOptions = [
    { value: "all", label: d.filters.allCategories },
    ...Array.from(new Set(jobs.map((j) => j.category))).map((c) => ({
      value: c,
      label: c,
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
                    isLoadingDetails={isDetailsLoading && selectedJob?.id === job.id}
                    onViewDetails={handleViewDetails}
                    onMarkCompleted={handleMarkCompletedClick}
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
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedJobDetails(null);
        }}
        job={selectedJobDetails}
        proposalStatus={
          selectedJob?.proposalStatus === "completed" ? undefined : selectedJob?.proposalStatus
        }
        onCancelProposal={
          selectedJob ? () => handleCancelProposal(selectedJob) : undefined
        }
      />

      {completingJob && (
        <CompleteServiceModal
          isOpen={isCompleteModalOpen}
          onClose={() => setIsCompleteModalOpen(false)}
          isDark={isDark}
          jobTitle={completingJob.title}
          amount={completingJob.budget.toLocaleString()}
          currency={completingJob.currency}
          onConfirmCash={handleConfirmCash}
          onStartCardPayment={handleStartCardPayment}
          isStartingCardPayment={isStartingCardPayment}
        />
      )}

      <PaymentWaitingModal
        isOpen={!!paymentWait}
        isDark={isDark}
        status={paymentWait?.status ?? "waiting"}
        onSuccessContinue={handlePaymentSuccessContinue}
        onRetry={handlePaymentRetry}
        onCancel={handlePaymentCancel}
        isRetrying={isRetryingPayment}
        isCancelling={isCancellingPayment}
      />

      {ratingJob && (
        <RatingModal
          isOpen={!!ratingJob}
          onClose={() => setRatingJob(null)}
          provider={{
            name: clientInfo?.name || ratingJob.title,
            avatarUrl: clientInfo?.avatarUrl,
            rating: 0,
            reviewsCount: 0,
          }}
          onSubmit={handleProviderRatingSubmit}
          isSubmitting={isSubmittingRating}
        />
      )}
    </>
  );
};

export default MyJobsScreen;
