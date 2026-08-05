import { useState, useEffect, useCallback } from "react";
import ConversationList from "../../components/ConversationList";
import ChatView from "../../components/ChatView";
import {
  listConversations,
  createConversation,
  archiveConversation,
  type Conversation,
} from "../../api/messagesApi";
import { useAuth } from "../../context/AuthContext";

export default function MessagesScreen() {
  const { user } = useAuth();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      const data = await listConversations();
      setConversations(data);
    } catch (err) {
      console.error("Error loading conversations:", err);
    }
  }, []);

  const handleSelectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
  }, []);

  const handleCreateConversation = useCallback(async (proveedorId: string) => {
    setIsLoading(true);
    try {
      const newConv = await createConversation({ proveedor_id: proveedorId });
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConv.id_conversacion);
    } catch (err) {
      console.error("Error creating conversation:", err);
      alert("Error al crear conversación");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleArchive = useCallback(async (id: string) => {
    try {
      await archiveConversation(id);
      setConversations((prev) => prev.filter((c) => c.id_conversacion !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
      }
    } catch (err) {
      console.error("Error archiving:", err);
    }
  }, [activeConversationId]);

  return (
    <div className="messages-screen" style={styles.container}>
      <div className="messages-header" style={styles.header}>
        <h1 style={styles.title}>Mensajes</h1>
      </div>

      <div className="messages-layout" style={styles.layout}>
        {/* Sidebar - Conversation List */}
        <aside className="conversations-sidebar" style={styles.sidebar}>
          <ConversationList
            activeId={activeConversationId}
            onSelect={handleSelectConversation}
            onArchive={handleArchive}
          />
        </aside>

        {/* Main - Chat View */}
        <main className="chat-main" style={styles.main}>
          <ChatView
            conversationId={activeConversationId}
            onSendMessage={() => {}}
          />
        </main>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    background: "var(--main-bg)",
  },
  header: {
    padding: "16px 24px",
    borderBottom: "1px solid var(--divider)",
    background: "var(--card-bg)",
  },
  title: {
    margin: 0,
    fontSize: "1.5rem",
    fontWeight: 800,
    color: "var(--text)",
  },
  layout: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
  },
  sidebar: {
    width: 380,
    minWidth: 320,
    maxWidth: 420,
    borderRight: "1px solid var(--divider)",
    background: "var(--card-bg)",
    display: "flex",
    flexDirection: "column",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: "var(--main-bg)",
    minWidth: 0,
  },
};

