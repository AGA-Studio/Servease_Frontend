import { useEffect, useRef, useState } from "react";
import { useChatWebSocket } from "../hooks/useChatWebSocket";
import MessageInput from "./MessageInput";
import { listMessages, markAsRead } from "../api/messagesApi";
import type { Message } from "../api/messagesApi";
import type { ChatMessage } from "../types/messaging";

interface ChatViewProps {
  conversationId: string | null;
  onSendMessage: (text: string) => void;
}

function mapApiMessageToChatMessage(msg: Message): ChatMessage {
  return {
    id: msg.id_mensaje,
    sender: msg.sender,
    senderName: msg.senderName,
    senderAvatar: "", // TODO: add avatar from API
    text: msg.contenido,
    time: new Date(msg.fecha).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    leido: msg.leido,
    editado: msg.editado,
  };
}

export default function ChatView({ conversationId, onSendMessage }: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load initial messages
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await listMessages(conversationId);
        const mapped = data.map(mapApiMessageToChatMessage).reverse(); // oldest first
        setMessages(mapped);
        // Mark as read after loading
        await markAsRead(conversationId);
      } catch (err) {
        setError("Error al cargar mensajes");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [conversationId]);

  // WebSocket for real-time messages
  const { isConnected, sendMessage } = useChatWebSocket({
    conversationId: conversationId || "",
    onMessage: (msg) => {
      const mapped = mapApiMessageToChatMessage(msg);
      setMessages((prev) => [...prev, mapped]);
    },
    onError: (err) => console.error("WS error:", err),
    onClose: () => console.log("WS closed"),
  });

  const handleSend = (text: string) => {
    if (!conversationId) return;
    sendMessage(text);
    onSendMessage(text);
  };

  if (!conversationId) {
    return (
      <div className="chat-empty" style={styles.empty}>
        <p>Selecciona una conversación para empezar a chatear</p>
      </div>
    );
  }

  return (
    <div className="chat-view" style={styles.container}>
      <div className="chat-header" style={styles.header}>
        <span style={styles.status}>
          {isConnected ? "🟢 Conectado" : "🔴 Desconectado"}
        </span>
      </div>

      <div className="chat-messages" style={styles.messages} role="log" aria-live="polite">
        {isLoading ? (
          <div style={styles.loading}>Cargando mensajes...</div>
        ) : error ? (
          <div style={styles.error}>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} style={styles.retryBtn}>
              Reintentar
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div style={styles.empty}>No hay mensajes aún. ¡Envía el primero!</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-message ${msg.sender}`}
              style={{
                ...styles.message,
                ...(msg.sender === "user" ? styles.messageOwn : styles.messageOther),
              }}
            >
              <div style={styles.messageHeader}>
                <span style={styles.senderName}>{msg.senderName}</span>
                <span style={styles.time}>{msg.time}</span>
              </div>
              <div style={styles.messageText}>{msg.text}</div>
              {msg.editado && <span style={styles.edited}>✏️ Editado</span>}
              {msg.sender === "user" && msg.leido && <span style={styles.read}>✓✓ Leído</span>}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSend={handleSend} disabled={!isConnected} placeholder="Escribe un mensaje..." />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    background: "var(--main-bg)",
    borderRadius: 12,
    overflow: "hidden",
    border: "1px solid var(--divider)",
  },
  header: {
    padding: "12px 16px",
    borderBottom: "1px solid var(--divider)",
    background: "var(--card-bg)",
  },
  status: {
    fontSize: "0.75rem",
    color: "var(--text-secondary)",
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  loading: {
    textAlign: "center",
    padding: 32,
    color: "var(--text-secondary)",
  },
  error: {
    textAlign: "center",
    padding: 32,
    color: "#ef4444",
  },
  retryBtn: {
    marginTop: 8,
    padding: "8px 16px",
    background: "#2EBCCC",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
  empty: {
    textAlign: "center",
    padding: 32,
    color: "var(--text-secondary)",
  },
  message: {
    maxWidth: "75%",
    padding: "10px 14px",
    borderRadius: 16,
    position: "relative",
  },
  messageOwn: {
    alignSelf: "flex-end",
    background: "#2EBCCC",
    color: "white",
    borderBottomRightRadius: 4,
  },
  messageOther: {
    alignSelf: "flex-start",
    background: "var(--card-bg)",
    color: "var(--text)",
    border: "1px solid var(--divider)",
    borderBottomLeftRadius: 4,
  },
  messageHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.7rem",
    marginBottom: 4,
    opacity: 0.7,
  },
  senderName: {
    fontWeight: 600,
  },
  time: {
    fontSize: "0.65rem",
  },
  messageText: {
    wordWrap: "break-word",
    lineHeight: 1.4,
  },
  edited: {
    fontSize: "0.6rem",
    opacity: 0.6,
    marginTop: 4,
  },
  read: {
    fontSize: "0.6rem",
    opacity: 0.8,
    marginTop: 4,
  },
  empty: {
    textAlign: "center",
    padding: 32,
    color: "var(--text-secondary)",
  },
};
