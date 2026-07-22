// Shared building blocks for the admin screens: page shell, KPI cards, trend badges and status chips.

import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useI18n } from "../../i18n";

export const AdminTopbar: React.FC<{
  title: string;
  subtitle: string;
  isDark: boolean;
  right?: React.ReactNode;
}> = ({ title, subtitle, isDark, right }) => (
  <div
    className="flex items-center justify-between gap-4 flex-wrap"
    style={{
      padding: "22px 28px",
      borderBottom: `1px solid ${isDark ? "#273570" : "#e5e7eb"}`,
      background: isDark ? "#1e2d5e" : "#ffffff",
    }}
  >
    <div>
      <h1
        style={{
          fontSize: "clamp(1.25rem, 3vw, 1.55rem)",
          fontWeight: 800,
          margin: 0,
          color: isDark ? "#ffffff" : "#0f172a",
        }}
      >
        {title}
      </h1>
      <p style={{ margin: 0, marginTop: 4, fontSize: "0.87rem", color: "#989898" }}>{subtitle}</p>
    </div>
    {right}
  </div>
);

export const TrendBadge: React.FC<{ value: number }> = ({ value }) => {
  const positive = value >= 0;
  const color = positive ? "#4AA825" : "#FF0000";
  return (
    <span
      className="inline-flex items-center gap-1"
      style={{
        fontSize: "0.75rem",
        fontWeight: 700,
        color,
        background: positive ? "rgba(74,168,37,0.12)" : "rgba(255,0,0,0.1)",
        padding: "3px 8px",
        borderRadius: 20,
      }}
    >
      {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
};

export const KpiCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  iconBg: string;
  trend?: number;
  isDark: boolean;
  delay?: number;
}> = ({ icon, label, value, iconBg, trend, isDark, delay = 0 }) => (
  <div
    className="admin-kpi-card"
    style={{
      background: isDark ? "#1e2d5e" : "#ffffff",
      border: `1px solid ${isDark ? "#273570" : "#e5e7eb"}`,
      borderRadius: 16,
      padding: "18px 20px",
      flex: "1 1 200px",
      animationDelay: `${delay}ms`,
    }}
  >
    <div className="flex items-center justify-between mb-3">
      <div
        className="flex items-center justify-center shrink-0"
        style={{ width: 44, height: 44, borderRadius: 12, background: iconBg }}
      >
        {icon}
      </div>
      {trend !== undefined && <TrendBadge value={trend} />}
    </div>
    <div style={{ fontSize: "1.55rem", fontWeight: 800, color: isDark ? "#fff" : "#0f172a", lineHeight: 1 }}>
      {value}
    </div>
    <div style={{ fontSize: "0.8rem", color: "#989898", marginTop: 4 }}>{label}</div>
  </div>
);

export const ChartCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  isDark: boolean;
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ title, icon, isDark, children, delay = 0, style }) => (
  <div
    className="admin-fade-card"
    style={{
      background: isDark ? "#1e2d5e" : "#ffffff",
      border: `1px solid ${isDark ? "#273570" : "#e5e7eb"}`,
      borderRadius: 16,
      padding: "20px 22px",
      animationDelay: `${delay}ms`,
      ...style,
    }}
  >
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <span style={{ fontWeight: 700, fontSize: "0.95rem", color: isDark ? "#fff" : "#0f172a" }}>{title}</span>
    </div>
    {children}
  </div>
);

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  active: { bg: "rgba(74,168,37,0.12)", color: "#4AA825" },
  suspended: { bg: "rgba(255,0,0,0.1)", color: "#FF0000" },
  pending: { bg: "rgba(255,178,0,0.14)", color: "#FFB200" },
  closed: { bg: "rgba(152,152,152,0.16)", color: "#6b7280" },
  flagged: { bg: "rgba(255,0,0,0.1)", color: "#FF0000" },
  info: { bg: "rgba(46,188,204,0.12)", color: "#2EBCCC" },
  warning: { bg: "rgba(255,178,0,0.14)", color: "#FFB200" },
  error: { bg: "rgba(255,0,0,0.1)", color: "#FF0000" },
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const { t } = useI18n();
  const labels = t("admin").status as Record<string, string>;
  const s = STATUS_STYLES[status] ?? { bg: "rgba(152,152,152,0.16)", color: "#6b7280" };
  const label = labels[status] ?? status;
  return (
    <span
      style={{
        fontSize: "0.72rem",
        fontWeight: 700,
        color: s.color,
        background: s.bg,
        padding: "4px 10px",
        borderRadius: 20,
        whiteSpace: "nowrap",
        textTransform: "capitalize" as const,
      }}
    >
      {label}
    </span>
  );
};

export const adminAnimationStyles = `
  @keyframes adminFadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .admin-kpi-card, .admin-fade-card, .admin-row {
    animation: adminFadeUp 0.4s cubic-bezier(0.23,1,0.32,1) both;
  }
  .admin-kpi-card:hover, .admin-fade-card:hover {
    box-shadow: 0 8px 28px rgba(0,0,0,0.08);
    transform: translateY(-1px);
    transition: box-shadow 0.25s ease, transform 0.25s ease;
  }
`;
