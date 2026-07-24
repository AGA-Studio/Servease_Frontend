import { motion } from "motion/react";

interface SkeletonProps {
  isDark: boolean;
  variant?: "kpi" | "chart" | "job-card" | "activity";
}

interface ShimmerProps {
  bg: string;
  style?: React.CSSProperties;
}

const Shimmer = ({ bg, style }: ShimmerProps) => (
  <motion.div
    animate={{ opacity: [0.6, 1, 0.6] }}
    transition={{
      opacity: { duration: 1.4, repeat: Infinity, ease: [0.4, 0, 0.6, 1] },
    }}
    style={{ background: bg, borderRadius: 6, ...style }}
  />
);

export const SkeletonLoader = ({ isDark, variant = "job-card" }: SkeletonProps) => {
  const bg = isDark ? "#273570" : "#e5e7eb";
  const cardBg = isDark ? "#1e2d5e" : "#ffffff";

  if (variant === "kpi") {
    return (
      <div
        style={{
          background: cardBg,
          borderRadius: 16,
          border: `1px solid ${isDark ? "#273570" : "#e5e7eb"}`,
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <Shimmer bg={bg} style={{ width: 52, height: 52, borderRadius: 14 }} />
        <div style={{ flex: 1 }}>
          <Shimmer bg={bg} style={{ width: "40%", height: 12, marginBottom: 10 }} />
          <Shimmer bg={bg} style={{ width: "55%", height: 24 }} />
        </div>
      </div>
    );
  }

  if (variant === "chart") {
    return (
      <div
        style={{
          background: cardBg,
          borderRadius: 16,
          border: `1px solid ${isDark ? "#273570" : "#e5e7eb"}`,
          padding: 20,
          height: 280,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Shimmer bg={bg} style={{ width: "35%", height: 16, marginBottom: 20 }} />
        <Shimmer bg={bg} style={{ flex: 1, borderRadius: 12 }} />
      </div>
    );
  }

  if (variant === "activity") {
    return (
      <div
        style={{
          background: cardBg,
          borderRadius: 16,
          border: `1px solid ${isDark ? "#273570" : "#e5e7eb"}`,
          padding: 20,
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ display: "flex", gap: 14, marginBottom: i < 4 ? 18 : 0 }}>
            <Shimmer bg={bg} style={{ width: 14, height: 14, borderRadius: "50%", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <Shimmer bg={bg} style={{ width: "30%", height: 10, marginBottom: 8 }} />
              <Shimmer bg={bg} style={{ width: "80%", height: 14 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        background: cardBg,
        borderRadius: 14,
        border: `1px solid ${isDark ? "#273570" : "#e5e7eb"}`,
        padding: "16px 20px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <Shimmer bg={bg} style={{ width: 42, height: 42, borderRadius: 10 }} />
        <div style={{ flex: 1 }}>
          <Shimmer bg={bg} style={{ width: "55%", height: 14, marginBottom: 8 }} />
          <Shimmer bg={bg} style={{ width: "35%", height: 10 }} />
        </div>
      </div>
      <Shimmer bg={bg} style={{ width: "100%", height: 42, marginBottom: 12 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Shimmer bg={bg} style={{ width: 80, height: 12 }} />
        <Shimmer bg={bg} style={{ width: 80, height: 34, borderRadius: 10 }} />
      </div>
    </div>
  );
};
