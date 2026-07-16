// Main application shell. Composes the desktop sidebar, mobile sidebar, mobile header, and the page outlet.

import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Menu, Plus } from "lucide-react";
import Sidebar from "../components/sidebar/Sidebar";
import MobileSidebar from "../components/sidebar/MobileSidebar";
import ServeaseLogoDark from "../assets/Servease-Icono-Modo-Oscuro.svg";
import ServeaseLogo from "../assets/Servease-Icono.svg";
import { useI18n } from "../i18n";
import { ROUTES } from "../router/routes";

const useTheme = () => {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.getAttribute("data-theme") === "dark"
  );
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setIsDark(document.documentElement.getAttribute("data-theme") === "dark")
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return isDark;
};

const AppLayout: React.FC = () => {
  const isDark = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const sidebar = t("sidebar");

  const bg     = isDark ? "#1B244C" : "#F6F8F8";
  const border = isDark ? "#273570" : "#CCCCCC";
  const headerBg = isDark ? "#1B244C" : "#FFFFFF";

  const headerLogo = isDark ? ServeaseLogoDark : ServeaseLogo;
  const isOnNewService = location.pathname === ROUTES.APP.NEW_SERVICE;

  return (
    <>
      <style>{`
        @media (min-width: 768px) {
          #desktop-sidebar { display: flex !important; }
          #mobile-sidebar  { display: none !important; }
          #mobile-header   { display: none !important; }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <div className="flex h-screen overflow-hidden" style={{ background: bg }}>
        <Sidebar isDark={isDark} />

        <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} isDark={isDark} />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header
            id="mobile-header"
            className="flex items-center gap-3 px-4 h-14 shrink-0"
            style={{ borderBottom: `1px solid ${border}`, background: headerBg }}
          >
            <button
              onClick={() => setMobileOpen(true)}
              className="w-9 h-9 rounded-[10px] border-none flex items-center justify-center cursor-pointer"
              style={{ background: isDark ? "#273570" : "#F6F8F8", color: isDark ? "#FFFFFF" : "#1B244C" }}
            >
              <Menu size={19} />
            </button>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-7 h-7 rounded-[7px] flex items-center justify-center p-[5px] shrink-0"
                style={{ border: "1.5px solid #2EBCCC", background: "rgba(46,188,204,0.08)" }}>
                <img src={headerLogo} alt="Servease" className="w-full h-full object-contain" />
              </div>
              <span className="font-extrabold text-[0.95rem] truncate" style={{ color: isDark ? "#FFFFFF" : "#1B244C" }}>
                Servease
              </span>
            </div>

            {!isOnNewService && (
              <button
                onClick={() => navigate(ROUTES.APP.NEW_SERVICE)}
                aria-label={sidebar.newService}
                className="w-9 h-9 rounded-[10px] border-none flex items-center justify-center cursor-pointer shrink-0 transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.93]"
                style={{ background: "#2EBCCC", color: "#FFFFFF" }}
              >
                <Plus size={19} strokeWidth={2.5} />
              </button>
            )}
          </header>

          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default AppLayout;