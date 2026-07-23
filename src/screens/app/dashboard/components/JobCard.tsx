import { useState } from "react";
import { Briefcase, MapPin, Clock, Users, ArrowRight, Eye } from "lucide-react";
import type { DashboardJob } from "../../../../types/dashboard";
import { useI18n } from "../../../../i18n";
import ApplyJobModal, {
  type ApplyJobData,
} from "../../../../components/applyjobmodal/ApplyJobModal";
import JobDetailsModal from "../../../../components/jobdetailsmodal/JobDetailsModal";

const CATEGORY_KEY: Record<string, string> = {
  Plumbing: "plumbing",
  Electrical: "electrical",
  Gardening: "gardening",
  HVAC: "hvac",
};

interface JobCardProps {
  job: DashboardJob;
}

export const JobCard = ({ job }: JobCardProps) => {
  const [hovered, setHovered] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { t } = useI18n();
  const d = t("dashboardscreen");

  const jobDetails = job;

  const handleApplySubmit = (data: ApplyJobData) => {
    // TODO: replace with API call to submit proposal
    console.log("Submit proposal:", { jobId: job.id, ...data });
    setIsApplyOpen(false);
  };

  return (
    <>
      <div
        className="ds-job-card"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: "var(--card-bg)",
          borderRadius: 14,
          border: "1px solid var(--divider)",
          borderLeft: "4px solid #2EBCCC",
          padding: "16px 20px",
          transition: "box-shadow 0.2s, transform 0.2s",
          boxShadow: hovered
            ? "0 6px 24px rgba(0,0,0,0.12)"
            : "0 1px 4px rgba(0,0,0,0.04)",
          transform: hovered ? "translateY(-1px)" : "none",
          cursor: "default",
        }}
      >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: "rgba(46,188,204,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Briefcase size={20} color="#2EBCCC" />
          </div>
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: "0.95rem",
                color: "var(--text)",
                marginBottom: 2,
              }}
            >
              {job.title}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: "0.78rem",
                color: "var(--text-secondary)",
                flexWrap: "wrap",
              }}
            >
              <MapPin size={11} />
              {job.location}
              <span style={{ opacity: 0.4 }}>•</span>
              <Clock size={11} />
              {job.postedAgo}
              <span style={{ opacity: 0.4 }}>•</span>
              <span style={{ fontWeight: 600, color: "#2EBCCC" }}>
                {job.budget}
              </span>
            </div>
          </div>
        </div>
        <span
          style={{
            padding: "4px 12px",
            borderRadius: 20,
            fontSize: "0.75rem",
            fontWeight: 600,
            background: "rgba(46,188,204,0.15)",
            color: "#2EBCCC",
            whiteSpace: "nowrap",
          }}
        >
          {d.categories[CATEGORY_KEY[job.category] as keyof typeof d.categories] ?? job.category}
        </span>
      </div>

      <p
        style={{
          fontSize: "0.84rem",
          color: "var(--text-secondary)",
          margin: "12px 0",
          lineHeight: 1.55,
        }}
      >
        {job.description}
      </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
            }}
          >
            <Users size={14} />
            <span>
              {job.proposalCount} {d.jobCard.proposals}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setIsDetailsOpen(true)}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-secondary)",
                fontWeight: 600,
                fontSize: "0.8rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "6px 10px",
                borderRadius: 8,
                fontFamily: "inherit",
                transition: "background 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(46,188,204,0.10)";
                e.currentTarget.style.color = "#2EBCCC";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "none";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              <Eye size={14} />
              {d.jobCard.viewDetails}
            </button>
            <button
              onClick={() => setIsApplyOpen(true)}
              style={{
                background: "#2EBCCC",
                border: "none",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.84rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 10,
                fontFamily: "inherit",
                transition: "background 0.2s, box-shadow 0.2s",
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
              {d.jobCard.apply}
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <ApplyJobModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        jobTitle={job.title}
        clientPrice={job.price}
        onSubmit={handleApplySubmit}
      />

      <JobDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        job={jobDetails}
        onApply={() => {
          setIsDetailsOpen(false);
          setIsApplyOpen(true);
        }}
      />
    </>
  );
};
