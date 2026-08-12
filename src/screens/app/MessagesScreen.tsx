import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Search,
  Paperclip,
  Send,
  MoreVertical,
  Star,
  Paintbrush,
  Clock,
  User,
  ArrowLeft,
  CheckCheck,
  MessageCircle,
  Loader2,
  X,
  Image,
  FileText,
  MapPin,
  Download,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n";
import { useThemeMode } from "../../theme/useThemeMode";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../../components/avatar/Avatar";
import EmptyState from "../../components/emptystate/EmptyState";
import LocationMap from "../../components/map/LocationMap";
import LocationPickerModal from "../../components/locationpickermodal/LocationPickerModal";
import { useToast } from "../../components/Toast/useToast";
import ToastContainer from "../../components/Toast/ToastContainer";
import { chatApi } from "../../api/chatApi";
import { buildClientProfileViewPath, buildProviderProfileViewPath } from "../../router/routes";
import type {
  ConversacionItem,
  ConversacionDetail,
  Mensaje,
  SendMensajePayload,
} from "../../api/chatApi";
import { useConversationChannel } from "../../hooks/useConversationChannel";
import type {
  TypingPayload,
  ReadReceiptPayload,
} from "../../hooks/useConversationChannel";

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg"]);

// Espeja el whitelist del backend (CreateMensajeSerializer) — video, audio,
// objetos 3D, ejecutables, etc. quedan fuera a propósito.
const ALLOWED_ATTACHMENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "text/plain",
]);

function getFileExtension(name?: string | null): string {
  if (!name) return "";
  const idx = name.lastIndexOf(".");
  return idx === -1 ? "" : name.slice(idx + 1).toLowerCase();
}

/** Los adjuntos requieren auth JWT (endpoint de blob, no una URL pública
 * embebible), así que las imágenes se traen como blob y se muestran con un
 * object URL en vez de un <img src> directo. */
const ChatImageAttachment: React.FC<{
  messageId: number | string;
  alt: string;
  onOpenFallback: () => void;
}> = ({ messageId, alt, onOpenFallback }) => {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    chatApi
      .downloadArchivoAdjunto(messageId)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [messageId]);

  if (failed) {
    return (
      <button
        type="button"
        onClick={onOpenFallback}
        className="flex items-center gap-2.5 p-2 bg-black/10 hover:bg-black/20 transition rounded-xl text-xs font-medium w-full text-left"
      >
        <FileText className="w-5 h-5 flex-shrink-0" />
        <span className="truncate flex-1">{alt}</span>
        <Download className="w-4 h-4 flex-shrink-0 opacity-80" />
      </button>
    );
  }

  if (!src) {
    return <div className="w-48 h-36 rounded-xl bg-black/10 animate-pulse" />;
  }

  return (
    <img
      src={src}
      alt={alt}
      onClick={() => window.open(src, "_blank", "noopener,noreferrer")}
      className="max-w-[240px] max-h-[240px] rounded-xl object-cover cursor-pointer"
    />
  );
};

