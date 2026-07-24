import { Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { DashboardJob } from "../../../../types/dashboard";
import { useI18n } from "../../../../i18n";
import { ROUTES } from "../../../../router/routes";
import { JobCard } from "./JobCard";
import { SkeletonLoader } from "./SkeletonLoader";
import EmptyState from "../../../../components/emptystate/EmptyState";

interface AvailableJobsFeedProps {
  jobs: DashboardJob[] | undefined;
  isLoading: boolean;
  isDark: boolean;
}

const EmptyJobsState = ({ isDark }: { isDark: boolean }) => {
  const { t } = useI18n();
  const d = t("dashboardscreen");
  return (
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
        title={d.empty.jobs.title}
        subtitle={d.empty.jobs.description}
      />
    </div>
  );
};

export const AvailableJobsFeed = ({ jobs, isLoading, isDark }: AvailableJobsFeedProps) => {
  const { t } = useI18n();
  const d = t("dashboardscreen");
  const navigate = useNavigate();

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
          onClick={() => navigate(ROUTES.APP.JOB_FEED)}
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
            <EmptyJobsState isDark={isDark} />
          ) : (
            jobs.map((job) => <JobCard key={job.id} job={job} />)
          )}
        </div>
      </div>
    </div>
  );
};
