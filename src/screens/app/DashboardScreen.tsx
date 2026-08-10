import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { ThemeMode } from "../../theme/theme";
import { ROUTES } from "../../router/routes";
import { useI18n } from "../../i18n";
import { useAuth } from "../../context/AuthContext";
import { useAvailability } from "../../context/AvailabilityContext";
import { useWorkAreas } from "../../context/WorkAreasContext";
import { useToast } from "../../components/Toast/useToast";
import ToastContainer from "../../components/Toast/ToastContainer";
import { useDashboardData } from "./dashboard/hooks/useDashboardData";
import { DashboardTopBar } from "./dashboard/components/DashboardTopBar";
import { KpiRow } from "./dashboard/components/KpiRow";
import { EarningsChart } from "./dashboard/components/EarningsChart";
import { JobsByCategoryChart } from "./dashboard/components/JobsByCategoryChart";
import { AvailableJobsFeed } from "./dashboard/components/AvailableJobsFeed";
import { RecentActivity } from "./dashboard/components/RecentActivity";
import { SkeletonLoader } from "./dashboard/components/SkeletonLoader";
import JobDetailsModal from "../../components/jobdetailsmodal/JobDetailsModal";
import ApplyJobModal from "../../components/applyjobmodal/ApplyJobModal";
import type { DashboardJob } from "../../types/dashboard";
import type { JobDetails } from "../../types/job";
import type { ApplyJobData } from "../../components/applyjobmodal/ApplyJobModal";
import { getApproxLocation } from "../../utils/location";
import { postularServicio } from "../../api/servicioApi";
import { ApiError } from "../../api/apiClient";

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

