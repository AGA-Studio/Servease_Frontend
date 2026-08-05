import { useEffect, useState, useCallback } from "react";
import { listConversations, archiveConversation, type Conversation } from "../api/messagesApi";
import { useChatWebSocket } from "../hooks/useChatWebSocket";
import type { ChatListItem } from "../types/messaging";

interface ConversationListProps {
  activeId: string | null;
  onSelect: (id: string) => void;
  onArchive?: (id: string) => void;
}

function mapToChatListItem(conv: Conversation): ChatListItem {
  const other = conv.cliente.id === "current-user-id" ? conv.proveedor : conv.cliente;
  return {
    id: conv.id_conversacion,
    name: `${other.nombre} ${other.apellido_paterno}`,
    avatar: other.url_foto_perfil || `https://ui-avatars.com/api/?name=${other.nombre}+${other.apellido_paterno}&background=2EBCCC&color=fff`,
    professionKey: "profesion",
    lastMessagePreview: conv.ultimo_mensaje_preview || "Sin mensajes",
    timeAgoKey: "hace un momento",
    unreadCount: conv.unread_count,
  };
}

export default function ConversationList({ activeId, onSelect, onArchive }: ConversationListProps) {
  const [conversations, setConversations] = useState<ChatListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listConversations();
      setConversations(data.map(mapToChatListItem));
    } catch (err) {
      setError("Error al cargar conversaciones");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // WebSocket for real-time updates
  useChatWebSocket({
    conversationId: activeId || "",
    onMessage: (msg) => {
      // Update conversation list with new message preview
      setConversations((prev) =>
        prev.map((c) =>
          c.id === msg.conversacion
            ? { ...c, lastMessagePreview: msg.text, unreadCount: c.unreadCount + 1 }
            : c
        )
      );
    },
    onError: (err) => console.error("WS error:", err),
    onClose: () => console.log("WS closed"),
  });

  const handleArchive = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("¿Archivar esta conversación?")) return;
    try {
      await archiveConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      onArchive?.(id);
    } catch (err) {
      console.error(err);
      alert("Error al archivar");
    }
  }, []);

  if (isLoading) {
    return (
      <div className="conv-list-loading" style={styles.loading}>
        <div className="spinner" />
        <span>Cargando conversaciones...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="conv-list-error" style={styles.error}>
        <p>{error}</p>
        <button onClick={loadConversations} style={styles.retryBtn}>
          Reintentar
        </button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="conv-list-empty" style={styles.empty}>
        <p>No hay conversaciones aún</p>
        <p style={styles.emptyHint}>Inicia una conversación desde un perfil de proveedor</p>
      </div>
    );
  }

  return (
    <div className="conversation-list" style={styles.container}>
      {conversations.map((conv) => (
        <div
          key={conv.id}
          className={`conv-item ${conv.id === activeId ? "active" : ""}`}
          style={{
            ...styles.item,
            ...(conv.id === activeId ? styles.itemActive : {}),
          }}
          onClick={() => onSelect(conv.id)}
        >
          <div style={styles.avatarWrapper}>
            <img src={conv.avatar} alt={conv.name} style={styles.avatar} />
            {conv.unreadCount > 0 && (
              <span className="unread-badge" style={styles.unreadBadge}>
                {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
              </span>
            )}
          </div>
          <div style={styles.content}>
            <div style={styles.header}>
              <span style={styles.name}>{conv.name}</span>
              <span style={styles.time}>{conv.timeAgoKey}</span>
            </div>
            <div style={styles.preview}>{conv.lastMessagePreview}</div>
          </div>
          <button
            onClick={(e) => handleArchive(conv.id, e)}
            style={styles.archiveBtn}
            aria-label="Archivar conversación"
            title="Archivar"
          >
            📦
          </button>
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflowY: "auto",
    background: "var(--main-bg)",
  },
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    gap: 12,
    color: "var(--text-secondary)",
  },
  error: {
    padding: 24,
    textAlign: "center",
    color: "#ef4444",
  },
  retryBtn: {
    marginTop: 12,
    padding: "8px 16px",
    background: "#2EBCCC",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
  empty: {
    padding: 32,
    textAlign: "center",
    color: "var(--text-secondary)",
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    borderBottom: "1px solid var(--divider)",
    cursor: "pointer",
    transition: "background 0.15s",
    position: "relative",
  },
  itemActive: {
    background: "rgba(46, 188, 204, 0.08)",
  },
  avatarWrapper: {
    position: "relative",
    flexShrink: 0,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    objectFit: "cover",
  },
  unreadBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    background: "#ef4444",
    color: "white",
    fontSize: "0.7rem",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 5px",
  },
  content: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontWeight: 600,
    fontSize: "0.9rem",
    color: "var(--text)",
  },
  time: {
    fontSize: "0.7rem",
    color: "var(--text-secondary)",
    whiteSpace: "nowrap",
  },
  preview: {
    fontSize: "0.8rem",
    color: "var(--text-secondary)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%",
  },
  archiveBtn: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    fontSize: "1.1rem",
    cursor: "pointer",
    opacity: 0,
    transition: "opacity 0.2s",
    padding: 4,
    borderRadius: 8,
  },
  item: {
    ...{} as React.CSSProperties,
    "&:hover .archiveBtn": { opacity: 1 },
  },
};
