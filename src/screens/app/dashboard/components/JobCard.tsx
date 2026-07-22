import { useState } from "react";
import { Briefcase, MapPin, Clock, Users, ArrowRight } from "lucide-react";
import type { DashboardJob } from "../../../../types/dashboard";
import { useI18n } from "../../../../i18n";

interface JobCardProps {
  job: DashboardJob;
}

export const JobCard = ({ job }: JobCardProps) => {
  const [hovered, setHovered] = useState(false);
  const { t } = useI18n();
  const d = t("dashboardscreen");

  return (
    <div
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
          {job.category}
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
        <button
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
  );
};
