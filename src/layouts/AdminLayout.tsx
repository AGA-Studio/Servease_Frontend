// Admin shell: fixed sidebar with the 4 admin sections only, mobile header, and page outlet.

import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import AdminSidebarContent from "../components/admin/AdminSidebarContent";
import ServeaseLogoDark from "../assets/Servease-Icono-Modo-Oscuro.svg";
import ServeaseLogo from "../assets/Servease-Icono.svg";

export interface AdminOutletContext {
  isDark: boolean;
}

const useTheme = () => {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.getAttribute("data-theme") === "dark",
  );
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setIsDark(document.documentElement.getAttribute("data-theme") === "dark"),
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return isDark;
};

const AdminLayout: React.FC = () => {
  const isDark = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const bg = isDark ? "#151d3d" : "#F6F8F8";
  const sidebarBg = isDark ? "#1B244C" : "#FFFFFF";
  const border = isDark ? "#273570" : "#CCCCCC";
  const headerLogo = isDark ? ServeaseLogoDark : ServeaseLogo;

  return (
    <>
      <style>{`
        @media (min-width: 768px) {
          #admin-desktop-sidebar { display: flex !important; }
          #admin-mobile-header   { display: none !important; }
        }
      `}</style>

      <div className="flex h-screen overflow-hidden" style={{ background: bg }}>
        <aside
          id="admin-desktop-sidebar"
          className="hidden flex-col shrink-0"
          style={{ width: 248, background: sidebarBg, borderRight: `1px solid ${border}` }}
        >
          <div className="flex-1 overflow-x-visible pt-6 overflow-y-auto">
            <AdminSidebarContent isDark={isDark} />
          </div>
        </aside>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-40"
                style={{ background: "rgba(0,0,0,0.5)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                className="fixed inset-y-0 left-0 z-50 flex flex-col"
                style={{ width: 260, background: sidebarBg, borderRight: `1px solid ${border}` }}
                initial={{ x: -260 }}
                animate={{ x: 0 }}
                exit={{ x: -260 }}
                transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
              >
                <button
                  onClick={() => setMobileOpen(false)}
                  className="absolute top-4 right-[-44px] w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer"
                  style={{ background: sidebarBg, color: isDark ? "#fff" : "#1B244C" }}
                >
                  <X size={18} />
                </button>
                <div className="flex-1 overflow-y-auto pt-6">
                  <AdminSidebarContent isDark={isDark} onNavClick={() => setMobileOpen(false)} />
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header
            id="admin-mobile-header"
            className="flex items-center gap-3 px-4 h-14 shrink-0"
            style={{ borderBottom: `1px solid ${border}`, background: sidebarBg }}
          >
            <button
              onClick={() => setMobileOpen(true)}
              className="w-9 h-9 rounded-[10px] border-none flex items-center justify-center cursor-pointer"
              style={{ background: isDark ? "#273570" : "#F6F8F8", color: isDark ? "#FFFFFF" : "#1B244C" }}
            >
              <Menu size={19} />
            </button>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div
                className="w-7 h-7 rounded-[7px] flex items-center justify-center p-[5px] shrink-0"
                style={{ border: "1.5px solid #2EBCCC", background: "rgba(46,188,204,0.08)" }}
              >
                <img src={headerLogo} alt="Servease" className="w-full h-full object-contain" />
              </div>
              <span className="font-extrabold text-[0.95rem] truncate" style={{ color: isDark ? "#FFFFFF" : "#1B244C" }}>
                Panel Admin
              </span>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <Outlet context={{ isDark }} />
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminLayout;
