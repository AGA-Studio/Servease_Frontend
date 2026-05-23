// Shared sidebar content rendered in both desktop and mobile sidebars: logo with hamburger toggle, navigation links, and user menu.

import { useAuth } from "../../context/AuthContext";
import { NAV_ITEMS } from "./SidebarNavItems";
import SidebarNavLink from "./SidebarNavLink";
import UserMenu from "./UserMenu";
import ServeaseLogoDark from "../../assets/Servease-Icono-Modo-Oscuro.svg";
import ServeaseLogo from "../../assets/Servease-Icono.svg";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";

interface Props {
  isCollapsed: boolean;
  isDark: boolean;
  onNavClick: () => void;
  onToggle: () => void;
  onExpand: () => void;
}

const HamburgerIcon: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const color = isDark ? "#FFFFFF" : "#1B244C";
  return (
    <div className="w-5 h-4 flex flex-col justify-between">
      <span
        className="block h-[2px] rounded-full w-full"
        style={{ background: color }}
      />
      <span
        className="block h-[2px] rounded-full w-3/4"
        style={{ background: color }}
      />
      <span
        className="block h-[2px] rounded-full w-1/2"
        style={{ background: color }}
      />
    </div>
  );
};

const SidebarContent: React.FC<Props> = ({
  isCollapsed,
  isDark,
  onNavClick,
  onToggle,
  onExpand,
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const isProvider = user?.role === "provider" || user?.role === "admin";
  const visibleNav = NAV_ITEMS.filter(
    (item) => !item.providerOnly || isProvider,
  );
  const divider = isDark ? "#273570" : "#CCCCCC";

  const logo = isDark ? ServeaseLogoDark : ServeaseLogo;

  const [logoHovered, setLogoHovered] = useState(false);

  const activeIndex = visibleNav.findIndex(
    (item) => location.pathname === item.to,
  );

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center mb-6"
        style={{
          gap: 12,
          padding: isCollapsed ? "0" : "0 20px",
          justifyContent: isCollapsed ? "center" : "space-between",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-[12px] flex items-center justify-center p-2 shrink-0 cursor-pointer transition-all duration-200 group"
            style={{
              border: "2px solid #2EBCCC",
              background: logoHovered
                ? "rgba(46,188,204,0.15)"
                : "rgba(46,188,204,0.08)",
            }}
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
            onClick={isCollapsed ? onToggle : undefined}
          >
            {isCollapsed ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={logo}
                  alt="Servease"
                  className="absolute w-full h-full object-contain transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)]"
                  style={{
                    opacity: logoHovered ? 0 : 1,
                    transform: logoHovered ? "scale(0.7)" : "scale(1)",
                  }}
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                />

                <div
                  className="absolute flex items-center justify-center transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)]"
                  style={{
                    opacity: logoHovered ? 1 : 0,
                    transform: logoHovered ? "scale(1)" : "scale(0.7)",
                  }}
                >
                  <HamburgerIcon isDark={isDark} />
                </div>
              </div>
            ) : (
              <img
                src={logo}
                alt="Servease"
                className="w-full h-full object-contain"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />
            )}
          </div>
          {!isCollapsed && (
            <span
              className="font-extrabold text-[1.15rem] tracking-tight whitespace-nowrap"
              style={{ color: isDark ? "#FFFFFF" : "#1B244C" }}
            >
              Servease
            </span>
          )}
        </div>

        {!isCollapsed && (
          <button
            onClick={onToggle}
            className="w-7 h-7 rounded-[8px] border-none flex items-center justify-center cursor-pointer transition-all duration-200 shrink-0"
            style={{
              background: isDark
                ? "rgba(255,255,255,0.05)"
                : "rgba(27,36,76,0.05)",
              color: "#989898",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(27,36,76,0.08)";
              e.currentTarget.style.color = "#2EBCCC";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDark
                ? "rgba(255,255,255,0.05)"
                : "rgba(27,36,76,0.05)";
              e.currentTarget.style.color = "#989898";
            }}
          >
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      <div
        className="h-px mb-5 opacity-60 mx-3"
        style={{ background: divider }}
      />

      <nav className="flex-1 flex flex-col px-2 relative">
        {activeIndex >= 0 && (
          <div
            className="absolute left-2 right-2 rounded-[10px] pointer-events-none z-0"
            style={{
              height: 40,
              background: "#2EBCCC",
              top: `${activeIndex * 42 + 1}px`,
              transition: "top 0.35s cubic-bezier(0.4,0,0.2,1)",
            }}
          />
        )}
        <div className="flex flex-col gap-[2px] relative z-10">
          {visibleNav.map((item, i) => (
            <SidebarNavLink
              key={item.to}
              item={item}
              isCollapsed={isCollapsed}
              isDark={isDark}
              isActive={i === activeIndex}
              onClick={onNavClick}
            />
          ))}
        </div>
      </nav>

      <div
        className="px-2 pt-3 pb-2"
        style={{ borderTop: `1px solid ${divider}` }}
      >
        <UserMenu
          isCollapsed={isCollapsed}
          isDark={isDark}
          onExpand={onExpand}
        />
      </div>
    </div>
  );
};

export default SidebarContent;
