// Empty state genérico y reutilizable: ícono + mensaje + acción opcional.
// Mismo estilo/animación en toda la app (fade + translateY, ease-out).

import { motion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: "primary" | "ghost";
}

interface Props {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  isDark: boolean;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  size?: "default" | "compact";
}

const EmptyState: React.FC<Props> = ({
  icon,
  title,
  subtitle,
  isDark,
  action,
  secondaryAction,
  size = "default",
}) => {
  const isCompact = size === "compact";
  const iconSize = isCompact ? 48 : 72;

  const renderAction = (a: EmptyStateAction, key: string) => {
    const isGhost = a.variant === "ghost";
    return isGhost ? (
      <button
        key={key}
        onClick={a.onClick}
        style={{
          marginTop: 4,
          padding: "9px 22px",
          borderRadius: 10,
          border: `1.5px solid ${isDark ? "#273570" : "#e5e7eb"}`,
          background: "transparent",
          color: "var(--text)",
          fontSize: "0.875rem",
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
          display: "flex",
          alignItems: "center",
          gap: 7,
        }}
      >
        {a.icon}
        {a.label}
      </button>
    ) : (
      <motion.button
        key={key}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={a.onClick}
        style={{
          marginTop: 4,
          padding: "10px 24px",
          borderRadius: 10,
          border: "none",
          background: "#2EBCCC",
          color: "#ffffff",
          fontSize: "0.875rem",
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "inherit",
          display: "flex",
          alignItems: "center",
          gap: 7,
        }}
      >
        {a.icon}
        {a.label}
      </motion.button>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: isCompact ? 10 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: isCompact ? 0.3 : 0.4, ease: EASE }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: isCompact ? "28px 16px" : "64px 24px",
        textAlign: "center",
        gap: isCompact ? 8 : 12,
      }}
    >
      <div
        style={{
          width: iconSize,
          height: iconSize,
          borderRadius: "50%",
          background: isDark ? "rgba(46,188,204,0.12)" : "rgba(46,188,204,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 4,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <p
        style={{
          fontWeight: 700,
          fontSize: isCompact ? "0.9rem" : "1.05rem",
          color: "var(--text)",
          margin: 0,
        }}
      >
        {title}
      </p>
      {subtitle && (
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: isCompact ? "0.8rem" : "0.875rem",
            margin: 0,
            maxWidth: 320,
          }}
        >
          {subtitle}
        </p>
      )}
      {(action || secondaryAction) && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          {secondaryAction && renderAction(secondaryAction, "secondary")}
          {action && renderAction(action, "primary")}
        </div>
      )}
    </motion.div>
  );
};

export default EmptyState;
