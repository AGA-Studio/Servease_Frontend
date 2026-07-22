import { useState } from "react";
import { NavLink } from "react-router-dom";
import type { AdminNavItem } from "./AdminNavItems";
import { useI18n } from "../../i18n";

interface Props {
  item: AdminNavItem;
  isDark: boolean;
  isActive: boolean;
  onClick?: () => void;
}

const AdminNavLink: React.FC<Props> = ({ item, isDark, isActive, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const { t } = useI18n();
  const nav = t("admin").nav;

  return (
    <NavLink to={item.to} onClick={onClick} className="block no-underline relative">
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex items-center gap-3 rounded-[10px] cursor-pointer overflow-hidden transition-colors duration-200"
        style={{
          padding: "10px 14px",
          height: 40,
          background: !isActive && hovered ? "rgba(46,188,204,0.08)" : "transparent",
        }}
      >
        <span
          className="flex items-center justify-center shrink-0 relative z-10"
          style={{ color: isActive ? "#FFFFFF" : isDark ? "#989898" : "#1B244C" }}
        >
          {item.icon}
        </span>
        <span
          className="text-sm whitespace-nowrap relative z-10"
          style={{
            fontWeight: isActive ? 700 : 600,
            color: isActive ? "#FFFFFF" : isDark ? "#EFEFEF" : "rgba(27,36,76,0.7)",
          }}
        >
          {nav[item.key]}
        </span>
      </div>
    </NavLink>
  );
};

export default AdminNavLink;
