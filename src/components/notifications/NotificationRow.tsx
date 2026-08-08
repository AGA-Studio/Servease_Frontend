
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { NotificationItem } from "../../api/notificationApi";

export interface NotificationColors {
  cardBg: string;
  inputBg: string;
  text: string;
  secondary: string;
  divider: string;
  sidebarBg: string;
}

interface Props {
  notif: NotificationItem;
  isLast: boolean;
  isDark: boolean;
  c: NotificationColors;
  onClick?: (item: NotificationItem) => void;
}

const NotificationRow = ({ notif, isLast, isDark, c, onClick }: Props) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick?.(notif)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "14px 20px",
        borderBottom: isLast ? "none" : `1px solid ${c.divider}`,
        background: hovered
          ? isDark
            ? "rgba(255,255,255,0.04)"
            : "rgba(0,0,0,0.02)"
          : !notif.read
            ? isDark
              ? "rgba(46,188,204,0.06)"
              : "rgba(46,188,204,0.04)"
            : "transparent",
        cursor: "pointer",
        transition: "background 0.15s",
      }}
    >
      <div style={{ paddingTop: 5, flexShrink: 0 }}>
        <div
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: notif.read ? "transparent" : notif.dotColor,
            border: `2.5px solid ${notif.read ? c.divider : notif.dotColor}`,
            transition: "all 0.3s",
          }}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: notif.read ? 500 : 700,
            fontSize: "0.84rem",
            color: c.text,
            marginBottom: 3,
          }}
        >
          {notif.title}
        </div>
        <div
          style={{
            fontSize: "0.78rem",
            color: c.secondary,
            lineHeight: 1.45,
            marginBottom: 5,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {notif.message}
        </div>
        <div
          style={{
            fontSize: "0.71rem",
            color: notif.dotColor,
            fontWeight: 600,
          }}
        >
          {notif.timeAgo}
        </div>
      </div>

      <ChevronRight
        size={14}
        color={c.secondary}
        style={{
          flexShrink: 0,
          marginTop: 4,
          opacity: hovered ? 1 : 0.4,
          transition: "opacity 0.15s, transform 0.15s",
          transform: hovered ? "translateX(2px)" : "none",
        }}
      />
    </div>
  );
};

export default NotificationRow;
