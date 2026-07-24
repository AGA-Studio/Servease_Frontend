import { motion } from "motion/react";
import type { KpiData } from "../../../../types/dashboard";
import { KpiCard } from "./KpiCard";
import { SkeletonLoader } from "./SkeletonLoader";

interface KpiRowProps {
  kpis: KpiData[] | undefined;
  isDark: boolean;
  isLoading: boolean;
}

export const KpiRow = ({ kpis, isDark, isLoading }: KpiRowProps) => {
  if (isLoading) {
    return (
      <div className="ds-kpi-row" style={{ marginBottom: 28 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ flex: "1 1 180px", minWidth: 200 }}>
            <SkeletonLoader isDark={isDark} variant="kpi" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className="ds-kpi-row"
      style={{ marginBottom: 28 }}
    >
      {kpis?.map((kpi) => (
        <KpiCard key={kpi.key} data={kpi} isDark={isDark} />
      ))}
    </motion.div>
  );
};
