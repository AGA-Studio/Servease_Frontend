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
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let retryCount = 0;

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
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          console.log(
            `[Realtime] Token para ${channelName} -> role=${payload.role} sub=${payload.sub} exp=${new Date(
              payload.exp * 1000
            ).toISOString()}`
          );
        } catch {
          console.warn(`[Realtime] No se pudo decodificar el JWT para ${channelName}`);
        }
        await supabase.realtime.setAuth(token);
      } else {
        console.warn(`[Realtime] Sin sesión activa al abrir ${channelName}; se usará auth por defecto (anon)`);
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
            retryCount = 0;
            console.log(`[Realtime] Conectado exitosamente a ${channelName}`);
            return;
          }

          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            console.warn(
              `[Realtime] ${status} en ${channelName} (intento ${retryCount + 1}). ` +
                `Si esto se repite siempre, revisar en el backend/Supabase las políticas de ` +
                `Realtime Authorization (RLS de realtime.messages) para canales privados — ` +
                `sin eso el canal nunca conecta y no llegan mensajes/typing en vivo.`,
              err || status
            );
            if (!isSubscribed) return;
            retryCount += 1;
            const delay = Math.min(1000 * 2 ** retryCount, 15000);
            retryTimer = setTimeout(() => {
              if (isSubscribed) setupAndSubscribe();
            }, delay);
          } else if (status === "CLOSED") {
            console.log(`[Realtime] Canal cerrado ${channelName}`);
          }
        });
    };

    setupAndSubscribe();

    // Cleanup al desmontar o cambiar de conversación
    return () => {
      isSubscribed = false;
      if (retryTimer) clearTimeout(retryTimer);
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