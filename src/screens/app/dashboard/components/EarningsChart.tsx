import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { EarningsPoint } from "../../../../types/dashboard";
import { useI18n } from "../../../../i18n";

interface EarningsChartProps {
  data: EarningsPoint[] | undefined;
  isDark: boolean;
}

export const EarningsChart = ({ data, isDark }: EarningsChartProps) => {
  const { t } = useI18n();
  const d = t("dashboardscreen");
  const strokeColor = "#2EBCCC";
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const textColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)";

  return (
    <div
      style={{
        background: "var(--card-bg)",
        borderRadius: 16,
        border: "1px solid var(--divider)",
        padding: 20,
        height: "100%",
        minHeight: 280,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize: "1rem",
            color: "var(--text)",
          }}
        >
          {d.charts.earnings.title}
        </span>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
          <AreaChart
            data={data}
            margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.35} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: textColor, fontSize: 12, fontWeight: 500 }}
              tickFormatter={(month) => {
                const key = month.toLowerCase() as keyof typeof d.months;
                return d.months?.[key] ?? month;
              }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: textColor, fontSize: 12, fontWeight: 500 }}
              tickFormatter={(value) => `$${value / 1000}k`}
              dx={-8}
            />
            <Tooltip
              contentStyle={{
                background: isDark ? "#1e2d5e" : "#ffffff",
                border: `1px solid ${isDark ? "#273570" : "#e5e7eb"}`,
                borderRadius: 10,
                boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
              }}
              labelStyle={{ color: "var(--text)", fontWeight: 700, marginBottom: 4 }}
              itemStyle={{ color: "#2EBCCC", fontWeight: 600 }}
              formatter={(value) => {
                const num = typeof value === "number" ? value : Number(value);
                return [`$${Number.isNaN(num) ? 0 : num.toLocaleString()}`, d.charts.earnings.tooltipLabel];
              }}
            />
            <Area
              type="monotone"
              dataKey="earnings"
              stroke={strokeColor}
              strokeWidth={3}
              fill="url(#earningsGradient)"
              activeDot={{ r: 6, strokeWidth: 0, fill: strokeColor }}
              dot={{ r: 4, strokeWidth: 0, fill: strokeColor }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
