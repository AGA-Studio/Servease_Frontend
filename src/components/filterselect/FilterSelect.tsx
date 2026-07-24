import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useThemeMode } from "../../theme/useThemeMode";

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  label?: string;
  value: string;
  options: FilterOption[];
  placeholder?: string;
  onChange: (value: string) => void;
}

export const FilterSelect = ({
  label,
  value,
  options,
  placeholder,
  onChange,
}: FilterSelectProps) => {
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
    options.find((option) => option.value === value)?.label ?? placeholder ?? "";

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
      {label && (
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
      )}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          height: 42,
          padding: "0 14px",
          borderRadius: 10,
          border: "1.5px solid var(--divider)",
          background: "var(--card-bg)",
          color: "var(--text)",
          fontSize: "0.875rem",
          fontWeight: 500,
          cursor: "pointer",
          fontFamily: "inherit",
          minWidth: 140,
          whiteSpace: "nowrap",
          transition: "border-color 0.18s",
          boxSizing: "border-box",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.borderColor = "#2EBCCC")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.borderColor = "var(--divider)")
        }
      >
        {selectedLabel}
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.18 }}
          style={{ display: "flex", color: "var(--text-secondary)" }}
        >
          <ChevronDown size={15} />
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              zIndex: 10,
              background: "var(--card-bg)",
              border: "1.5px solid var(--divider)",
              borderRadius: 12,
              boxShadow: isDark
                ? "0 8px 24px rgba(0,0,0,0.4)"
                : "0 8px 24px rgba(0,0,0,0.1)",
              maxHeight: 240,
              overflowY: "auto",
              minWidth: 180,
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
                  padding: "9px 14px",
                  border: "none",
                  background:
                    option.value === value
                      ? isDark
                        ? "rgba(46,188,204,0.12)"
                        : "rgba(46,188,204,0.08)"
                      : "transparent",
                  color: option.value === value ? "#2EBCCC" : "var(--text)",
                  fontSize: "0.875rem",
                  fontWeight: option.value === value ? 600 : 400,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (option.value !== value)
                    e.currentTarget.style.background = isDark
                      ? "rgba(46,188,204,0.06)"
                      : "rgba(46,188,204,0.08)";
                  else
                    e.currentTarget.style.background = isDark
                      ? "rgba(46,188,204,0.16)"
                      : "rgba(46,188,204,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    option.value === value
                      ? isDark
                        ? "rgba(46,188,204,0.12)"
                        : "rgba(46,188,204,0.08)"
                      : "transparent";
                }}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterSelect;
