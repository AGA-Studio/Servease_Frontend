import { useRef, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import type { NavItem } from "./SidebarNavItems";
import { useI18n } from "../../i18n";

interface Props {
  item: NavItem;
  isCollapsed: boolean;
  isDark: boolean;
  isActive: boolean;
  onClick: () => void;
}

const SidebarNavLink: React.FC<Props> = ({
  item,
  isCollapsed,
  isDark,
  isActive,
  onClick,
}) => {
  const [hovered, setHovered] = useState(false);
  const [fillWidth, setFillWidth] = useState(0);
  const animRef = useRef<number | null>(null);
  const fillState = useRef(0);
  const { t } = useI18n();
  const sidebar = t("sidebar");

  const animateFill = (target: number) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const step = () => {
      const diff = target - fillState.current;
      if (Math.abs(diff) < 0.5) {
        fillState.current = target;
        setFillWidth(target);
        return;
      }
      fillState.current += diff * 0.12;
      setFillWidth(fillState.current);
      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    animateFill(hovered && !isActive ? 100 : 0);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [hovered, isActive]);

  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className="block no-underline relative"
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`relative flex items-center rounded-[10px] cursor-pointer overflow-hidden ${isCollapsed ? "icon-shake" : ""}`}
        style={{
          gap: isCollapsed ? 0 : 12,
          justifyContent: isCollapsed ? "center" : "flex-start",
          padding: isCollapsed ? "11px 0" : "10px 14px",
          height: 40,
          background: "transparent",
        }}
      >
        {!isActive && (
          <div
            className="absolute inset-0 rounded-[10px] pointer-events-none"
            style={{
              background: "rgba(46,188,204,0.08)",
              width: `${fillWidth}%`,
            }}
          />
        )}

        {isActive && !isCollapsed && (
          <div
            className="absolute left-0 w-[3px] rounded-full bg-white z-10"
            style={{ top: "20%", height: "60%" }}
          />
        )}

        <span
          className="flex items-center justify-center shrink-0 transition-colors duration-200 relative z-10"
          style={{
            color: isActive ? "#FFFFFF" : isDark ? "#989898" : "#1B244C",
          }}
        >
          {item.icon}
        </span>

        {!isCollapsed && (
          <span
            className="text-sm whitespace-nowrap transition-colors duration-200 relative z-10"
            style={{
              fontWeight: isActive ? 700 : 600,
              color: isActive
                ? "#FFFFFF"
                : isDark
                  ? "#EFEFEF"
                  : "rgba(27,36,76,0.7)",
            }}
          >
            {sidebar[item.key]}
          </span>
        )}
      </div>

      {isCollapsed && hovered && (
        <div
          className="fixed z-[999] px-3 py-[6px] rounded-[8px] text-xs font-semibold whitespace-nowrap pointer-events-none"
          style={{
            left: 80,
            background: isDark ? "#0f1a3e" : "#1B244C",
            color: "#FFFFFF",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            transform: "translateY(-50%)",
            top: "50%",
          }}
        >
          {sidebar[item.key]}
          <div
            className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 rotate-45"
            style={{ background: isDark ? "#0f1a3e" : "#1B244C" }}
          />
        </div>
      )}
    </NavLink>
  );
};

export default SidebarNavLink;
