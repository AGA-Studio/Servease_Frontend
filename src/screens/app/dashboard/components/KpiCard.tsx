import { useState } from "react";
import { Briefcase, CheckCircle, DollarSign, Star, TrendingUp, TrendingDown } from "lucide-react";
import type { KpiData } from "../../../../types/dashboard";
import { useI18n } from "../../../../i18n";

const ICONS = {
  briefcase: Briefcase,
  checkCircle: CheckCircle,
  dollarSign: DollarSign,
  star: Star,
};

interface KpiCardProps {
  data: KpiData;
  isDark?: boolean;
}

export const KpiCard = ({ data, isDark = false }: KpiCardProps) => {
  const [hovered, setHovered] = useState(false);
  const Icon = ICONS[data.iconName];
  const { t } = useI18n();
  const d = t("dashboardscreen");

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--card-bg)",
        borderRadius: 16,
        border: "1px solid var(--divider)",
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        flex: "1 1 180px",
        transition: "box-shadow 0.2s, transform 0.2s",
        boxShadow: hovered
          ? "0 6px 24px rgba(0,0,0,0.12)"
          : "0 1px 4px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-1px)" : "none",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: data.iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={22} color={data.iconColor} fill={data.iconName === "star" ? data.iconColor : "none"} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "0.78rem",
            color: "var(--text-secondary)",
            marginBottom: 4,
          }}
        >
          {d.kpis[data.key as keyof typeof d.kpis] ?? data.label}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              fontSize: "1.7rem",
              fontWeight: 800,
              color: "var(--text)",
              lineHeight: 1,
            }}
          >
            {data.value}
          </div>
          {data.trend && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                fontSize: "0.72rem",
                fontWeight: 700,
                color: data.trend.isPositive ? "#4AA825" : "#FF0000",
                background: isDark
                  ? data.trend.isPositive
                    ? "rgba(74,168,37,0.12)"
                    : "rgba(255,0,0,0.12)"
                  : data.trend.isPositive
                    ? "rgba(74,168,37,0.10)"
                    : "rgba(255,0,0,0.10)",
                padding: "3px 8px",
                borderRadius: 20,
              }}
            >
              {data.trend.isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {data.trend.value}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
