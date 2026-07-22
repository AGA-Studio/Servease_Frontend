import { RefreshCw } from "lucide-react";
import SearchBar from "../../../../components/searchbar/SearchBar";
import NotificationsPopover from "../../../../components/popover/notificationspopover/NotificationsPopover";
import IconTooltip from "../../../../components/tooltip/IconTooltip";
import { useI18n } from "../../../../i18n";
import { useAuth } from "../../../../context/AuthContext";

interface DashboardTopBarProps {
  isDark: boolean;
  onRefresh?: () => void;
}

export const DashboardTopBar = ({ isDark, onRefresh }: DashboardTopBarProps) => {
  const { t } = useI18n();
  const d = t("dashboardscreen");
  const { user } = useAuth();

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="ds-topbar"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "20px 28px",
        borderBottom: "1px solid var(--divider)",
        background: "var(--sidebar-bg)",
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: "1 1 auto", minWidth: 200 }}>
        <div
          style={{
            fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)",
            fontWeight: 800,
            color: "var(--text)",
            marginBottom: 2,
          }}
        >
          {d.title}, {user?.firstName || "provider"}!
        </div>
        <div
          style={{
            fontSize: "0.78rem",
            color: "var(--text-secondary)",
            textTransform: "capitalize",
          }}
        >
          {today}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flex: "2 1 300px",
          justifyContent: "flex-end",
        }}
      >
        <div style={{ flex: 1, maxWidth: 420, minWidth: 180 }}>
          <SearchBar
            isDark={isDark}
            placeholder={d.searchPlaceholder}
            hintText="Press Escape to close"
            suggestions={[
              { id: "1", label: "Plumbing", description: "Home services", tag: "Service" },
              { id: "2", label: "Electrician", description: "Home services", tag: "Service" },
              { id: "3", label: "Cleaning", description: "Home services", tag: "Service" },
              { id: "4", label: "Locksmith", description: "Urgent jobs", tag: "Job" },
            ]}
            onSearch={(q) => console.log("dashboard search:", q)}
            onSelect={(s) => console.log("dashboard selected:", s)}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <IconTooltip label={d.tooltips.refresh} isDark={isDark}>
            {({ ref, onMouseEnter, onMouseLeave }, hovered) => (
              <button
                ref={ref}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onClick={onRefresh}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  border: "1px solid var(--divider)",
                  background: hovered ? "var(--input-bg)" : "transparent",
                  color: "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontFamily: "inherit",
                  flexShrink: 0,
                }}
              >
                <RefreshCw size={18} />
              </button>
            )}
          </IconTooltip>

          <NotificationsPopover isDark={isDark} />
        </div>
      </div>
    </div>
  );
};
