import { useEffect, useId, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Moon, ShieldCheck, Sun } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../../context/AuthContext";
import { useI18n, type Locale } from "../../i18n";
import { ROUTES } from "../../router/routes";
import { ADMIN_NAV_ITEMS } from "./AdminNavItems";
import AdminNavLink from "./AdminNavLink";
import LogoutModal from "../sidebar/LogoutModal";
import ServeaseLogoDark from "../../assets/Servease-Icono-Modo-Oscuro.svg";
import ServeaseLogo from "../../assets/Servease-Icono.svg";
import { animateThemeChange } from "../../theme/animateThemeChange";

interface Props {
  isDark: boolean;
  onNavClick?: () => void;
}

const AdminSidebarContent: React.FC<Props> = ({ isDark, onNavClick }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, locale, toggleLocale } = useI18n();
  const a = t("admin");

  const pillId = useId();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const divider = isDark ? "#273570" : "#CCCCCC";
  const logo = isDark ? ServeaseLogoDark : ServeaseLogo;
  const cardBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(27,36,76,0.02)";
  const dropShadow = isDark
    ? "0 8px 32px rgba(0,0,0,0.5)"
    : "0 8px 32px rgba(27,36,76,0.12)";

  const activeIndex = ADMIN_NAV_ITEMS.findIndex((item) => location.pathname === item.to);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const setTheme = (mode: "light" | "dark", e: React.MouseEvent) =>
    animateThemeChange(mode, e.clientX, e.clientY);

  const setLanguage = (next: Locale) => {
    if (next !== locale) toggleLocale();
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    setMenuOpen(false);
    await logout();
    navigate(ROUTES.AUTH, { replace: true });
  };

  const segmentBtn = (active: boolean): React.CSSProperties => ({
    flex: 1,
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "0.76rem",
    fontWeight: 700,
    padding: "7px 0",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    transition: "background 150ms ease, color 150ms ease",
    background: active ? "#2EBCCC" : "transparent",
    color: active ? "#FFFFFF" : isDark ? "#989898" : "rgba(27,36,76,0.6)",
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-2 px-5">
        <div
          className="w-12 h-12 rounded-[12px] flex items-center justify-center p-2 shrink-0"
          style={{ border: "2px solid #2EBCCC", background: "rgba(46,188,204,0.08)" }}
        >
          <img src={logo} alt="Servease" className="w-full h-full object-contain" draggable={false} />
        </div>
        <div>
          <span className="block font-extrabold text-[1.1rem] tracking-tight" style={{ color: isDark ? "#FFFFFF" : "#1B244C" }}>
            Servease
          </span>
          <span
            className="flex items-center gap-1 text-[0.68rem] font-bold uppercase tracking-wider"
            style={{ color: "#2EBCCC" }}
          >
            <ShieldCheck size={11} /> {a.badge}
          </span>
        </div>
      </div>

      <div className="h-px my-5 opacity-60 mx-3" style={{ background: divider }} />

      <div className="flex-1 flex flex-col px-3">
        <nav className="flex flex-col gap-0.5 relative">
          {activeIndex >= 0 && (
            <motion.div
              layoutId={`admin-sidebar-active-bg-${pillId}`}
              className="absolute left-0 right-0 rounded-[10px] pointer-events-none z-0"
              style={{ height: 40, background: "#2EBCCC", top: `${activeIndex * 42 + 1}px` }}
              transition={{ type: "spring", duration: 0.45, bounce: 0.18 }}
            />
          )}
          <div className="flex flex-col gap-0.5 relative z-10">
            {ADMIN_NAV_ITEMS.map((item, i) => (
              <motion.div
                key={item.to}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1], delay: i * 0.04 }}
              >
                <AdminNavLink item={item} isDark={isDark} isActive={i === activeIndex} onClick={onNavClick} />
              </motion.div>
            ))}
          </div>
        </nav>
      </div>

      <div ref={menuRef} className="relative px-3 pt-3 pb-3" style={{ borderTop: `1px solid ${divider}` }}>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="w-full flex items-center gap-[10px] rounded-[12px] px-3 py-[10px] border-none cursor-pointer transition-colors duration-200"
          style={{ background: cardBg, fontFamily: "inherit" }}
        >
          <div
            className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white font-extrabold text-[0.85rem]"
            style={{ background: "linear-gradient(135deg, #2EBCCC, #1B244C)" }}
          >
            {user?.firstName?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0 text-left flex-1">
            <p
              className="m-0 font-bold text-[0.82rem] whitespace-nowrap overflow-hidden text-ellipsis"
              style={{ color: isDark ? "#FFFFFF" : "#1B244C" }}
            >
              {user?.firstName} {user?.lastnameP}
            </p>
            <p className="m-0 text-[0.7rem]" style={{ color: "#989898" }}>{a.account}</p>
          </div>
          <ChevronDown
            size={15}
            className="shrink-0 transition-transform duration-[250ms]"
            style={{ color: "#989898", transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </button>

        <div
          className="absolute left-3 right-3 rounded-[14px] p-3"
          style={{
            bottom: "calc(100% + 4px)",
            background: isDark ? "#1B244C" : "#FFFFFF",
            border: `1px solid ${divider}`,
            boxShadow: dropShadow,
            transformOrigin: "bottom center",
            transform: menuOpen ? "scaleY(1) translateY(0)" : "scaleY(0.9) translateY(8px)",
            opacity: menuOpen ? 1 : 0,
            pointerEvents: menuOpen ? "all" : "none",
            transition: "transform 0.22s cubic-bezier(0.4,0,0.2,1), opacity 0.18s ease",
          }}
        >
          <div className="mb-3">
            <p className="m-0 mb-2 text-[0.68rem] font-bold uppercase tracking-wider" style={{ color: "#989898" }}>
              {a.menu.theme}
            </p>
            <div className="flex gap-1 p-1 rounded-[10px]" style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(27,36,76,0.04)" }}>
              <button onClick={(e) => setTheme("light", e)} style={segmentBtn(!isDark)}>
                <Sun size={13} /> {a.menu.themeLight}
              </button>
              <button onClick={(e) => setTheme("dark", e)} style={segmentBtn(isDark)}>
                <Moon size={13} /> {a.menu.themeDark}
              </button>
            </div>
          </div>

          <div className="mb-3">
            <p className="m-0 mb-2 text-[0.68rem] font-bold uppercase tracking-wider" style={{ color: "#989898" }}>
              {a.menu.language}
            </p>
            <div className="flex gap-1 p-1 rounded-[10px]" style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(27,36,76,0.04)" }}>
              <button onClick={() => setLanguage("es")} style={segmentBtn(locale === "es")}>
                Español
              </button>
              <button onClick={() => setLanguage("en")} style={segmentBtn(locale === "en")}>
                English
              </button>
            </div>
          </div>

          <div className="h-px mb-2" style={{ background: divider }} />

          <button
            onClick={() => {
              setMenuOpen(false);
              setShowLogoutModal(true);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.25 rounded-[9px] border-none text-[0.82rem] font-semibold cursor-pointer text-left"
            style={{ fontFamily: "inherit", background: "rgba(255,0,0,0.08)", color: "#FF0000" }}
          >
            <LogOut size={15} /> {a.menu.logout}
          </button>
        </div>
      </div>

      <LogoutModal
        isOpen={showLogoutModal}
        isDark={isDark}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
};

export default AdminSidebarContent;
