import { useState } from "react";
import { Briefcase, CheckCircle, DollarSign, Star } from "lucide-react";
import type { KpiData, KpiPeriodKey } from "../../../../types/dashboard";
import { useI18n } from "../../../../i18n";
import { useCurrency } from "../../../../context/CurrencyContext";

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
  const [activePeriod, setActivePeriod] = useState<KpiPeriodKey>("total");
  const Icon = ICONS[data.iconName];
  const { t } = useI18n();
  const { formatMoney } = useCurrency();
  const d = t("dashboardscreen");

  const activeOption =
    data.periodOptions?.find((o) => o.key === activePeriod) ?? null;

  const rawValue =
    activeOption?.value ??
    (typeof data.value === "number" ? data.value : Number(data.value));

  const formattedValue =
    data.key === "earnings" ? formatMoney(rawValue) : data.value;

  const periodLabel = (key: KpiPeriodKey): string => {
    const i18nLabel =
      d.kpis.earningsPeriods?.[key as keyof typeof d.kpis.earningsPeriods];
    const option = data.periodOptions?.find((o) => o.key === key);
    return i18nLabel ?? option?.label ?? key;
  };

  const kpiLabelEntry = d.kpis[data.key as keyof typeof d.kpis];
  const kpiLabel =
    typeof kpiLabelEntry === "string" ? kpiLabelEntry : data.label;

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
          {kpiLabel}
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
            {formattedValue}
          </div>
        </div>
        {data.periodOptions && data.periodOptions.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 4,
              marginTop: 10,
              background: isDark ? "rgba(0,0,0,0.25)" : "var(--input-bg)",
              borderRadius: 8,
              padding: 3,
              width: "fit-content",
            }}
          >
            {data.periodOptions.map((option) => {
              const isActive = option.key === activePeriod;
              return (
                <button
                  key={option.key}
                  onClick={() => setActivePeriod(option.key)}
                  style={{
                    border: "none",
                    background: isActive
                      ? isDark ? "#2EBCCC" : "#2EBCCC"
                      : "transparent",
                    color: isActive ? "#ffffff" : "var(--text-secondary)",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "background 0.2s, color 0.2s",
                  }}
                >
                  {periodLabel(option.key)}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
