// Desktop sidebar with collapsible state, hamburger toggle on logo hover, click-outside to close, and persistent collapse preference via localStorage.

import { useState, useEffect, useRef } from "react";
import SidebarContent from "./SidebarContent";

interface Props {
  isDark: boolean;
}

const Sidebar: React.FC<Props> = ({ isDark }) => {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("servease-sidebar-collapsed") === "true",
  );
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    localStorage.setItem("servease-sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    if (collapsed) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setCollapsed(true);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [collapsed]);

  const bg = isDark ? "#1B244C" : "#FFFFFF";
  const border = isDark ? "#273570" : "#CCCCCC";

  return (
    <aside
      ref={ref}
      id="desktop-sidebar"
      className="hidden flex-col shrink-0 relative transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={{
        width: collapsed ? 72 : 240,
        background: bg,
        borderRight: `1px solid ${border}`,
      }}
    >
      <div className="flex-1 overflow-x-visible pt-6">
        <SidebarContent
          isCollapsed={collapsed}
          isDark={isDark}
          onNavClick={() => {}}
          onToggle={() => setCollapsed((c) => !c)}
          onExpand={() => setCollapsed(false)}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
