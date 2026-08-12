
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, BellOff, ChevronRight, X } from "lucide-react";
import { useI18n } from "../../../i18n";
import IconTooltip from "../../tooltip/IconTooltip";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchNotificaciones,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,
  type Notificacion,
} from "../../../api/notificacionApi";
import {
  toNotificationItem,
  resolveNotificationPath,
  type NotificationItem,
} from "../../../utils/notifications";
import { ROUTES } from "../../../router/routes";
import { useRealtimeChannel } from "../../../hooks/useRealtimeChannel";
import { useUnreadNotificationCount } from "../../../hooks/useUnreadNotificationCount";
import LiveTimeAgo from "../../livetimeago/LiveTimeAgo";
import { useCachedResource } from "../../../hooks/useCachedResource";

const POPOVER_PAGE_SIZE = 15;

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
  onClick,
}: {
  notif: NotificationItem;
  isLast: boolean;
  isDark: boolean;
  c: Colors;
  onClick: () => void;
}) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
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
        <LiveTimeAgo
          date={notif.date}
          style={{
            fontSize: "0.71rem",
            color: notif.dotColor,
            fontWeight: 600,
          }}
        />
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
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimatedIn, setIsAnimatedIn] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);
  const [viewAllHovered, setViewAllHovered] = useState(false);
  const [panelPos, setPanelPos] = useState({ top: 0, right: 0 });
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 500 : false,
  );

  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const { t } = useI18n();
  const h = t("homescreen");
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    data: raw,
    setData: setRaw,
    error: loadErrorObj,
  } = useCachedResource<Notificacion[]>(
    user?.id ? `notificaciones:${user.id}` : null,
    () => fetchNotificaciones({ page_size: POPOVER_PAGE_SIZE }).then((r) => r.results),
  );
  const loadError = !!loadErrorObj;

  const notifications: NotificationItem[] = useMemo(
    () => (raw ?? []).map(toNotificationItem),
    [raw],
  );

  // Independiente de la lista (que solo trae la primera página) — así el
  // badge nunca queda corto solo porque el popover no cargó todo.
  const unreadCount = useUnreadNotificationCount();

  useEffect(() => {
    if (loadErrorObj) console.error("fetchNotificaciones failed:", loadErrorObj);
  }, [loadErrorObj]);

  useRealtimeChannel<Notificacion>({
    table: "notificacion",
    event: "INSERT",
    filter: user ? `id_usuario=eq.${user.id}` : undefined,
    enabled: !!user,
    onChange: (payload) => {
      setRaw((prev) => [payload.new as Notificacion, ...(prev ?? [])]);
    },
  });

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

  const markAllRead = () => {
    const previous = raw;
    setRaw((prev) => (prev ?? []).map((n) => ({ ...n, leido: true })));
    marcarTodasNotificacionesLeidas().catch((error) => {
      console.error("marcarTodasNotificacionesLeidas failed:", error);
      setRaw(previous ?? []);
    });
  };

  const markRead = (id: number) => {
    const previous = raw;
    setRaw((prev) =>
      (prev ?? []).map((n) =>
        n.id_notificacion === id ? { ...n, leido: true } : n,
      ),
    );
    marcarNotificacionLeida(id).catch((error) => {
      console.error("marcarNotificacionLeida failed:", error);
      setRaw(previous ?? []);
    });
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    if (!notif.read) markRead(notif.id);
    close();
    navigate(resolveNotificationPath(notif, user?.role));
  };

  return (
    <>
      <style>{`@keyframes notif-spin { to { transform: rotate(360deg); } }`}</style>

      <IconTooltip
        label={h.tooltips.notifications}
        isDark={isDark}
        disabled={isOpen || isMobile}
      >
        {({ ref, onMouseEnter, onMouseLeave }, hovered) => (
          <button
            ref={(el) => {
              (ref as React.MutableRefObject<HTMLButtonElement | null>).current = el;
              (buttonRef as React.MutableRefObject<HTMLButtonElement | null>).current = el;
            }}
            onClick={toggle}
            onMouseEnter={() => { setBtnHovered(true); onMouseEnter(); }}
            onMouseLeave={() => { setBtnHovered(false); onMouseLeave(); }}
            className={hovered || btnHovered ? "icon-shake" : ""}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              border: `1px solid ${c.divider}`,
              background:
                isOpen || hovered ? "rgba(46,188,204,0.08)" : c.inputBg,
              color: isOpen || hovered ? "#2EBCCC" : c.secondary,
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
        )}
      </IconTooltip>

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
              width: isMobile ? "calc(100vw - 16px)" : 420,
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
                flexShrink: 0,
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

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexShrink: 0,
                }}
              >
                <button
                  onClick={markAllRead}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#2EBCCC",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: unreadCount > 0 ? "flex" : "none",
                    alignItems: "center",
                    gap: 4,
                    fontFamily: "inherit",
                    padding: "5px 8px",
                    borderRadius: 8,
                    transition: "background 0.2s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(46,188,204,0.12)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "none")
                  }
                >
                  <CheckCheck size={13} />
                  {h.notifications.markAllRead}
                </button>

                <button
                  onClick={close}
                  aria-label="close"
                  style={{
                    background: "none",
                    border: "none",
                    color: c.secondary,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 6,
                    borderRadius: 8,
                    fontFamily: "inherit",
                    transition: "color 0.2s, background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#2EBCCC";
                    e.currentTarget.style.background = isDark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = c.secondary;
                    e.currentTarget.style.background = "none";
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div
              style={{
                maxHeight: isMobile ? "55vh" : 420,
                overflowY: "auto",
              }}
            >
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
                  {loadError ? h.notifications.loadFailed : h.notifications.empty}
                </div>
              ) : (
                notifications.map((notif, i) => (
                  <NotificationRow
                    key={notif.id}
                    notif={notif}
                    isLast={i === notifications.length - 1}
                    isDark={isDark}
                    c={c}
                    onClick={() => handleNotificationClick(notif)}
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
                onClick={() => {
                  close();
                  navigate(ROUTES.APP.NOTIFICATIONS);
                }}
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
