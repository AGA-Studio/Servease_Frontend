// Mobile sidebar drawer with backdrop overlay, slide-in animation, and body scroll lock when open.

import { useEffect } from "react";
import { X } from "lucide-react";
import SidebarContent from "./SidebarContent";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

const MobileSidebar: React.FC<Props> = ({ isOpen, onClose, isDark }) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const bg = isDark ? "#1B244C" : "#FFFFFF";
  const border = isDark ? "#273570" : "#CCCCCC";

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 backdrop-blur-[4px]"
          style={{
            background: "rgba(0,0,0,0.5)",
            animation: "fadeIn 0.2s ease",
          }}
        />
      )}
      <aside
        id="mobile-sidebar"
        className="fixed top-0 left-0 h-full w-[260px] z-50 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          background: bg,
          borderRight: `1px solid ${border}`,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <div className="flex items-center justify-end px-4 pt-4 pb-2">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[8px] border-none flex items-center justify-center cursor-pointer"
            style={{
              background: isDark ? "#273570" : "#F6F8F8",
              color: isDark ? "#EFEFEF" : "#1B244C",
            }}
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pt-2">
          <SidebarContent
            isCollapsed={false}
            isDark={isDark}
            onNavClick={onClose}
            onToggle={() => {}}
            onExpand={() => {}}
          />
        </div>
      </aside>
    </>
  );
};

export default MobileSidebar;
