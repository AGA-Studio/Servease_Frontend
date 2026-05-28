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
  const itemRef = useRef<HTMLDivElement>(null);
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
        ref={itemRef}
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
          className="fixed z-[999] pointer-events-none"
          style={{
            left: 84,
            top: itemRef.current
              ? itemRef.current.getBoundingClientRect().top +
                itemRef.current.getBoundingClientRect().height / 2
              : 0,
            transform: "translateY(-50%)",
          }}
        >
          <div
            style={{
              position: "relative",
              animation:
                "tooltipIn 0.18s cubic-bezier(0.34,1.56,0.64,1) forwards",
            }}
          >
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2"
              style={{
                left: -6,
                width: 8,
                height: 8,
                background: isDark ? "#0f1a3e" : "#1B244C",
                transform: "translateY(-50%) rotate(45deg)",
                borderRadius: 2,
              }}
            />
            <div
              className="px-3 py-[6px] text-xs font-semibold whitespace-nowrap text-white rounded-[8px]"
              style={{
                background: isDark ? "#0f1a3e" : "#1B244C",
                boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
              }}
            >
              {sidebar[item.key]}
            </div>
          </div>
        </div>
      )}
    </NavLink>
  );
};

export default SidebarNavLink;
