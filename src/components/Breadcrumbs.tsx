import { Fragment } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  /** Where the back button navigates. Defaults to browser history back. */
  backTo?: string;
  /** Accessible label for the back button. */
  backLabel?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, backTo, backLabel = "Back" }) => {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
      <motion.button
        type="button"
        aria-label={backLabel}
        onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{
          scale: 1.05,
          borderColor: "#2EBCCC",
          color: "#2EBCCC",
          backgroundColor: "rgba(46,188,204,0.08)",
        }}
        whileTap={{ scale: 0.92 }}
        transition={{ duration: 0.18, ease: EASE }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 34,
          height: 34,
          flex: "none",
          borderRadius: 10,
          border: "1.5px solid var(--divider)",
          background: "var(--sidebar-bg)",
          color: "var(--text)",
          cursor: "pointer",
        }}
      >
        <ArrowLeft size={16} />
      </motion.button>

      <motion.nav
        aria-label="Breadcrumb"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 6,
          fontSize: "0.8rem",
          color: "var(--text-secondary)",
        }}
      >
        {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <Fragment key={`${item.label}-${i}`}>
            {i > 0 && (
              <ChevronRight
                size={13}
                style={{ color: "var(--text-secondary)", opacity: 0.6, flex: "none" }}
              />
            )}
            {isLast || !item.to ? (
              <span
                style={{
                  color: isLast ? "var(--text)" : "var(--text-secondary)",
                  fontWeight: isLast ? 700 : 500,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 260,
                }}
              >
                {item.label}
              </span>
            ) : (
              <motion.button
                onClick={() => navigate(item.to as string)}
                whileHover={{ color: "#2EBCCC" }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.15, ease: EASE }}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  margin: 0,
                  font: "inherit",
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </motion.button>
            )}
          </Fragment>
        );
        })}
      </motion.nav>
    </div>
  );
};

export default Breadcrumbs;
