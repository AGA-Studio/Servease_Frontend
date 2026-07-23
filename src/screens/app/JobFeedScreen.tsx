// Provider job feed: filter bar, job cards, earnings summary and applied jobs sidebar.

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  MapPin,
  Clock,
  ArrowRight,
  Navigation,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useThemeMode } from "../../theme/useThemeMode";
import { useI18n } from "../../i18n";
import { ROUTES } from "../../router/routes";
import type { JobDetails } from "../../types/job";
import JobDetailsModal from "../../components/jobdetailsmodal/JobDetailsModal";
import ApplyJobModal, {
  type ApplyJobData,
} from "../../components/applyjobmodal/ApplyJobModal";

interface AppliedJob {
  id: string;
  title: string;
  status: "reviewing" | "completed" | "declined" | "closed";
  sentAgo: string;
  price: string;
}

interface JobFilters {
  specialization: string;
  category: string;
  distance: string;
  priceRange: string;
}

const CATEGORIES = ["Locksmith", "Plumbing", "Electrical", "Gardening", "HVAC"];

const PRICE_RANGES = ["", "0-100", "100-300", "300-500", "500+"] as const;

const formatPriceRange = (range: string): string => {
  if (range === "500+") return "$500+";
  const [min, max] = range.split("-");
  return `$${min} - $${max}`;
};

const JOBS: JobDetails[] = [
  {
    id: "1",
    title: "Emergency Residential Lockout",
    category: "Locksmith",
    postedAgo: "10m ago",
    description:
      "Customer is locked out of their apartment on the 3rd floor. Key broke inside the lock cylinder. Requires extraction and potentially replacement.",
    priceRange: "$120 - $150",
    price: 135,
    location: "El Refugio, Tijuana",
    when: "Today",
    urgency: "ASAP",
    mainImage:
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=200&q=80",
      "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&w=200&q=80",
    ],
    client: {
      name: "Maria Cazares",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
      rating: 4.9,
      reviewCount: 12,
      memberSince: "Sep. 2025",
      jobsPosted: 8,
    },
    distance: "2.5km",
    proposalCount: 5,
  },
  {
    id: "2",
    title: "High-Security Lock Install",
    category: "Locksmith",
    postedAgo: "1h ago",
    description:
      "Need to install a high-security deadbolt on the front door of a commercial office. The lock must be ANSI Grade 1 and include key control.",
    priceRange: "$350 - $500",
    price: 425,
    location: "Centro, Tijuana",
    when: "Tomorrow",
    urgency: "Flexible",
    mainImage:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=200&q=80",
    ],
    client: {
      name: "Carlos Mendoza",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
      rating: 4.7,
      reviewCount: 8,
      memberSince: "Jan. 2025",
      jobsPosted: 4,
    },
    distance: "4.2km",
    proposalCount: 3,
  },
];

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

interface FilterOption {
  value: string;
  label: string;
}