const DashboardScreen: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { areas } = useWorkAreas();
  const areaNames = useMemo(
    () => areas.map((a) => a.nombre),
    [areas],
  );
  const { data, status, error, refresh, isLive } = useDashboardData(
    user?.id,
    areaNames.length > 0 ? areaNames : undefined,
  );
  const { disponible, setDisponible } = useAvailability();
  const { toasts, addToast, removeToast } = useToast();
  const { t } = useI18n();
  const d = t("dashboardscreen");
  const p = t("profile").provider;
  const isLoading = status === "loading" || status === "idle";

  const handleActivate = () => {
    setDisponible(true).catch(() =>
      addToast("error", p.availabilityUpdateFailed),
    );
  };

  const [selectedJob, setSelectedJob] = useState<DashboardJob | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const handleViewDetails = async (job: DashboardJob) => {
    setSelectedJob(job);
    setIsDetailsOpen(true);

    if (job.latitud !== undefined && job.longitud !== undefined) {
      try {
        const location = await getApproxLocation(job.latitud, job.longitud);
        setSelectedJob((prev) =>
          prev && prev.id === job.id ? { ...prev, location } : prev,
        );
      } catch {
        // ignore
      }
    }
  };

  const handleApply = (job: DashboardJob) => {
    setSelectedJob(job);
    setIsApplyOpen(true);
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
    } catch (err) {
      addToast(
        "error",
        err instanceof ApiError ? err.message : d.applyFailed,
      );
    } finally {
      setIsApplying(false);
    }
  };

  const selectedJobDetails: JobDetails | null = useMemo(
    () =>
      selectedJob
        ? {
            id: selectedJob.id,
            title: selectedJob.title,
            category: selectedJob.category,
            location: selectedJob.location,
            latitud:
              selectedJob.latitud !== undefined
                ? Number(selectedJob.latitud)
                : null,
            longitud:
              selectedJob.longitud !== undefined
                ? Number(selectedJob.longitud)
                : null,
            when: selectedJob.when,
            urgency: selectedJob.urgency,
            postedAgo: selectedJob.postedAgo,
            price: selectedJob.price,
            currency: selectedJob.currency,
            priceRange: selectedJob.priceRange,
            description: selectedJob.description,
            mainImage: selectedJob.mainImage,
            thumbnails: selectedJob.thumbnails,
            client: selectedJob.client,
            proposalCount: selectedJob.proposalCount,
          }
        : null,
    [selectedJob],
  );

  return (
    <>
      <style>{`
        .ds-root {
          --card-bg: ${isDark ? "#1e2d5e" : "#ffffff"};
          --input-bg: ${isDark ? "#273570" : "#F8FAFC"};
          --text: ${isDark ? "#ffffff" : "#000000"};
          --text-secondary: #989898;
          --divider: ${isDark ? "#273570" : "#e5e7eb"};
        }
        .ds-jobs-grid {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .ds-main-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
          align-items: start;
        }
        .ds-charts-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }
        .ds-kpi-row {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        .ds-left-col {
          display: flex;
          flex-direction: column;
          min-height: 0;
        }
        .ds-jobs-scroll {
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: ${isDark ? "#2EBCCC40 #273570" : "#2EBCCC40 #e5e7eb"};
        }
        .ds-jobs-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .ds-jobs-scroll::-webkit-scrollbar-track {
          background: ${isDark ? "#273570" : "#e5e7eb"};
          border-radius: 99px;
        }
        .ds-jobs-scroll::-webkit-scrollbar-thumb {
          background: ${isDark ? "#2EBCCC60" : "#2EBCCC80"};
          border-radius: 99px;
        }
        .ds-jobs-scroll::-webkit-scrollbar-thumb:hover {
          background: #2EBCCC;
        }
        @media (min-width: 601px) {
          .ds-root {
            height: 100vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
          }
          .ds-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 0;
          }
          .ds-main-grid {
            flex: 1;
            min-height: 0;
            align-items: stretch;
            grid-template-rows: 1fr;
          }
          .ds-left-col {
            display: flex;
            flex-direction: column;
            min-height: 0;
            overflow: hidden;
          }
          .ds-jobs-scroll {
            flex: 1;
            min-height: 0;
            overflow-y: auto;
          }
        }
        @media (max-width: 1100px) {
          .ds-charts-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 900px) {
          .ds-main-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 600px) {
          .ds-root,
          .ds-content,
          .ds-main-grid,
          .ds-left-col {
            max-width: 100vw;
            overflow-x: hidden;
          }
          .ds-topbar {
            padding: 14px 16px !important;
          }
          .ds-content {
            padding: 16px !important;
            overflow-y: auto !important;
            box-sizing: border-box;
          }
          .ds-kpi-row {
            gap: 10px;
          }
          .ds-charts-grid {
            gap: 16px;
            margin-bottom: 16px;
          }
          .ds-main-grid {
            gap: 16px;
          }
          .ds-jobs-scroll {
            overflow-x: auto;
            overflow-y: visible;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            margin: 0 -16px;
            padding: 4px 16px 10px;
            scrollbar-width: none;
          }
          .ds-jobs-scroll::-webkit-scrollbar {
            display: none;
          }
          .ds-jobs-grid {
            display: flex;
            flex-direction: row;
            gap: 12px;
          }
          .ds-job-card {
            scroll-snap-align: start;
            flex: 0 0 88%;
            min-width: 88%;
            box-sizing: border-box;
          }
          .ds-recent-activity-card {
            padding: 14px !important;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
          }
          .ds-recent-activity-card .ds-activity-row {
            padding-bottom: 12px !important;
            gap: 10px !important;
          }
          .ds-recent-activity-card .load-btn {
            margin-top: 12px !important;
            padding: 8px !important;
            font-size: 0.76rem !important;
          }
        }
        .load-btn:hover {
          background: rgba(46,188,204,0.08) !important;
          color: #2EBCCC !important;
        }
      `}</style>

      <div className="ds-root page-enter">
        <DashboardTopBar isDark={isDark} onRefresh={refresh} />

        <div
          className="ds-content"
          style={{
            padding: 28,
            flex: 1,
            background: "var(--main-bg)",
            overflowY: "auto",
          }}
        >
          {error ? (
            <ErrorState message={error} onRetry={refresh} />
          ) : (
            <>
              <KpiRow
                kpis={data?.kpis}
                isDark={isDark}
                isLoading={isLoading}
              />

              <div className="ds-charts-grid">
                {isLoading ? (
                  <>
                    <SkeletonLoader isDark={isDark} variant="chart" />
                    <SkeletonLoader isDark={isDark} variant="chart" />
                  </>
                ) : (
                  <>
                    <EarningsChart
                      data={data?.earnings}
                      isDark={isDark}
                    />
                    <JobsByCategoryChart
                      data={data?.jobsByCategory}
                      isDark={isDark}
                    />
                  </>
                )}
              </div>

              <div className="ds-main-grid">
                <AvailableJobsFeed
                  jobs={data?.availableJobs}
                  isLoading={isLoading || !isLive}
                  isDark={isDark}
                  disponible={disponible}
                  onActivate={handleActivate}
                  onViewDetails={handleViewDetails}
                  onApply={handleApply}
                />
                <RecentActivity
                  activities={data?.recentActivity}
                  isLoading={isLoading}
                  isDark={isDark}
                  onLoadOlder={() => navigate(ROUTES.APP.NOTIFICATIONS)}
                />
              </div>
            </>
          )}
        </div>
      </div>

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
        key={selectedJob?.id ?? "none"}
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        jobTitle={selectedJob?.title ?? ""}
        clientPrice={selectedJob?.price ?? 0}
        jobCurrency={selectedJob?.currency ?? null}
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

const ErrorState = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => {
  const { t } = useI18n();
  const d = t("dashboardscreen");

  return (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      minHeight: 300,
      textAlign: "center",
      padding: 24,
    }}
  >
    <div
      style={{
        fontSize: "1.1rem",
        fontWeight: 700,
        color: "var(--text)",
        marginBottom: 8,
      }}
    >
      {d.error.title}
    </div>
    <div
      style={{
        fontSize: "0.84rem",
        color: "var(--text-secondary)",
        marginBottom: 20,
      }}
    >
      {message}
    </div>
    <button
      onClick={onRetry}
      style={{
        background: "#2EBCCC",
        border: "none",
        color: "#fff",
        fontWeight: 700,
        fontSize: "0.84rem",
        cursor: "pointer",
        padding: "10px 20px",
        borderRadius: 10,
        fontFamily: "inherit",
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#239aaa")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "#2EBCCC")}
    >
      {d.error.retry}
    </button>
  </div>
  );
};

export default DashboardScreen;
