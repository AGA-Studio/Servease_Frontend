import { Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import type { DashboardJob } from "../../../../types/dashboard";
import { useI18n } from "../../../../i18n";
import { ROUTES } from "../../../../router/routes";
import { JobCard } from "./JobCard";
import { SkeletonLoader } from "./SkeletonLoader";
import EmptyState from "../../../../components/emptystate/EmptyState";

const ENTRANCE_EASE = [0.23, 1, 0.32, 1] as const;

interface AvailableJobsFeedProps {
  jobs: DashboardJob[] | undefined;
  isLoading: boolean;
  isDark: boolean;
  disponible: boolean;
  onActivate: () => void;
  onViewDetails: (job: DashboardJob) => void;
  onApply: (job: DashboardJob) => void;
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

export const AvailableJobsFeed = ({ jobs, isLoading, isDark, disponible, onActivate, onViewDetails, onApply }: AvailableJobsFeedProps) => {
  const { t } = useI18n();
  const d = t("dashboardscreen");
  const p = t("profile").provider;
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
          {!disponible ? (
            <EmptyState
              icon={<Briefcase size={32} color="#2EBCCC" />}
              isDark={isDark}
              title={p.unavailableTitle}
              subtitle={p.unavailableSubtitle}
              action={{
                label: p.unavailableActivate,
                onClick: onActivate,
              }}
            />
          ) : isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <SkeletonLoader key={i} isDark={isDark} variant="job-card" />
            ))
          ) : !jobs?.length ? (
            <EmptyJobsState isDark={isDark} />
          ) : (
            jobs.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.35, delay: i * 0.06, ease: ENTRANCE_EASE }}
              >
                <JobCard
                  job={job}
                  onViewDetails={() => onViewDetails(job)}
                  onApply={() => onApply(job)}
                />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
