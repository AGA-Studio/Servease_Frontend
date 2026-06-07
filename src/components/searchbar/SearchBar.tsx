import { Search, Send, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface SearchSuggestion {
  id: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  tag?: string;
}

interface SearchBarProps {
  suggestions?: SearchSuggestion[];
  placeholder?: string;
  hintText?: string;
  isDark?: boolean;
  onSearch?: (query: string) => void;
  onSelect?: (suggestion: SearchSuggestion) => void;
  className?: string;
}

const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0, height: 0 },
    show: {
      opacity: 1,
      height: "auto",
      transition: {
        height: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
        staggerChildren: 0.06,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        height: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
        opacity: { duration: 0.15 },
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] },
    },
    exit: {
      opacity: 0,
      y: -8,
      transition: { duration: 0.15 },
    },
  },
} as const;

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function SearchBar({
  suggestions = [],
  placeholder = "Search...",
  hintText,
  isDark = false,
  onSearch,
  onSelect,
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debouncedQuery = useDebounce(query, 180);
  const inputRef = useRef<HTMLInputElement>(null);

  const colors = {
    input: isDark ? "#273570" : "#F6F8F8",
    border: isDark ? "#273570" : "#E5E7EB",
    dropBg: isDark ? "#0f1a3e" : "#FFFFFF",
    dropBorder: isDark ? "#273570" : "#E5E7EB",
    dropShadow: isDark
      ? "0 8px 32px rgba(0,0,0,0.45)"
      : "0 8px 32px rgba(27,36,76,0.10)",
    text: isDark ? "#FFFFFF" : "#1B244C",
    textSecondary: "#989898",
    iconColor: "#989898",
    activeBg: isDark ? "rgba(46,188,204,0.13)" : "rgba(46,188,204,0.08)",
    activeText: "#2EBCCC",
    tagBg: isDark ? "rgba(46,188,204,0.12)" : "rgba(46,188,204,0.10)",
    tagText: "#2EBCCC",
    divider: isDark ? "#273570" : "#F0F0F0",
    ring: "#2EBCCC",
    clearBg: isDark ? "#273570" : "#E5E7EB",
  };

  const filtered = useMemo(() => {
    if (!debouncedQuery.trim()) return suggestions;
    const q = debouncedQuery.toLowerCase();
    return suggestions.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        (s.description ?? "").toLowerCase().includes(q),
    );
  }, [debouncedQuery, suggestions]);

  const showDropdown = isFocused && filtered.length > 0;

  useEffect(() => {
    setActiveIndex(-1);
  }, [debouncedQuery]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value),
    [],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showDropdown) {
        if (e.key === "Enter" && query.trim()) onSearch?.(query.trim());
        return;
      }
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((p) => (p < filtered.length - 1 ? p + 1 : 0));
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((p) => (p > 0 ? p - 1 : filtered.length - 1));
          break;
        case "Enter":
          e.preventDefault();
          if (activeIndex >= 0 && filtered[activeIndex]) {
            onSelect?.(filtered[activeIndex]);
            setQuery(filtered[activeIndex].label);
            setIsFocused(false);
          } else if (query.trim()) {
            onSearch?.(query.trim());
          }
          break;
        case "Escape":
          setIsFocused(false);
          setActiveIndex(-1);
          inputRef.current?.blur();
          break;
      }
    },
    [showDropdown, filtered, activeIndex, query, onSearch, onSelect],
  );

  const handleSelect = useCallback(
    (s: SearchSuggestion) => {
      onSelect?.(s);
      setQuery(s.label);
      setIsFocused(false);
    },
    [onSelect],
  );

  const handleClear = useCallback(() => {
    setQuery("");
    setActiveIndex(-1);
    inputRef.current?.focus();
  }, []);

  const handleFocus = useCallback(() => setIsFocused(true), []);

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      setIsFocused(false);
      setActiveIndex(-1);
    }, 150);
  }, []);

  return (
    <div className={`relative w-full ${className}`}>
      <div
        className="relative flex items-center rounded-[12px] transition-all duration-200"
        style={{
          background: colors.input,
          border: `1.5px solid ${isFocused ? colors.ring : colors.border}`,
          boxShadow: isFocused
            ? `0 0 0 3px ${isDark ? "rgba(46,188,204,0.15)" : "rgba(46,188,204,0.12)"}`
            : "none",
        }}
      >
        <div className="pl-3 flex items-center shrink-0">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={query.length > 0 ? "send" : "search"}
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {query.length > 0 ? (
                <Send size={16} style={{ color: colors.ring }} />
              ) : (
                <Search size={16} style={{ color: colors.iconColor }} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className="flex-1 bg-transparent outline-none border-none text-sm px-3 py-[10px]"
          style={{
            color: colors.text,
            caretColor: colors.ring,
          }}
        />

        <AnimatePresence>
          {query.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.15 }}
              onClick={handleClear}
              className="mr-3 flex items-center justify-center w-5 h-5 rounded-full shrink-0 cursor-pointer border-none"
              style={{
                background: colors.clearBg,
                color: colors.textSecondary,
              }}
            >
              <X size={11} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            variants={ANIMATION_VARIANTS.container}
            initial="hidden"
            animate="show"
            exit="exit"
            className="absolute left-0 right-0 rounded-[12px] overflow-hidden mt-2 z-50"
            style={{
              background: colors.dropBg,
              border: `1.5px solid ${colors.dropBorder}`,
              boxShadow: colors.dropShadow,
            }}
          >
            <ul className="py-[6px]">
              {filtered.map((s, i) => (
                <motion.li
                  key={s.id}
                  variants={ANIMATION_VARIANTS.item}
                  onClick={() => handleSelect(s)}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(-1)}
                  className="flex items-center justify-between gap-2 mx-[6px] px-3 py-[9px] rounded-[8px] cursor-pointer transition-colors duration-150"
                  style={{
                    background:
                      activeIndex === i ? colors.activeBg : "transparent",
                  }}
                >
                  <div className="flex items-center gap-[10px] min-w-0">
                    {s.icon && (
                      <span
                        className="shrink-0"
                        style={{
                          color:
                            activeIndex === i
                              ? colors.activeText
                              : colors.iconColor,
                        }}
                      >
                        {s.icon}
                      </span>
                    )}
                    <span
                      className="text-sm font-semibold truncate"
                      style={{
                        color:
                          activeIndex === i ? colors.activeText : colors.text,
                      }}
                    >
                      {s.label}
                    </span>
                    {s.description && (
                      <span
                        className="text-xs truncate"
                        style={{ color: colors.textSecondary }}
                      >
                        {s.description}
                      </span>
                    )}
                  </div>
                  {s.tag && (
                    <span
                      className="text-[11px] font-semibold px-2 py-[2px] rounded-full shrink-0"
                      style={{
                        background: colors.tagBg,
                        color: colors.tagText,
                      }}
                    >
                      {s.tag}
                    </span>
                  )}
                </motion.li>
              ))}
            </ul>

            {hintText && (
              <div
                className="px-4 py-[8px] text-xs"
                style={{
                  borderTop: `1px solid ${colors.divider}`,
                  color: colors.textSecondary,
                }}
              >
                {hintText}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
