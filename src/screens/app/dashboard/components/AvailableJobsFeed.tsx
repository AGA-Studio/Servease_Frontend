import { Briefcase } from "lucide-react";
import type { DashboardJob } from "../../../../types/dashboard";
import { useI18n } from "../../../../i18n";
import { JobCard } from "./JobCard";
import { SkeletonLoader } from "./SkeletonLoader";

interface AvailableJobsFeedProps {
  jobs: DashboardJob[] | undefined;
  isLoading: boolean;
  isDark: boolean;
}

export const AvailableJobsFeed = ({ jobs, isLoading, isDark }: AvailableJobsFeedProps) => {
  const { t } = useI18n();
  const d = t("dashboardscreen");

  return (
    <div className="ds-left-col">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Briefcase size={20} color="#2EBCCC" />
          <span
            style={{
              fontWeight: 700,
              fontSize: "1rem",
              color: "var(--text)",
            }}
          >
            {d.availableJobs}
          </span>
        </div>
        <button
          style={{
            background: "none",
            border: "none",
            color: "#2EBCCC",
            fontWeight: 600,
            fontSize: "0.85rem",
            cursor: "pointer",
            fontFamily: "inherit",
            padding: "5px 10px",
            borderRadius: 8,
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(46,188,204,0.10)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "none")
          }
        >
          {d.viewAll}
        </button>
      </div>

      <div className="ds-jobs-scroll">
        <div className="ds-jobs-grid">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <SkeletonLoader key={i} isDark={isDark} variant="job-card" />
            ))
          ) : !jobs?.length ? (
            <EmptyJobsState />
          ) : (
            jobs.map((job) => <JobCard key={job.id} job={job} />)
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyJobsState = () => {
  const { t } = useI18n();
  const d = t("dashboardscreen");

  return (
    <div
      style={{
        background: "var(--card-bg)",
        borderRadius: 16,
        border: "1px solid var(--divider)",
        padding: 32,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "rgba(46,188,204,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 14px",
        }}
      >
        <Briefcase size={22} color="#2EBCCC" />
      </div>
      <div
        style={{
          fontWeight: 700,
          fontSize: "1rem",
          color: "var(--text)",
          marginBottom: 4,
        }}
      >
        {d.empty.jobs.title}
      </div>
      <div style={{ fontSize: "0.84rem", color: "var(--text-secondary)" }}>
        {d.empty.jobs.description}
      </div>
    </div>
  );
};
