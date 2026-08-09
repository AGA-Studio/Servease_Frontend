import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Bell, BellOff, CheckCheck, ChevronRight } from "lucide-react";
import { useI18n } from "../../i18n";
import { useThemeMode } from "../../theme/useThemeMode";
import { useAuth } from "../../context/AuthContext";
import {
  fetchNotificaciones,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,
  type Notificacion,
} from "../../api/notificacionApi";
import {
  toNotificationItem,
  resolveNotificationPath,
  type NotificationItem,
} from "../../utils/notifications";
import EmptyState from "../../components/emptystate/EmptyState";
import { useRealtimeChannel } from "../../hooks/useRealtimeChannel";
import LiveTimeAgo from "../../components/livetimeago/LiveTimeAgo";

const EASE = [0.22, 1, 0.36, 1] as const;

const NotificationsScreen: React.FC = () => {
  const { isDark } = useThemeMode();
  const { t } = useI18n();
  const ns = t("notificationsscreen");
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const highlightId = (location.state as { highlightId?: number } | null)
    ?.highlightId;

  useEffect(() => {
    let cancelled = false;
    fetchNotificaciones()
      .then((data) => {
        if (!cancelled) setNotifications(data.map(toNotificationItem));
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("fetchNotificaciones failed:", error);
        setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useRealtimeChannel<Notificacion>({
    table: "notificacion",
    event: "INSERT",
    filter: user ? `id_usuario=eq.${user.id}` : undefined,
    enabled: !!user,
    onChange: (payload) => {
      const nueva = toNotificationItem(payload.new as Notificacion);
      setNotifications((prev) => [nueva, ...prev]);
    },
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    const previous = notifications;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    marcarTodasNotificacionesLeidas().catch((error) => {
      console.error("marcarTodasNotificacionesLeidas failed:", error);
      setNotifications(previous);
    });
  };

  const markRead = (id: number) => {
    const previous = notifications;
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    marcarNotificacionLeida(id).catch((error) => {
      console.error("marcarNotificacionLeida failed:", error);
      setNotifications(previous);
    });
  };

  const handleClick = (notif: NotificationItem) => {
    if (!notif.read) markRead(notif.id);
    navigate(resolveNotificationPath(notif, user?.role));
  };

  return (
    <div className="nfy-root">
      <style>{`
        .nfy-root {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }
        .nfy-topbar {
          padding: 20px 28px;
          border-bottom: 1px solid var(--divider);
          background: var(--sidebar-bg);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-shrink: 0;
          flex-wrap: wrap;
        }
        .nfy-content {
          flex: 1;
          overflow-y: auto;
          padding: 28px;
          background: var(--main-bg);
        }
        @media (max-width: 600px) {
          .nfy-topbar { padding: 14px 16px; }
          .nfy-content { padding: 14px; }
        }
      `}</style>

      <div className="nfy-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Bell size={20} color="#2EBCCC" />
          <span
            style={{
              fontWeight: 800,
              fontSize: "1.15rem",
              color: "var(--text)",
            }}
          >
            {ns.title}
          </span>
          {unreadCount > 0 && (
            <span
              style={{
                background: "#2EBCCC",
                color: "#fff",
                borderRadius: 20,
                padding: "2px 9px",
                fontSize: "0.75rem",
                fontWeight: 700,
              }}
            >
              {unreadCount}
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            style={{
              background: "none",
              border: "none",
              color: "#2EBCCC",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 12px",
              borderRadius: 8,
              fontFamily: "inherit",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(46,188,204,0.10)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <CheckCheck size={15} />
            {ns.markAllRead}
          </button>
        )}
      </div>

      <div className="nfy-content">
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  height: 74,
                  borderRadius: 14,
                  background: "var(--card-bg, var(--sidebar-bg))",
                  border: "1px solid var(--divider)",
                  opacity: 1 - i * 0.12,
                }}
              />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<BellOff size={28} color="#2EBCCC" />}
            isDark={isDark}
            title={ns.empty.title}
            subtitle={loadError ? ns.loadFailed : ns.empty.subtitle}
          />
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              maxWidth: 720,
              margin: "0 auto",
            }}
          >
            {notifications.map((notif, i) => (
              <NotificationCard
                key={notif.id}
                notif={notif}
                index={i}
                isDark={isDark}
                highlighted={notif.id === highlightId}
                onClick={() => handleClick(notif)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const NotificationCard = ({
  notif,
  index,
  isDark,
  highlighted,
  onClick,
}: {
  notif: NotificationItem;
  index: number;
  isDark: boolean;
  highlighted?: boolean;
  onClick: () => void;
}) => {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlighted)
      ref.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [highlighted]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={
        highlighted
          ? {
              opacity: 1,
              y: 0,
              boxShadow: [
                "0 0 0 0px rgba(46,188,204,0.5)",
                "0 0 0 6px rgba(46,188,204,0)",
              ],
            }
          : { opacity: 1, y: 0 }
      }
      transition={
        highlighted
          ? {
              opacity: { duration: 0.3, ease: EASE },
              y: { duration: 0.3, ease: EASE },
              boxShadow: { duration: 1.1, repeat: 2, ease: "easeOut" },
            }
          : { duration: 0.3, delay: Math.min(index * 0.03, 0.3), ease: EASE }
      }
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        padding: "16px 18px",
        borderRadius: 14,
        border: highlighted ? "1px solid #2EBCCC" : "1px solid var(--divider)",
        cursor: "pointer",
        background: hovered
          ? isDark
            ? "rgba(255,255,255,0.04)"
            : "rgba(46,188,204,0.04)"
          : !notif.read || highlighted
            ? isDark
              ? "rgba(46,188,204,0.06)"
              : "rgba(46,188,204,0.035)"
            : "var(--sidebar-bg)",
        transition: "background 0.15s, border-color 0.3s",
      }}
    >
      <div style={{ paddingTop: 5, flexShrink: 0 }}>
        <div
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: notif.read ? "transparent" : notif.dotColor,
            border: `2.5px solid ${notif.read ? "var(--divider)" : notif.dotColor}`,
          }}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: notif.read ? 500 : 700,
            fontSize: "0.92rem",
            color: "var(--text)",
            marginBottom: 4,
            overflowWrap: "anywhere",
            wordBreak: "break-word",
          }}
        >
          {notif.title}
        </div>
        <div
          style={{
            fontSize: "0.84rem",
            color: "var(--text-secondary)",
            lineHeight: 1.5,
            marginBottom: 6,
            overflowWrap: "anywhere",
            wordBreak: "break-word",
          }}
        >
          {notif.message}
        </div>
        <LiveTimeAgo
          date={notif.date}
          style={{
            fontSize: "0.74rem",
            color: notif.dotColor,
            fontWeight: 600,
          }}
        />
      </div>

      <ChevronRight
        size={15}
        color="var(--text-secondary)"
        style={{
          flexShrink: 0,
          marginTop: 5,
          opacity: hovered ? 1 : 0.4,
          transition: "opacity 0.15s, transform 0.15s",
          transform: hovered ? "translateX(2px)" : "none",
        }}
      />
    </motion.div>
  );
};

export default NotificationsScreen;