const FilterSelect = ({
  label,
  value,
  options,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  options: FilterOption[];
  placeholder: string;
  onChange: (value: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isDark } = useThemeMode();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? placeholder;

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        position: "relative",
      }}
    >
      <span
        style={{
          fontSize: "0.7rem",
          fontWeight: 700,
          color: "var(--text-secondary)",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </span>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid var(--divider)",
          background: "var(--card-bg)",
          color: "var(--text)",
          fontSize: "0.85rem",
          fontWeight: 500,
          cursor: "pointer",
          fontFamily: "inherit",
          minWidth: 140,
        }}
      >
        {selectedLabel}
        <ChevronDown
          size={14}
          color="var(--text-secondary)"
          style={{
            transform: isOpen ? "rotate(180deg)" : undefined,
            transition: "transform 0.2s",
          }}
        />
      </button>
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 10,
            background: "var(--card-bg)",
            border: "1px solid var(--divider)",
            borderRadius: 10,
            boxShadow: isDark
              ? "0 8px 24px rgba(0,0,0,0.4)"
              : "0 8px 24px rgba(0,0,0,0.1)",
            maxHeight: 240,
            overflowY: "auto",
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "10px 14px",
                border: "none",
                background: option.value === value ? "rgba(46,188,204,0.12)" : "transparent",
                color: option.value === value ? "#2EBCCC" : "var(--text)",
                fontSize: "0.85rem",
                fontWeight: option.value === value ? 700 : 500,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background =
                  option.value === value
                    ? "rgba(46,188,204,0.16)"
                    : "rgba(46,188,204,0.08)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background =
                  option.value === value
                    ? "rgba(46,188,204,0.12)"
                    : "transparent")
              }
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const JobCard = ({ job }: { job: JobDetails }) => {
  const [hovered, setHovered] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const { t } = useI18n();
  const d = t("jobfeedscreen");

  const CATEGORY_KEY: Record<string, string> = {
    Locksmith: "locksmith",
    Plumbing: "plumbing",
    Electrical: "electrical",
    Gardening: "gardening",
    HVAC: "hvac",
  };

  const handleApplySubmit = (data: ApplyJobData) => {
    // TODO: replace with API call to submit proposal
    console.log("Submit proposal:", { jobId: job.id, ...data });
    setIsApplyOpen(false);
  };

  return (
    <>
      <div
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
        <img
          src={job.mainImage}
          alt={job.title}
          style={{
            width: 140,
            height: 100,
            objectFit: "cover",
            borderRadius: 12,
          }}
        />
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
          {job.distance}
        </div>
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
              {d.categories[CATEGORY_KEY[job.category] as keyof typeof d.categories] ?? job.category}
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
            {job.priceRange}
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
          {job.title}
        </h3>

        <p
          style={{
            margin: 0,
            fontSize: "0.82rem",
            color: "var(--text-secondary)",
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {job.description}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginTop: 12,
            fontSize: "0.78rem",
            color: "var(--text-secondary)",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <MapPin size={12} />
            {job.location}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Clock size={12} />
            {d.urgency[job.urgency.toLowerCase() as keyof typeof d.urgency] ?? job.urgency}
          </span>
        </div>

        <button
          onClick={() => setIsDetailsOpen(true)}
          style={{
            marginTop: 14,
            background: "#2EBCCC",
            border: "none",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.82rem",
            cursor: "pointer",
            display: "inline-flex",
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
          {d.card.viewDetails}
          <ArrowRight size={14} />
        </button>
      </div>
    </div>

    <JobDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        job={job}
        onApply={() => {
          setIsDetailsOpen(false);
          setIsApplyOpen(true);
        }}
      />

      <ApplyJobModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        jobTitle={job.title}
        clientPrice={job.price}
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

  const [filters, setFilters] = useState<JobFilters>({
    specialization: "",
    category: "",
    distance: "10",
    priceRange: "",
  });

  const specializationOptions: FilterOption[] = [
    { value: "", label: d.filters.allSpecializations },
    ...CATEGORIES.map((category) => ({
      value: category,
      label: d.categories[category.toLowerCase() as keyof typeof d.categories] ?? category,
    })),
  ];

  const categoryOptions: FilterOption[] = [
    { value: "", label: d.filters.allCategories },
    ...CATEGORIES.map((category) => ({
      value: category,
      label: d.categories[category.toLowerCase() as keyof typeof d.categories] ?? category,
    })),
  ];

  const distanceOptions: FilterOption[] = [
    { value: "5", label: `5 ${d.filters.km ?? "km"}` },
    { value: "10", label: `10 ${d.filters.km ?? "km"}` },
    { value: "25", label: `25 ${d.filters.km ?? "km"}` },
    { value: "50", label: `50 ${d.filters.km ?? "km"}` },
  ];

  const priceRangeOptions: FilterOption[] = PRICE_RANGES.map((range) => ({
    value: range,
    label: range === "" ? d.filters.anyPrice : formatPriceRange(range),
  }));

  // TODO: replace with real API call using filters as query params
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.specialization) params.set("specialization", filters.specialization);
    if (filters.category) params.set("category", filters.category);
    if (filters.distance) params.set("distance", filters.distance);
    if (filters.priceRange) params.set("priceRange", filters.priceRange);

    console.log("Fetch available jobs:", params.toString());
  }, [filters]);

  const handleFilterChange = (key: keyof JobFilters) => (value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

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
                label={d.filters.specialization}
                value={filters.specialization}
                options={specializationOptions}
                placeholder={d.filters.allSpecializations}
                onChange={handleFilterChange("specialization")}
              />
              <FilterSelect
                label={d.filters.category}
                value={filters.category}
                options={categoryOptions}
                placeholder={d.filters.allCategories}
                onChange={handleFilterChange("category")}
              />
              <FilterSelect
                label={d.filters.distance}
                value={filters.distance}
                options={distanceOptions}
                placeholder={`10 ${d.filters.km ?? "km"}`}
                onChange={handleFilterChange("distance")}
              />
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
              {JOBS.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
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
                {APPLIED_JOBS.map((job) => (
                  <AppliedJobItem key={job.id} job={job} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobFeedScreen;
