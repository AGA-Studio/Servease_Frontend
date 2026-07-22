import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { CategoryBreakdown } from "../../../../types/dashboard";
import { useI18n } from "../../../../i18n";

interface JobsByCategoryChartProps {
  data: CategoryBreakdown[] | undefined;
  isDark: boolean;
}

export const JobsByCategoryChart = ({ data, isDark }: JobsByCategoryChartProps) => {
  const { t } = useI18n();
  const d = t("dashboardscreen");
  const textColor = isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)";

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
          marginBottom: 4,
        }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize: "1rem",
            color: "var(--text)",
          }}
        >
          {d.charts.categories.title}
        </span>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: isDark ? "#1e2d5e" : "#ffffff",
                border: `1px solid ${isDark ? "#273570" : "#e5e7eb"}`,
                borderRadius: 10,
                boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
              }}
              itemStyle={{ color: "var(--text)", fontWeight: 600 }}
              formatter={(value, name) => {
                const num = typeof value === "number" ? value : Number(value);
                return [`${Number.isNaN(num) ? 0 : num}%`, name];
              }}
            />
            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{
                color: textColor,
                fontSize: "0.78rem",
                fontWeight: 500,
                paddingTop: 8,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
