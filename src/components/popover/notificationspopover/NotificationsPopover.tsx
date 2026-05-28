// Custom notifications popover built from scratch in Servease style

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Bell, CheckCheck, BellOff, ChevronRight } from "lucide-react";
import { useI18n } from "../../../i18n";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timeAgo: string;
  read: boolean;
  dotColor: string;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "New counteroffer",
    message:
      "Mike S. submitted a counteroffer for 'Emergency Plumber'. Price: $450",
    timeAgo: "10 min ago",
    read: false,
    dotColor: "#2EBCCC",
  },
  {
    id: "2",
    title: "Service completed",
    message: "'Urgent Locksmith' service was successfully completed.",
    timeAgo: "2 hours ago",
    read: false,
    dotColor: "#4AA825",
  },
  {
    id: "3",
    title: "New message",
    message: "Sara J. sent you a message about 'Children's Party'.",
    timeAgo: "Yesterday",
    read: true,
    dotColor: "#FFB200",
  },
];

interface Colors {
  cardBg: string;
  inputBg: string;
  text: string;
  secondary: string;
  divider: string;
  sidebarBg: string;
}

const NotificationRow = ({
  notif,
  isLast,
  isDark,
  c,
}: {
  notif: NotificationItem;
  isLast: boolean;
  isDark: boolean;
  c: Colors;
}) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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

interface Props {
  isDark: boolean;
}

const TRANSITION_MS = 210;

const NotificationsPopover = ({ isDark }: Props) => {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimatedIn, setIsAnimatedIn] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);
  const [panelPos, setPanelPos] = useState({ top: 0, right: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [viewAllHovered, setViewAllHovered] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const { t } = useI18n();
  const h = t("homescreen");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const c: Colors = {
    cardBg: isDark ? "#1e2d5e" : "#ffffff",
    inputBg: isDark ? "#273570" : "#F8FAFC",
    text: isDark ? "#ffffff" : "#000000",
    secondary: "#989898",
    divider: isDark ? "#273570" : "#e5e7eb",
    sidebarBg: isDark ? "#1B244C" : "#ffffff",
  };

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const mobile = window.innerWidth < 500;
    setIsMobile(mobile);
    setPanelPos({
      top: rect.bottom + 8,
      right: mobile ? 8 : window.innerWidth - rect.right,
    });
  }, []);

  const open = () => {
    updatePosition();
    setIsOpen(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsAnimatedIn(true));
    });
  };

  const close = useCallback(() => {
    setIsAnimatedIn(false);
    setTimeout(() => setIsOpen(false), TRANSITION_MS);
  }, []);

  const toggle = () => (isOpen ? close() : open());

  useEffect(() => {
    if (!isOpen) return;

    const onClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current?.contains(e.target as Node) ||
        buttonRef.current?.contains(e.target as Node)
      )
        return;
      close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onScroll = () => updatePosition();

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, close, updatePosition]);

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggle}
        onMouseEnter={() => setBtnHovered(true)}
        onMouseLeave={() => setBtnHovered(false)}
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          border: `1px solid ${c.divider}`,
          background:
            isOpen || btnHovered ? "rgba(46,188,204,0.08)" : c.inputBg,
          color: isOpen || btnHovered ? "#2EBCCC" : c.secondary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.2s",
          flexShrink: 0,
          position: "relative",
          outline: "none",
          fontFamily: "inherit",
        }}
      >
        <Bell size={18} />
        <span
          style={{
            position: "absolute",
            top: 9,
            right: 9,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#FF4444",
            border: `2px solid ${c.sidebarBg}`,
            transform: unreadCount > 0 ? "scale(1)" : "scale(0)",
            transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              position: "fixed",
              top: panelPos.top,
              right: panelPos.right,
              left: isMobile ? 8 : "auto",
              zIndex: 9999,
              width: isMobile ? "calc(100vw - 16px)" : 380,
              background: c.cardBg,
              borderRadius: 16,
              border: `1px solid ${c.divider}`,
              boxShadow: isDark
                ? "0 12px 40px rgba(0,0,0,0.55)"
                : "0 12px 40px rgba(0,0,0,0.13)",
              overflow: "hidden",
              fontFamily: "inherit",
              opacity: isAnimatedIn ? 1 : 0,
              transform: isAnimatedIn
                ? "translateY(0) scale(1)"
                : "translateY(-10px) scale(0.96)",
              transformOrigin: isMobile ? "top center" : "top right",
              transition: `opacity ${TRANSITION_MS}ms ease, transform ${TRANSITION_MS}ms cubic-bezier(0.16,1,0.3,1)`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                padding: "16px 20px",
                borderBottom: `1px solid ${c.divider}`,
                flexWrap: "nowrap",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: c.text,
                    whiteSpace: "nowrap",
                  }}
                >
                  {h.notifications.title}
                </span>
                <span
                  style={{
                    background: "#2EBCCC",
                    color: "#fff",
                    borderRadius: 20,
                    padding: "2px 8px",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    flexShrink: 0,
                    opacity: unreadCount > 0 ? 1 : 0,
                    transform: unreadCount > 0 ? "scale(1)" : "scale(0.7)",
                    transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                    display: "inline-block",
                  }}
                >
                  {unreadCount}
                </span>
              </div>

              <button
                onClick={markAllRead}
                style={{
                  background: "none",
                  border: "none",
                  color: "#2EBCCC",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontFamily: "inherit",
                  padding: "5px 8px",
                  borderRadius: 8,
                  opacity: unreadCount > 0 ? 1 : 0,
                  pointerEvents: unreadCount > 0 ? "auto" : "none",
                  transition: "opacity 0.2s, background 0.2s",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(46,188,204,0.12)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "none")
                }
              >
                <CheckCheck size={13} style={{ flexShrink: 0 }} />
                {h.notifications.markAllRead}
              </button>
            </div>

            <div style={{ maxHeight: 300, overflowY: "auto" }}>
              {notifications.length === 0 ? (
                <div
                  style={{
                    padding: "40px 20px",
                    textAlign: "center",
                    color: c.secondary,
                    fontSize: "0.85rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <BellOff
                    size={28}
                    color={c.secondary}
                    style={{ opacity: 0.45 }}
                  />
                  {h.notifications.empty}
                </div>
              ) : (
                notifications.map((notif, i) => (
                  <NotificationRow
                    key={notif.id}
                    notif={notif}
                    isLast={i === notifications.length - 1}
                    isDark={isDark}
                    c={c}
                  />
                ))
              )}
            </div>

            <div
              style={{
                padding: "12px 16px",
                borderTop: `1px solid ${c.divider}`,
              }}
            >
              <button
                onMouseEnter={() => setViewAllHovered(true)}
                onMouseLeave={() => setViewAllHovered(false)}
                style={{
                  width: "100%",
                  padding: "9px",
                  borderRadius: 10,
                  border: "none",
                  background: viewAllHovered
                    ? "rgba(46,188,204,0.10)"
                    : "transparent",
                  color: viewAllHovered ? "#2EBCCC" : c.secondary,
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                }}
              >
                {h.notifications.viewAll}
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default NotificationsPopover;
