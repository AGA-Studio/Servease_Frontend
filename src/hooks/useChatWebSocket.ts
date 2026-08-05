import { useEffect, useRef, useState, useCallback } from "react";
import { getAccessToken } from "../lib/authToken";
import type { Message } from "../api/messagesApi";

interface UseChatWebSocketOptions {
  conversationId: string;
  onMessage: (message: Message) => void;
  onError?: (error: Event) => void;
  onClose?: () => void;
}

export function useChatWebSocket({
  conversationId,
  onMessage,
  onError,
  onClose,
}: UseChatWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        console.warn("No session available for WebSocket");
        return;
      }

      const wsBaseUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8000";
      const wsUrl = `${wsBaseUrl}/ws/mensajeria/${conversationId}/?token=${token}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.error) {
            console.error("WebSocket error:", data.error);
            return;
          }
          onMessage(data);
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      ws.onerror = (error) => {
        onError?.(error);
      };

      ws.onclose = () => {
        setIsConnected(false);
        onClose?.();

        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };
    } catch (err) {
      console.error("Failed to establish WebSocket:", err);
    }
  }, [conversationId, onMessage, onError, onClose]);

  const sendMessage = useCallback((content: string) => {
    const ws = wsRef.current;
    if (ws !== null && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: "new_message", contenido: content }));
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    wsRef.current?.close();
    wsRef.current = null;
    setIsConnected(false);
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { isConnected, sendMessage, disconnect, connect };
}
