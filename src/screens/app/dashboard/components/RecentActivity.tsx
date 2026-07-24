import { Inbox, RotateCcw } from "lucide-react";
import type { DashboardActivity } from "../../../../types/dashboard";
import { useI18n } from "../../../../i18n";
import { SkeletonLoader } from "./SkeletonLoader";
import EmptyState from "../../../../components/emptystate/EmptyState";

interface RecentActivityProps {
  activities: DashboardActivity[] | undefined;
  isLoading: boolean;
  isDark: boolean;
}

const ActivityDot = ({
  color,
  isFirst,
}: {
  color: string;
  isFirst: boolean;
}) => (
  <div
    style={{
      width: 14,
      height: 14,
      borderRadius: "50%",
      border: `3px solid ${color}`,
      background: isFirst ? color : "transparent",
      flexShrink: 0,
    }}
  />
);

export const RecentActivity = ({
  activities,
  isLoading,
  isDark,
}: RecentActivityProps) => {
  const { t } = useI18n();
  const d = t("dashboardscreen");

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <RotateCcw size={20} color="#2EBCCC" />
        <span
          style={{
            fontWeight: 700,
            fontSize: "1rem",
            color: "var(--text)",
          }}
        >
          {d.recentActivity}
        </span>
      </div>

      {isLoading ? (
        <SkeletonLoader isDark={isDark} variant="activity" />
      ) : !activities?.length ? (
        <div
          style={{
            background: "var(--card-bg)",
            borderRadius: 16,
            border: "1px solid var(--divider)",
          }}
        >
          <EmptyState
            icon={<Inbox size={22} color="#2EBCCC" />}
            isDark={isDark}
            title={d.empty.activity.title}
            subtitle={d.empty.activity.description}
            size="compact"
          />
        </div>
      ) : (
        <div
          className="ds-recent-activity-card"
          style={{
            background: "var(--card-bg)",
            borderRadius: 16,
            border: "1px solid var(--divider)",
            padding: 20,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {activities?.map((act, i) => (
              <div
                key={act.id}
                className="ds-activity-row"
                style={{
                  display: "flex",
                  gap: 14,
                  paddingBottom: i < (activities?.length ?? 0) - 1 ? 18 : 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <ActivityDot color={act.dotColor} isFirst={i === 0} />
                  {i < (activities?.length ?? 0) - 1 && (
                    <div
                      style={{
                        width: 2,
                        flex: 1,
                        background: "var(--divider)",
                        marginTop: 4,
                      }}
                    />
                  )}
                </div>
                <div style={{ paddingBottom: 4 }}>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                      marginBottom: 3,
                    }}
                  >
                    {act.timeAgo}
                  </div>
                  <div
                    style={{
                      fontSize: "0.84rem",
                      color: "var(--text)",
                      lineHeight: 1.5,
                    }}
                  >
                    {act.highlight && (
                      <span
                        style={{ color: act.dotColor, fontWeight: 600 }}
                      >
                        {act.highlight}
                      </span>
                    )}
                    {act.content}
                  </div>
                  {act.extra && (
                    <div
                      style={{
                        marginTop: 6,
                        padding: "5px 10px",
                        background: "var(--input-bg)",
                        borderRadius: 8,
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                        display: "inline-block",
                      }}
                    >
                      {act.extra}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            className="load-btn"
            style={{
              width: "100%",
              marginTop: 18,
              padding: "10px",
              borderRadius: 10,
              border: "1.5px dashed var(--divider)",
              background: "transparent",
              color: "var(--text-secondary)",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.2s",
            }}
          >
            {d.loadOlder}
          </button>
        </div>
      )}
    </div>
  );
};
