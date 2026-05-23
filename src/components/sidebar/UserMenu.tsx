// User card button at the bottom of the sidebar with an animated dropdown for profile, settings, and logout.

import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, User, Settings, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ROUTES } from "../../router/routes";
import { useI18n } from "../../i18n";

interface Props {
  isCollapsed: boolean;
  isDark: boolean;
  onExpand: () => void;
}

const UserMenu: React.FC<Props> = ({ isCollapsed, isDark, onExpand }) => {
  const { user, profile, logout } = useAuth();

  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const { t } = useI18n();
  const sidebar = t("sidebar");
  const isProvider = user?.role === "provider" || user?.role === "admin";
  const roleLabel = isProvider
    ? sidebar.providerAccount
    : sidebar.clientAccount;

  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate(ROUTES.AUTH, { replace: true });
  };

  const items = [
    {
      label: "Profile",
      icon: <User size={15} />,
      action: () => {
        setOpen(false);
        navigate(ROUTES.APP.PROFILE);
      },
    },
    {
      label: "Settings",
      icon: <Settings size={15} />,
      action: () => {
        setOpen(false);
        navigate(ROUTES.APP.SETTINGS);
      },
    },
    {
      label: "Logout",
      icon: <LogOut size={15} />,
      action: handleLogout,
      danger: true,
    },
  ];

  const borderColor = isDark ? "#273570" : "#CCCCCC";
  const dropShadow = isDark
    ? "0 8px 32px rgba(0,0,0,0.5)"
    : "0 8px 32px rgba(27,36,76,0.12)";
  const cardBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(27,36,76,0.02)";

  return (
    <div ref={ref} className="relative">
      <button
        ref={buttonRef}
        onClick={() => {
          if (isCollapsed) {
            onExpand();
            setTimeout(() => {
              setOpen(true);
              setActiveIndex(null);
            }, 100);
          } else {
            setOpen((o) => !o);
            setActiveIndex(null);
          }
        }}
        className="w-full flex items-center rounded-[12px] border-none cursor-pointer transition-colors duration-200"
        style={{
          gap: isCollapsed ? 0 : 10,
          justifyContent: isCollapsed ? "center" : "space-between",
          padding: isCollapsed ? "10px 0" : "10px 12px",
          background: cardBg,
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = isDark
            ? "rgba(255,255,255,0.06)"
            : "rgba(27,36,76,0.05)")
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = cardBg)}
      >
        <div className="flex items-center gap-[10px] min-w-0">
          <div
            className="w-9 h-9 rounded-full shrink-0 overflow-hidden flex items-center justify-center text-white font-extrabold text-[0.85rem]"
            style={{ background: "linear-gradient(135deg, #2EBCCC, #1B244C)" }}
          >
            {profile?.url_foto_perfil ? (
              <img
                src={profile.url_foto_perfil}
                alt={user?.firstName}
                className="w-full h-full object-cover"
              />
            ) : (
              (user?.firstName?.[0]?.toUpperCase() ?? "U")
            )}
          </div>
          {!isCollapsed && (
            <div className="text-left min-w-0">
              <p
                className="m-0 font-bold text-[0.82rem] whitespace-nowrap overflow-hidden text-ellipsis"
                style={{ color: isDark ? "#FFFFFF" : "#1B244C" }}
              >
                {user?.firstName} {(user as any)?.lastName ?? ""}
              </p>
              <p className="m-0 text-[0.7rem] text-[#989898] whitespace-nowrap">
                {roleLabel}
              </p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <ChevronDown
            size={15}
            className="text-[#989898] shrink-0 transition-transform duration-[250ms]"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        )}
      </button>

      <div
        className="absolute left-0 right-0 rounded-[14px] overflow-hidden p-[6px]"
        style={{
          bottom: "calc(100% + 8px)",
          background: cardBg,
          border: `1px solid ${borderColor}`,
          boxShadow: dropShadow,
          transformOrigin: "bottom center",
          transform: open
            ? "scaleY(1) translateY(0)"
            : "scaleY(0.85) translateY(8px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "all" : "none",
          transition:
            "transform 0.22s cubic-bezier(0.4,0,0.2,1), opacity 0.18s ease",
        }}
      >
        {items.map((item, i) => (
          <button
            key={item.label}
            onClick={item.action}
            onMouseEnter={() => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(null)}
            className="w-full flex items-center gap-[10px] px-3 py-[9px] rounded-[9px] border-none text-[0.82rem] font-semibold cursor-pointer transition-colors duration-150 text-left"
            style={{
              fontFamily: "inherit",
              background:
                activeIndex === i
                  ? item.danger
                    ? "rgba(255,0,0,0.08)"
                    : "rgba(46,188,204,0.1)"
                  : "transparent",
              color: item.danger
                ? "#FF0000"
                : isDark
                  ? "#EFEFEF"
                  : "rgba(27,36,76,0.85)",
            }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserMenu;
