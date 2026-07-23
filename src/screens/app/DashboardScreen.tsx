import { useState, useEffect } from "react";
import type { ThemeMode } from "../../theme/theme";
import { useI18n } from "../../i18n";
import { useDashboardData } from "./dashboard/hooks/useDashboardData";
import { DashboardTopBar } from "./dashboard/components/DashboardTopBar";
import { KpiRow } from "./dashboard/components/KpiRow";
import { EarningsChart } from "./dashboard/components/EarningsChart";
import { JobsByCategoryChart } from "./dashboard/components/JobsByCategoryChart";
import { AvailableJobsFeed } from "./dashboard/components/AvailableJobsFeed";
import { RecentActivity } from "./dashboard/components/RecentActivity";
import { SkeletonLoader } from "./dashboard/components/SkeletonLoader";

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
  const { data, status, error, refresh } = useDashboardData();
  const isLoading = status === "loading" || status === "idle";

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
                  isLoading={isLoading}
                  isDark={isDark}
                />
                <RecentActivity
                  activities={data?.recentActivity}
                  isLoading={isLoading}
                  isDark={isDark}
                />
              </div>
            </>
          )}
        </div>
      </div>
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
