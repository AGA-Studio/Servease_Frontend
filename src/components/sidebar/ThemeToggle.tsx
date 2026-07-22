// Theme toggle for the sidebar: icon-only morph button when collapsed, switch control when expanded.

import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useI18n } from "../../i18n";
import IconTooltip from "../tooltip/IconTooltip";
import { animateThemeChange } from "../../theme/animateThemeChange";

const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

const TRACK_W = 44;
const TRACK_H = 24;
const THUMB = 18;
const PAD = 3;
const TRAVEL = TRACK_W - THUMB - PAD * 2;

interface Props {
  isDark: boolean;
  isCollapsed: boolean;
}

const MorphIcon = ({ isDark, size = 15 }: { isDark: boolean; size?: number }) => (
  <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
    <Sun
      size={size}
      className="absolute inset-0"
      style={{
        color: "#FFB200",
        opacity: isDark ? 0 : 1,
        transform: `rotate(${isDark ? 90 : 0}deg) scale(${isDark ? 0.4 : 1})`,
        transition: `transform 280ms ${EASE_OUT}, opacity 180ms ease`,
      }}
    />
    <Moon
      size={size}
      className="absolute inset-0"
      style={{
        color: "#2EBCCC",
        opacity: isDark ? 1 : 0,
        transform: `rotate(${isDark ? 0 : -90}deg) scale(${isDark ? 1 : 0.4})`,
        transition: `transform 280ms ${EASE_OUT}, opacity 180ms ease`,
      }}
    />
  </span>
);

const ThemeToggle: React.FC<Props> = ({ isDark, isCollapsed }) => {
  const { t } = useI18n();
  const labels = t("sidebar").theme;
  const [pressed, setPressed] = useState(false);

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) =>
    animateThemeChange(isDark ? "light" : "dark", e.clientX, e.clientY);
  const label = isDark ? labels.switchToLight : labels.switchToDark;

  if (isCollapsed) {
    return (
      <IconTooltip label={label} isDark={isDark}>
        {({ ref, onMouseEnter, onMouseLeave }) => (
          <button
            ref={ref}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={handleToggle}
            aria-label={label}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            className="w-full flex items-center justify-center rounded-[10px] border-none cursor-pointer"
            style={{
              height: 40,
              background: isDark ? "rgba(255,255,255,0.05)" : "rgba(27,36,76,0.05)",
              transform: pressed ? "scale(0.94)" : "scale(1)",
              transition: `transform 160ms ${EASE_OUT}, background 200ms ease`,
            }}
          >
            <MorphIcon isDark={isDark} size={17} />
          </button>
        )}
      </IconTooltip>
    );
  }

  return (
    <button
      onClick={handleToggle}
      aria-label={label}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      className="w-full flex items-center justify-between rounded-[10px] border-none cursor-pointer px-3"
      style={{
        height: 40,
        background: "transparent",
        fontFamily: "inherit",
        transform: pressed ? "scale(0.98)" : "scale(1)",
        transition: `transform 160ms ${EASE_OUT}`,
      }}
    >
      <span
        className="text-sm"
        style={{
          fontWeight: 600,
          color: isDark ? "#EFEFEF" : "rgba(27,36,76,0.7)",
        }}
      >
        {isDark ? labels.dark : labels.light}
      </span>

      <span
        className="relative inline-flex shrink-0"
        style={{
          width: TRACK_W,
          height: TRACK_H,
          borderRadius: 999,
          background: isDark ? "#273570" : "#E5E7EB",
          transition: `background 220ms ease`,
        }}
      >
        <span
          className="absolute flex items-center justify-center rounded-full"
          style={{
            top: PAD,
            left: PAD,
            width: THUMB,
            height: THUMB,
            background: isDark ? "#1B244C" : "#FFFFFF",
            boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
            transform: `translateX(${isDark ? TRAVEL : 0}px)`,
            transition: `transform 260ms ${EASE_OUT}`,
          }}
        >
          <MorphIcon isDark={isDark} size={11} />
        </span>
      </span>
    </button>
  );
};

export default ThemeToggle;