const MessagesScreen: React.FC = () => {
  const { t } = useI18n();
  const d = t("messagesscreen");
  const { isDark } = useThemeMode();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  // Estados de datos API
  const [chats, setChats] = useState<ConversacionItem[]>([]);
  const [filteredChats, setFilteredChats] = useState<ConversacionItem[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string>("");
  const [roleTab, setRoleTab] = useState<"cliente" | "proveedor">("cliente");
  const [currentChatDetail, setCurrentChatDetail] = useState<ConversacionDetail | null>(null);
  const [messages, setMessages] = useState<Mensaje[]>([]);

  // Estados de UI y Carga
  const [chatsLoading, setChatsLoading] = useState<boolean>(true);
  const [messagesLoading, setMessagesLoading] = useState<boolean>(true);
  const [userInfoLoading, setUserInfoLoading] = useState<boolean>(true);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [rightPanelOpen, setRightPanelOpen] = useState<boolean>(false);
  const [messageText, setMessageText] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Estados de Realtime e Indicadores
  const [isOtherTyping, setIsOtherTyping] = useState<boolean>(false);
  const [otherHasRead, setOtherHasRead] = useState<boolean>(false);
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  // Adjuntos
  const [attachMenuOpen, setAttachMenuOpen] = useState<boolean>(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState<boolean>(false);
  const [isSendingLocation, setIsSendingLocation] = useState<boolean>(false);

  // Referencias y Timers
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef<boolean>(false);

  const [isMobile, setIsMobile] = useState<boolean>(
    () => window.matchMedia("(max-width: 1023px)").matches
  );

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1023px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // --- 1. CARGA INICIAL DE CONVERSACIONES ---
  const fetchConversaciones = useCallback(async (query = "") => {
    try {
      setChatError(null);
      const res = await chatApi.getConversaciones({ q: query });
      setChats(res.results || []);
      setFilteredChats(res.results || []);
    } catch (err: any) {
      console.error("Error al obtener conversaciones:", err);
      setChatError(d.errorLoadingChats || "Error al cargar conversaciones");
    } finally {
      setChatsLoading(false);
      setSearchLoading(false);
    }
  }, [d.errorLoadingChats]);

  useEffect(() => {
    fetchConversaciones();
  }, [fetchConversaciones]);

  // Búsqueda debounced en lista de conversaciones
  useEffect(() => {
    if (chatsLoading) return;
    setSearchLoading(true);
    const timer = setTimeout(() => {
      fetchConversaciones(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchConversaciones, chatsLoading]);

  // --- 2. CARGA DE MENSAJES Y DETALLE DE CONVERSACIÓN ---
  const fetchMensajesAndDetail = useCallback(async (conversacionId: string) => {
    if (!conversacionId) return;
    setMessagesLoading(true);
    setUserInfoLoading(true);
    setMessagesError(null);
    setIsOtherTyping(false);
    // El check azul solo debe encenderse con un read_receipt real de esta sesión,
    // no con el campo `leido` del historial (poco confiable, ver handleReadReceipt).
    setOtherHasRead(false);

    try {
      const [mensajesRes, detailRes] = await Promise.all([
        chatApi.getMensajes(conversacionId),
        chatApi.getConversacionDetail(conversacionId),
      ]);

      // DRF devuelve historial en orden descendente o ascendente
      const listaMensajes = mensajesRes.results || [];
      setMessages(listaMensajes);
      setCurrentChatDetail(detailRes);

      // Marca la conversación como leída en BD y limpia el badge de no-leídos
      // de forma persistente (no solo local/optimista).
      chatApi.marcarLeido(conversacionId).catch(() => {});
    } catch (err: any) {
      console.error("Error al obtener historial de mensajes:", err);
      setMessagesError(d.errorLoadingMessages || "Error al cargar mensajes");
    } finally {
      setMessagesLoading(false);
      setUserInfoLoading(false);
    }
  }, [d.errorLoadingMessages]);

  useEffect(() => {
    if (selectedChatId) {
      fetchMensajesAndDetail(selectedChatId);
    }
  }, [selectedChatId, fetchMensajesAndDetail]);

  // Refetch periódico o al enfocar pantalla para capturar ediciones/borrados.
  // También sirve de fallback de "tiempo real": mientras el canal privado de
  // Supabase Realtime no autorice la conexión (ver useConversationChannel),
  // esto simula mensajes en vivo refrescando cada pocos segundos.
  useEffect(() => {
    const refreshOpenChat = () => {
      if (selectedChatId) {
        chatApi.getMensajes(selectedChatId).then((res) => {
          if (res.results) setMessages(res.results);
        }).catch(() => {});
      }
    };
    window.addEventListener("focus", refreshOpenChat);

    const pollTimer = selectedChatId ? setInterval(refreshOpenChat, 4000) : null;

    return () => {
      window.removeEventListener("focus", refreshOpenChat);
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [selectedChatId]);

  // Igual, refresca la lista de conversaciones (badges/preview) sin necesidad
  // de abrir el chat, mientras el realtime real no esté disponible.
  useEffect(() => {
    const pollTimer = setInterval(() => {
      fetchConversaciones(searchQuery);
    }, 10000);
    return () => clearInterval(pollTimer);
  }, [fetchConversaciones, searchQuery]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (!messagesLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, messagesLoading, isOtherTyping]);

  // --- 3. SUSCRIPCIÓN REALTIME BROADCAST ---
  const handleNewRealtimeMessage = useCallback((newMsg: Mensaje) => {
    setMessages((prev) => {
      if (prev.some((m) => String(m.id) === String(newMsg.id))) return prev;
      return [...prev, newMsg];
    });
  }, []);

  // El backend hace broadcast de estas señales a todo el canal, incluido quien
  // las origina (typing/marcarLeido no excluyen al emisor como haría un
  // channel.send() con self:false). Sin este filtro, el propio usuario recibe
  // su propia señal y ve "está escribiendo..."/"visto" sobre sí mismo.
  const handleTypingStart = useCallback((payload: TypingPayload) => {
    if (payload.user_id === user?.id) return;
    setIsOtherTyping(true);
  }, [user?.id]);

  const handleTypingStop = useCallback((payload: TypingPayload) => {
    if (payload.user_id === user?.id) return;
    setIsOtherTyping(false);
  }, [user?.id]);

  const handleReadReceipt = useCallback((payload: ReadReceiptPayload) => {
    if (payload.reader_id === user?.id) return;
    // Actualiza en vivo los mensajes propios como leídos (además del valor
    // que ya trae `leido` por mensaje desde la BD tras el fetch inicial).
    setOtherHasRead(true);
    setMessages((prev) =>
      prev.map((msg) =>
        msg.sender === "user" ? { ...msg, estado_entrega: "leido", leido: true } : msg
      )
    );
  }, [user?.id]);

  useConversationChannel({
    conversacionId: selectedChatId,
    onNewMessage: handleNewRealtimeMessage,
    onTypingStart: handleTypingStart,
    onTypingStop: handleTypingStop,
    onReadReceipt: handleReadReceipt,
    enabled: Boolean(selectedChatId),
  });

  // --- 4. INDICADOR DE ESCRITURA (DEBOUNCE EN FRONTEND) ---
  const emitTypingStop = useCallback(() => {
    if (selectedChatId && isTypingRef.current) {
      chatApi.sendTypingSignal(selectedChatId, "stop").catch(() => {});
      isTypingRef.current = false;
    }
  }, [selectedChatId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageText(value);

    if (!selectedChatId) return;

    if (!isTypingRef.current && value.trim()) {
      isTypingRef.current = true;
      chatApi.sendTypingSignal(selectedChatId, "start").catch(() => {});
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      emitTypingStop();
    }, 2500);
  };

  // --- 5. ENVÍO DE MENSAJES ---
  const handleSendMessage = async (e?: React.FormEvent, customPayload?: SendMensajePayload) => {
    if (e) e.preventDefault();
    if (sendingMessage || !selectedChatId) return;

    const textToSend = customPayload?.contenido ?? messageText.trim();
    const fileToSend = customPayload?.archivo ?? pendingFile;
    const hasLocation = customPayload?.latitud != null && customPayload?.longitud != null;

    if (!textToSend && !fileToSend && !hasLocation) return;

    // Si la conversación está archivada, bloqueamos el envío
    if (currentChatDetail?.archivada) return;

    setSendingMessage(true);
    emitTypingStop();

    try {
      const createdMsg = await chatApi.sendMensaje(selectedChatId, {
        contenido: textToSend || undefined,
        archivo: fileToSend || undefined,
        latitud: customPayload?.latitud,
        longitud: customPayload?.longitud,
        reply_to: customPayload?.reply_to,
      });

      setMessages((prev) => [...prev, createdMsg]);
      setMessageText("");
      setPendingFile(null);
      setAttachMenuOpen(false);
    } catch (err: any) {
      console.error("Error al enviar mensaje:", err);
      if (err?.status === 429) {
        addToast("error", d.rateLimitExceeded || "Estás enviando mensajes muy rápido. Espera un momento.");
      } else {
        // ApiError expone el motivo real (ej. "Tipo de archivo no
        // permitido.") en `message`, no en `.data.detail` (no existe).
        addToast("error", err?.message || d.errorSendingMessage || "No se pudo enviar el mensaje");
      }
    } finally {
      setSendingMessage(false);
    }
  };

  // --- 6. MANEJO DE ARCHIVOS Y UBICACIÓN ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación de tamaño (Máx 10MB) — antes de tipo: un archivo permitido
    // pero pesado (ej. un PDF de 40MB) debe avisar por peso, no por tipo.
    if (file.size > 10 * 1024 * 1024) {
      addToast("error", d.fileTooLarge || "El archivo excede el límite permitido de 10MB.");
      e.target.value = "";
      return;
    }

    // Validación de tipo — espeja el whitelist del backend (imágenes +
    // PDF/TXT). Videos, audio, objetos 3D, etc. quedan fuera.
    if (!ALLOWED_ATTACHMENT_TYPES.has(file.type)) {
      addToast("error", d.fileInvalidType || "Tipo de archivo no permitido.");
      e.target.value = "";
      return;
    }

    setPendingFile(file);
    setAttachMenuOpen(false);
    e.target.value = "";
  };

  const handleOpenLocationPicker = () => {
    setAttachMenuOpen(false);
    setIsLocationPickerOpen(true);
  };

  const handleSendLocationPick = async (lat: number, lon: number) => {
    setIsSendingLocation(true);
    try {
      // El backend guarda 6 decimales (~11cm de precisión) — el GPS del
      // dispositivo devuelve más dígitos de los que el campo admite.
      await handleSendMessage(undefined, {
        latitud: Number(lat.toFixed(6)),
        longitud: Number(lon.toFixed(6)),
      });
      setIsLocationPickerOpen(false);
    } finally {
      setIsSendingLocation(false);
    }
  };

  const handleDownloadAttachment = async (mensajeId: number | string, fileName?: string) => {
    try {
      const blob = await chatApi.downloadArchivoAdjunto(mensajeId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "adjunto";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error al descargar el archivo:", err);
      addToast("error", d.errorDownloadingAttachment || "No se pudo descargar el archivo");
    }
  };

  // --- 7. ROL DE LA CONVERSACIÓN (cliente / proveedor) ---
  // Las cuentas con rol "provider"/"admin" pueden actuar como cliente (al publicar
  // un servicio) y como proveedor (al aplicar a uno), así que sus chats se separan.
  const showRoleTabs = user?.role === "provider" || user?.role === "admin";

  const getChatRole = useCallback(
    (chat: ConversacionItem): "cliente" | "proveedor" | "unknown" => {
      if (!user) return "unknown";
      if (chat.proveedor_id && chat.proveedor_id === user.id) return "proveedor";
      if (chat.cliente_id && chat.cliente_id === user.id) return "cliente";
      return "unknown";
    },
    [user]
  );

  const visibleChats = showRoleTabs
    ? filteredChats.filter((chat) => {
        const role = getChatRole(chat);
        return role === "unknown" || role === roleTab;
      })
    : filteredChats;

  // Servicio completado -> conversación archivada (solo lectura, sin poder
  // enviar). Se separan del resto para que el sidebar distinga de un vistazo
  // los chats con los que aún se puede hablar de los ya cerrados.
  const activeVisibleChats = visibleChats.filter((chat) => !chat.archivada);
  const pastVisibleChats = visibleChats.filter((chat) => chat.archivada);

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    // Marca como leído localmente al abrir; el backend no expone aún un
    // endpoint explícito de "marcar leído", así que limpiamos el contador aquí.
    setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c)));
    setFilteredChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c)));
  };

  const renderChatRow = (chat: ConversacionItem, i: number) => {
    const isSelected = selectedChatId === chat.id;
    const isUnread = chat.unreadCount > 0 && !isSelected;
    return (
      <motion.div
        key={chat.id}
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18, delay: i * 0.03 }}
        onClick={() => handleSelectChat(chat.id)}
        className={`flex items-center gap-3.5 py-4 pr-4 pl-3 cursor-pointer transition-colors border-l-4 ${
          isSelected
            ? "bg-[#2EBCCC]/[0.1] border-[#2EBCCC]"
            : isUnread
            ? "bg-[var(--msg-input)]/60 border-transparent hover:bg-[var(--msg-input)]"
            : "border-transparent hover:bg-[var(--msg-input)]"
        } ${chat.archivada ? "opacity-70" : ""}`}
      >
        <div className="relative flex-shrink-0 ml-1">
          <Avatar photoUrl={chat.avatar} name={chat.name} size={48} />
          {isUnread && (
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#2EBCCC] rounded-full border-2 border-[var(--msg-card)]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline gap-1 mb-0.5">
            <h4
              className={`text-sm truncate ${
                isUnread ? "font-extrabold text-[var(--msg-text)]" : "font-bold text-[var(--msg-text)]"
              }`}
            >
              {chat.name}
            </h4>
            <span
              className={`text-[11px] flex-shrink-0 ${
                isSelected
                  ? "text-[#2EBCCC] font-bold"
                  : isUnread
                  ? "text-[#2EBCCC] font-bold"
                  : "text-[var(--msg-text-muted)]"
              }`}
            >
              {chat.timeAgoKey}
            </span>
          </div>
          {chat.servicio_titulo && (
            <p className="text-[11px] text-[#2EBCCC] font-semibold truncate">{chat.servicio_titulo}</p>
          )}
          <p className="text-xs text-[var(--msg-text-muted)] truncate">{chat.professionKey}</p>
          <p
            className={`text-xs truncate mt-1 ${
              isUnread
                ? "text-[var(--msg-text)] font-semibold opacity-100"
                : "text-[var(--msg-text-muted)] opacity-80"
            }`}
          >
            {chat.lastMessagePreview}
          </p>
        </div>
        {isUnread && (
          <span className="w-5 h-5 bg-[#2EBCCC] text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
            {chat.unreadCount}
          </span>
        )}
      </motion.div>
    );
  };

  const currentChat = chats.find((c) => c.id === selectedChatId);

  // El "otro" participante (para rating/reviews en el panel derecho): el que
  // no es el usuario logueado, según cliente_id/proveedor_id de la conversación.
  // Como una cuenta proveedor también puede ser cliente (según con quién esté
  // chateando), el rol del otro se decide por conversación, no por user.role.
  const otherIsProvider = user?.id === currentChatDetail?.cliente_id;
  const otherParticipant =
    currentChatDetail &&
    (otherIsProvider ? currentChatDetail.proveedor : currentChatDetail.cliente);

  const formatTimeAgo = (isoDate: string): string => {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days <= 0) return d.today || "Hoy";
    if (days === 1) return d.oneDayAgo || "Hace 1 día";
    if (days < 30) return (d.daysAgo || "Hace {n} días").replace("{n}", String(days));
    const months = Math.floor(days / 30);
    if (months < 12) return (d.monthsAgo || "Hace {n} meses").replace("{n}", String(months));
    const years = Math.floor(months / 12);
    return (d.yearsAgo || "Hace {n} años").replace("{n}", String(years));
  };

  // --- PANEL DERECHO (INFORMACIÓN DEL USUARIO / SERVICIO) ---
  const userInfoContent = userInfoLoading ? (
    <div className="w-full flex flex-col items-center animate-pulse">
      <div className="w-28 h-28 rounded-full bg-[var(--msg-input)] mb-4" />
      <div className="h-4 w-32 rounded bg-[var(--msg-input)] mb-2" />
      <div className="h-3 w-24 rounded bg-[var(--msg-input)] mb-10" />
      <div className="w-full space-y-6 flex-1">
        <div className="h-2.5 w-28 rounded bg-[var(--msg-input)]" />
        <div className="flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--msg-input)] flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 rounded bg-[var(--msg-input)]" />
            <div className="h-2.5 w-1/2 rounded bg-[var(--msg-input)]" />
          </div>
        </div>
      </div>
      <div className="w-full h-11 rounded-xl bg-[var(--msg-input)] mt-auto" />
    </div>
  ) : (
    currentChat && (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full flex flex-col items-center flex-1"
      >
        <Avatar photoUrl={currentChat.avatar} name={currentChat.name} size={112} className="mb-4 shadow-sm" />
        <h3 className="font-bold text-lg text-[var(--msg-text)] truncate">{currentChat.name}</h3>
        <p className="text-sm text-[var(--msg-text-muted)] mb-4 truncate">{currentChat.professionKey}</p>

        {otherParticipant && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--msg-text)] mb-8">
            <Star className="w-4 h-4 fill-[#2EBCCC] text-[#2EBCCC]" />
            <span className="font-bold text-[#2EBCCC]">
              {otherParticipant.rating != null ? otherParticipant.rating.toFixed(1) : "—"}
            </span>
            <span className="text-[var(--msg-text-muted)]">
              ({otherParticipant.num_reviews} {d.reviews})
            </span>
          </div>
        )}

        <div className="w-full flex-1 mb-8">
          <span className="block text-[11px] font-bold tracking-wider text-[var(--msg-text-muted)] uppercase mb-4">
            {d.serviceDetails}
          </span>

          <div className="space-y-5">
            <div className="flex items-start gap-3.5">
              <div className="p-2 bg-[#2EBCCC]/10 rounded-lg text-[#2EBCCC] flex-shrink-0 mt-0.5">
                <Paintbrush className="w-4 h-4 stroke-[2]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--msg-text)]">
                  {currentChatDetail?.servicio?.titulo ||
                    currentChatDetail?.servicio_titulo ||
                    currentChat?.servicio_titulo ||
                    "Servicio Contratado"}
                </p>
                <p className="text-xs text-[var(--msg-text-muted)] mt-0.5">
                  {currentChatDetail?.servicio?.categoria || currentChat?.professionKey || ""}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2 bg-[#2EBCCC]/10 rounded-lg text-[#2EBCCC] flex-shrink-0 mt-0.5">
                <Clock className="w-4 h-4 stroke-[2]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--msg-text)]">{d.timePosted}</p>
                <p className="text-xs text-[var(--msg-text-muted)] mt-0.5">
                  {currentChatDetail?.servicio?.fecha
                    ? formatTimeAgo(currentChatDetail.servicio.fecha)
                    : "Reciente"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (!otherParticipant) return;
            navigate(
              otherIsProvider
                ? buildProviderProfileViewPath(otherParticipant.id_usuario)
                : buildClientProfileViewPath(otherParticipant.id_usuario)
            );
          }}
          className="w-full mt-auto py-3.5 bg-[#2EBCCC] hover:bg-[#239aaa] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-md"
        >
          <span>{d.seeProfile}</span>
          <User className="w-4 h-4" />
        </button>
      </motion.div>
    )
  );

  return (
    <>
      <style>{`
        .msg-root {
          --msg-bg: ${isDark ? "#151c38" : "#F9FAFB"};
          --msg-card: ${isDark ? "#1e2d5e" : "#ffffff"};
          --msg-input: ${isDark ? "#273570" : "#F8FAFB"};
          --msg-text: ${isDark ? "#ffffff" : "#0f172a"};
          --msg-text-muted: ${isDark ? "#94a3b8" : "#64748b"};
          --msg-border: ${isDark ? "#273570" : "#f1f5f9"};
          --msg-chat-bubble: ${isDark ? "#273570" : "#ffffff"};
        }
      `}</style>

      {/* Input nativo oculto — solo lo que el backend realmente acepta
          (imágenes incl. SVG, PDF, TXT). Nada de video/audio/objetos 3D. */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,application/pdf,text/plain,.jpg,.jpeg,.png,.gif,.webp,.svg,.pdf,.txt"
        className="hidden"
      />

      <div className="msg-root page-enter flex h-full w-full bg-[var(--msg-bg)] text-[var(--msg-text)] font-sans overflow-hidden">
        {/* BARRA LATERAL: LISTA DE CONVERSACIONES */}
        <div
          className={`w-full lg:w-[340px] bg-[var(--msg-card)] border-r border-[var(--msg-border)] flex flex-col z-10 ${
            selectedChatId ? "hidden lg:flex" : "flex"
          }`}
        >
          {showRoleTabs && (
            <div className="px-5 pt-4 pb-1 border-b border-[var(--msg-border)]">
              <div className="relative flex bg-[var(--msg-input)] rounded-full p-1">
                {(["cliente", "proveedor"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setRoleTab(tab)}
                    className={`relative z-10 flex-1 py-2 text-xs font-bold rounded-full transition-colors ${
                      roleTab === tab
                        ? "text-white"
                        : "text-[var(--msg-text-muted)] hover:text-[var(--msg-text)]"
                    }`}
                  >
                    {roleTab === tab && (
                      <motion.span
                        layoutId="msg-role-tab-active"
                        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                        className="absolute inset-0 -z-10 bg-[#2EBCCC] rounded-full"
                      />
                    )}
                    {tab === "cliente" ? d.asCliente || "Como Cliente" : d.asProveedor || "Como Proveedor"}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-5 border-b border-[var(--msg-border)]">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 grid place-items-center">
                <AnimatePresence initial={false} mode="wait">
                  {searchLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Loader2 className="h-4 w-4 text-[#2EBCCC] animate-spin" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Search className="h-4 w-4 text-[var(--msg-text-muted)]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={d.search}
                className="w-full pl-10 pr-9 py-3 bg-[var(--msg-input)] text-sm rounded-full outline-none focus:ring-1 focus:ring-[#2EBCCC] text-[var(--msg-text)] placeholder-[var(--msg-text-muted)] transition border-0"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    type="button"
                    key="clear"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 grid place-items-center rounded-full text-[var(--msg-text-muted)] hover:text-[var(--msg-text)] hover:bg-[var(--msg-border)] transition"
                  >
                    <X className="h-3.5 w-3.5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {chatsLoading ? (
              <div className="px-3 py-2 space-y-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3.5 py-4 pr-4 pl-1">
                    <div className="w-12 h-12 rounded-full bg-[var(--msg-input)] animate-pulse flex-shrink-0" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="h-3 w-2/3 rounded bg-[var(--msg-input)] animate-pulse" />
                      <div className="h-2.5 w-1/3 rounded bg-[var(--msg-input)] animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : chatError ? (
              <div className="p-6 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
                <p className="text-xs text-[var(--msg-text-muted)]">{chatError}</p>
                <button
                  onClick={() => fetchConversaciones(searchQuery)}
                  className="px-4 py-2 bg-[#2EBCCC] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 mx-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{d.retry || "Reintentar"}</span>
                </button>
              </div>
            ) : visibleChats.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center gap-2 text-center px-8 py-16"
              >
                <Search className="w-6 h-6 text-[var(--msg-text-muted)]" />
                <p className="text-sm text-[var(--msg-text-muted)]">{d.noResults}</p>
              </motion.div>
            ) : (
              <>
                {pastVisibleChats.length > 0 && activeVisibleChats.length > 0 && (
                  <p className="px-4 pt-3 pb-1 text-[10px] font-extrabold tracking-wider uppercase text-[var(--msg-text-muted)]">
                    {d.activeChats}
                  </p>
                )}
                <AnimatePresence initial={false}>
                  {activeVisibleChats.map((chat, i) => renderChatRow(chat, i))}
                </AnimatePresence>

                {pastVisibleChats.length > 0 && (
                  <>
                    <p className="px-4 pt-4 pb-1 text-[10px] font-extrabold tracking-wider uppercase text-[var(--msg-text-muted)]">
                      {d.pastChats}
                    </p>
                    <AnimatePresence initial={false}>
                      {pastVisibleChats.map((chat, i) => renderChatRow(chat, i))}
                    </AnimatePresence>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* ÁREA PRINCIPAL DEL CHAT */}
        <div className={`flex-1 flex flex-col bg-[var(--msg-bg)] ${!selectedChatId ? "hidden lg:flex" : "flex"}`}>
          {!currentChat ? (
            <div className="page-enter flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
              <div className="w-16 h-16 rounded-full bg-[#2EBCCC]/10 flex items-center justify-center text-[#2EBCCC] mb-2">
                <MessageCircle className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base text-[var(--msg-text)]">{d.selectChatTitle}</h3>
              <p className="text-sm text-[var(--msg-text-muted)] max-w-xs">{d.selectChatSubtitle}</p>
            </div>
          ) : (
            <motion.div
              key={currentChat.id}
              initial={isMobile ? { transform: "translateX(100%)" } : { opacity: 0, transform: "translateY(12px)" }}
              animate={{ opacity: 1, transform: isMobile ? "translateX(0%)" : "translateY(0px)" }}
              transition={
                isMobile
                  ? { duration: 0.32, ease: [0.32, 0.72, 0, 1] }
                  : { duration: 0.35, ease: [0.4, 0, 0.2, 1] }
              }
              className="flex-1 flex flex-col min-h-0"
            >
              {/* Encabezado Superior */}
              <div className="min-h-[84px] px-8 py-3 bg-[var(--msg-card)] border-b border-[var(--msg-border)] flex items-center justify-between z-10">
                <div className="flex items-center gap-4 min-w-0">
                  <button
                    onClick={() => setSelectedChatId("")}
                    className="lg:hidden p-1.5 rounded-lg text-[var(--msg-text-muted)] hover:bg-[var(--msg-input)]"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <Avatar photoUrl={currentChat.avatar} name={currentChat.name} size={48} />
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-[var(--msg-text)] leading-none mb-1.5 truncate">
                      {currentChat.name}
                    </h3>
                    <p className="text-xs text-[var(--msg-text-muted)]">
                      {isOtherTyping ? (
                        <span className="text-[#2EBCCC] font-semibold animate-pulse">
                          {d.typing || "está escribiendo..."}
                        </span>
                      ) : (
                        currentChat.professionKey
                      )}
                    </p>
                    {(() => {
                      const servicioTitulo =
                        currentChatDetail?.servicio?.titulo ||
                        currentChatDetail?.servicio_titulo ||
                        currentChat?.servicio_titulo;
                      return (
                        servicioTitulo && (
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-[#2EBCCC]/10 text-[#2EBCCC] text-[10px] font-bold truncate max-w-full">
                            <Paintbrush className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{servicioTitulo}</span>
                          </span>
                        )
                      );
                    })()}
                  </div>
                </div>
                <button
                  onClick={() => setRightPanelOpen((prev) => !prev)}
                  className={`p-2 rounded-full transition ${
                    rightPanelOpen
                      ? "text-[#2EBCCC] bg-[#2EBCCC]/10"
                      : "text-[var(--msg-text-muted)] hover:text-[var(--msg-text)] hover:bg-[var(--msg-input)]"
                  }`}
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Mensajes / Feed */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-8 space-y-2">
                {messagesLoading ? (
                  <div className="space-y-6">
                    {[false, true, false].map((isUser, i) => (
                      <div
                        key={i}
                        className={`flex items-end gap-3 max-w-[90%] xl:max-w-[75%] ${
                          isUser ? "ml-auto flex-row-reverse" : ""
                        }`}
                      >
                        <div className="w-9 h-9 rounded-full bg-[var(--msg-input)] animate-pulse flex-shrink-0 mb-1" />
                        <div
                          className={`h-16 w-56 rounded-2xl bg-[var(--msg-input)] animate-pulse ${
                            isUser ? "rounded-br-sm" : "rounded-bl-sm"
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                ) : messagesError ? (
                  <div className="p-8 text-center space-y-3">
                    <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
                    <p className="text-xs text-[var(--msg-text-muted)]">{messagesError}</p>
                    <button
                      onClick={() => fetchMensajesAndDetail(selectedChatId)}
                      className="px-4 py-2 bg-[#2EBCCC] text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{d.retry || "Reintentar"}</span>
                    </button>
                  </div>
                ) : messages.length === 0 ? (
                  <EmptyState
                    icon={<MessageCircle size={22} color="#2EBCCC" />}
                    isDark={isDark}
                    title={d.noMessagesTitle}
                    subtitle={d.noMessagesSubtitle}
                    size="compact"
                  />
                ) : (
                  <>
                    <div className="flex justify-center mb-6">
                      <span className="px-5 py-2 bg-[var(--msg-card)] text-[var(--msg-text-muted)] text-[10px] font-bold tracking-wider rounded-full uppercase border border-[var(--msg-border)]">
                        {d.serviceConfirmed}
                      </span>
                    </div>

                    <AnimatePresence initial={false}>
                      {messages.map((msg, index) => {
                        const isUser = msg.sender === "user";
                        const prevMsg = messages[index - 1];
                        const nextMsg = messages[index + 1];

                        const isFirstInGroup = !prevMsg || prevMsg.sender !== msg.sender;
                        const isLastInGroup = !nextMsg || nextMsg.sender !== msg.sender;

                        const textContent = msg.text || msg.contenido;

                        return (
                          <motion.div
                            key={msg.id}
                            layout
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.22 }}
                            className={`flex items-end gap-3 max-w-[90%] xl:max-w-[75%] ${
                              isUser ? "ml-auto flex-row-reverse" : ""
                            } ${isFirstInGroup ? "mt-4" : "mt-1"}`}
                          >
                            {/* Avatar visible solo en el último mensaje consecutivo.
                                Para mensajes propios el fallback debe ser mi propia foto/nombre:
                                usar currentChat.avatar (foto del OTRO participante) aquí duplicaba
                                la foto del cliente también en las burbujas del proveedor. */}
                            {isLastInGroup ? (
                              <Avatar
                                photoUrl={
                                  msg.senderAvatar ||
                                  (isUser ? profile?.url_foto_perfil : currentChat.avatar)
                                }
                                name={
                                  msg.senderName ||
                                  (isUser ? `${user?.firstName ?? ""} ${user?.lastnameP ?? ""}`.trim() : currentChat.name)
                                }
                                size={36}
                                className="flex-shrink-0 mb-1 shadow-sm"
                              />
                            ) : (
                              <div className="w-[36px] flex-shrink-0" />
                            )}

                            <div className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
                              {isFirstInGroup && (
                                <span className="text-[11px] font-semibold text-[var(--msg-text-muted)] px-1 mb-0.5">
                                  {isUser ? d.you : `${msg.senderName || currentChat.name} • ${currentChat.professionKey}`}
                                </span>
                              )}

                              {/* Burbuja de mensaje */}
                              <div
                                className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                  isUser
                                    ? "bg-[#2EBCCC] text-white rounded-br-sm"
                                    : "bg-[var(--msg-chat-bubble)] text-[var(--msg-text)] rounded-bl-sm border border-[var(--msg-border)]"
                                }`}
                              >
                                {textContent && (
                                  <p>
                                    {textContent}
                                    {msg.editado && (
                                      <span className="text-[10px] opacity-70 ml-1.5 font-style-italic">
                                        {d.edited || "(editado)"}
                                      </span>
                                    )}
                                  </p>
                                )}

                                {/* Ubicación compartida */}
                                {msg.latitud != null && msg.longitud != null && (
                                  <div className={textContent ? "mt-2 pt-2 border-t border-white/20" : ""}>
                                    <LocationMap
                                      lat={msg.latitud}
                                      lon={msg.longitud}
                                      height={160}
                                      style={{ width: 220 }}
                                    />
                                  </div>
                                )}

                                {/* Adjunto del Backend */}
                                {msg.archivo && (
                                  <div className={textContent ? "mt-2 pt-2 border-t border-white/20" : ""}>
                                    {IMAGE_EXTENSIONS.has(getFileExtension(msg.archivo_nombre)) ? (
                                      <ChatImageAttachment
                                        messageId={msg.id}
                                        alt={msg.archivo_nombre || d.downloadAttachment}
                                        onOpenFallback={() =>
                                          handleDownloadAttachment(msg.id, msg.archivo_nombre || undefined)
                                        }
                                      />
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleDownloadAttachment(msg.id, msg.archivo_nombre || undefined)}
                                        className="flex items-center gap-2.5 p-2 bg-black/10 hover:bg-black/20 transition rounded-xl text-xs font-medium w-full text-left"
                                      >
                                        <FileText className="w-5 h-5 flex-shrink-0" />
                                        <span className="truncate flex-1">
                                          {msg.archivo_nombre || d.downloadAttachment}
                                        </span>
                                        <Download className="w-4 h-4 flex-shrink-0 opacity-80" />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Hora e icono de entrega */}
                              {isLastInGroup && (
                                <div className="flex items-center gap-1.5 text-[10px] text-[var(--msg-text-muted)] px-1 mt-0.5">
                                  <span>{msg.time}</span>
                                  {isUser && (
                                    <CheckCheck
                                      className={`w-4 h-4 ${
                                        otherHasRead || msg.estado_entrega === "leido" || msg.leido
                                          ? "text-blue-400 font-bold"
                                          : "text-[var(--msg-text-muted)]"
                                      }`}
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>

                    {/* Indicador visual de "está escribiendo..." en el feed */}
                    {isOtherTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        className="flex items-center gap-3 mt-2"
                      >
                        <Avatar photoUrl={currentChat.avatar} name={currentChat.name} size={36} />
                        <div className="bg-[var(--msg-chat-bubble)] border border-[var(--msg-border)] px-4 py-2.5 rounded-2xl rounded-bl-sm flex items-center gap-1.5 text-xs text-[var(--msg-text-muted)]">
                          <span className="w-2 h-2 bg-[#2EBCCC] rounded-full animate-bounce" />
                          <span className="w-2 h-2 bg-[#2EBCCC] rounded-full animate-bounce [animation-delay:0.2s]" />
                          <span className="w-2 h-2 bg-[#2EBCCC] rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Banner si la conversación está archivada */}
              {currentChatDetail?.archivada && (
                <div className="bg-amber-500/10 border-t border-amber-500/20 px-6 py-2.5 text-amber-600 dark:text-amber-400 text-xs text-center font-medium">
                  {d.archivedSubtitle || "Esta conversación ha sido archivada y no permite enviar más mensajes."}
                </div>
              )}

              {/* Vista previa de archivo pendiente de envío */}
              {pendingFile && (
                <div className="px-6 py-2 bg-[var(--msg-card)] border-t border-[var(--msg-border)] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate text-[var(--msg-text)]">
                    <FileText className="w-4 h-4 text-[#2EBCCC]" />
                    <span className="truncate max-w-xs">{pendingFile.name}</span>
                    <span className="text-[var(--msg-text-muted)]">
                      ({(pendingFile.size / (1024 * 1024)).toFixed(1)} MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPendingFile(null)}
                    className="p-1 hover:bg-[var(--msg-input)] rounded-full text-[var(--msg-text-muted)]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* FORMULARIO Y FOOTER DEL INPUT */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 px-6 bg-[var(--msg-card)] border-t border-[var(--msg-border)] flex items-center gap-3 z-10 relative"
              >
                {/* Menú de adjuntos */}
                <div className="relative">
                  <button
                    type="button"
                    disabled={Boolean(currentChatDetail?.archivada)}
                    onClick={() => setAttachMenuOpen((prev) => !prev)}
                    className={`p-2.5 rounded-full transition ${
                      attachMenuOpen
                        ? "text-[#2EBCCC] bg-[#2EBCCC]/10"
                        : "text-[var(--msg-text-muted)] hover:text-[var(--msg-text)] hover:bg-[var(--msg-input)]"
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    <Paperclip className="w-6 h-6 stroke-[1.5]" />
                  </button>

                  <AnimatePresence>
                    {attachMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-14 left-0 w-60 bg-[var(--msg-card)] border border-[var(--msg-border)] shadow-xl rounded-2xl p-2 z-50 flex flex-col gap-1"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setAttachMenuOpen(false);
                            fileInputRef.current?.click();
                          }}
                          className="flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-xl hover:bg-[var(--msg-input)] transition text-left text-[var(--msg-text)]"
                        >
                          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                            <Image className="w-4 h-4" />
                          </div>
                          <span>Imagen o Archivo (sin video)</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleOpenLocationPicker}
                          className="flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-xl hover:bg-[var(--msg-input)] transition text-left text-[var(--msg-text)]"
                        >
                          <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <span>{d.location}</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <input
                  type="text"
                  value={messageText}
                  onChange={handleInputChange}
                  disabled={Boolean(currentChatDetail?.archivada)}
                  placeholder={
                    currentChatDetail?.archivada
                      ? d.archivedInputPlaceholder || "No puedes responder a esta conversación archivada"
                      : d.typePlaceholder
                  }
                  className="flex-1 bg-[var(--msg-input)] text-[var(--msg-text)] px-5 py-3.5 rounded-full text-sm outline-none focus:ring-1 focus:ring-[#2EBCCC] border-0 placeholder-[var(--msg-text-muted)] disabled:opacity-50 disabled:cursor-not-allowed"
                />

                {/* Botón de Enviar Centrado Perfecto */}
                <button
                  type="submit"
                  disabled={
                    (!messageText.trim() && !pendingFile) ||
                    sendingMessage ||
                    Boolean(currentChatDetail?.archivada)
                  }
                  className="w-12 h-12 bg-[#2EBCCC] text-white rounded-full hover:bg-[#239aaa] disabled:opacity-50 disabled:cursor-not-allowed transition flex-shrink-0 shadow-sm flex items-center justify-center"
                >
                  {sendingMessage ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </div>

        {/* PANEL DERECHO DESPLEGABLE (INFORMACIÓN DE SERVICIO) */}
        <AnimatePresence initial={false}>
          {currentChat && rightPanelOpen && (
            <motion.div
              key="right-panel"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.28 }}
              className="hidden xl:flex overflow-hidden flex-shrink-0 border-l border-[var(--msg-border)] bg-[var(--msg-card)] z-10"
            >
              <div className="w-[320px] flex flex-col p-8 items-center">{userInfoContent}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL MÓVIL PANEL DERECHO */}
        <AnimatePresence>
          {currentChat && rightPanelOpen && (
            <div className="xl:hidden fixed inset-0 z-50">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setRightPanelOpen(false)}
                className="absolute inset-0 bg-black/40"
              />
              <motion.div
                initial={{ transform: "translateY(100%)" }}
                animate={{ transform: "translateY(0%)" }}
                exit={{ transform: "translateY(100%)" }}
                transition={{ duration: 0.32 }}
                className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-[var(--msg-card)] p-6 pt-3"
              >
                <div className="w-10 h-1.5 rounded-full bg-[var(--msg-border)] mx-auto mb-5" />
                <div className="flex flex-col items-center">{userInfoContent}</div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <LocationPickerModal
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        onSend={handleSendLocationPick}
        isSending={isSendingLocation}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} theme={isDark ? "dark" : "light"} />
    </>
  );
};

export default MessagesScreen;