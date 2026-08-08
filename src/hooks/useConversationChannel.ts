import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Mensaje } from "../api/chatApi";

export interface TypingPayload {
  conversacion_id: string;
  user_id: string;
  user_name: string;
}

export interface ReadReceiptPayload {
  conversacion_id: string;
  reader_id: string;
  count: number;
}

interface UseConversationChannelOptions {
  conversacionId?: string;
  onNewMessage?: (message: Mensaje) => void;
  onTypingStart?: (payload: TypingPayload) => void;
  onTypingStop?: (payload: TypingPayload) => void;
  onReadReceipt?: (payload: ReadReceiptPayload) => void;
  enabled?: boolean;
}

export const useConversationChannel = ({
  conversacionId,
  onNewMessage,
  onTypingStart,
  onTypingStop,
  onReadReceipt,
  enabled = true,
}: UseConversationChannelOptions) => {
  useEffect(() => {
    if (!conversacionId || !enabled) return;

    const channelName = `conversacion-${conversacionId}`;
    let isSubscribed = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setupAndSubscribe = async () => {
      // 1. Limpiar cualquier instancia previa del canal en el cliente de Supabase
      const existingChannel = supabase
        .getChannels()
        .find((ch) => ch.topic === `realtime:${channelName}`);
      
      if (existingChannel) {
        await supabase.removeChannel(existingChannel);
      }

      if (!isSubscribed) return;

      // 2. Pasar el token JWT activo a Realtime
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (token) {
        await supabase.realtime.setAuth(token);
      }

      if (!isSubscribed) return;

      // 3. Crear y suscribirse al canal privado
      channel = supabase
        .channel(channelName, {
          config: {
            private: true,
          },
        })
        .on("broadcast", { event: "new_message" }, ({ payload }) => {
          if (onNewMessage && payload) onNewMessage(payload as Mensaje);
        })
        .on("broadcast", { event: "typing_start" }, ({ payload }) => {
          if (onTypingStart && payload) onTypingStart(payload as TypingPayload);
        })
        .on("broadcast", { event: "typing_stop" }, ({ payload }) => {
          if (onTypingStop && payload) onTypingStop(payload as TypingPayload);
        })
        .on("broadcast", { event: "read_receipt" }, ({ payload }) => {
          if (onReadReceipt && payload) onReadReceipt(payload as ReadReceiptPayload);
        })
        .subscribe((status, err) => {
          if (status === "SUBSCRIBED") {
            console.log(`[Realtime] Conectado exitosamente a ${channelName}`);
          } else if (status === "CHANNEL_ERROR") {
            console.warn(`[Realtime] Error de permisos/autorización en ${channelName}:`, err || status);
          }
        });
    };

    setupAndSubscribe();

    // Cleanup al desmontar o cambiar de conversación
    return () => {
      isSubscribed = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [
    conversacionId,
    enabled,
    onNewMessage,
    onTypingStart,
    onTypingStop,
    onReadReceipt,
  ]);
};