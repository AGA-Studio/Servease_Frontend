import { apiGet, apiPost, apiPatch, apiDelete } from "./apiClient";

// --- TIPOS Y INTERFACES ---

export interface ConversacionItem {
  id: string;
  name: string;
  avatar: string;
  professionKey: string;
  lastMessagePreview: string;
  timeAgoKey: string; // ej: "now", "2h ago", "1d ago"
  unreadCount: number;
  servicio_id?: number | null;
  servicio_titulo?: string | null;
  archivada?: boolean;
  proveedor_id?: string;
  cliente_id?: string;
}

export interface UsuarioConversacion {
  id_usuario: string;
  nombre: string;
  apellido_pa: string;
  url_foto_perfil: string | null;
  rating: number | null;
  num_reviews: number;
}

export interface ServicioConversacion {
  id: number;
  titulo: string;
  fecha: string;
  categoria: string | null;
}

export interface ConversacionDetail extends ConversacionItem {
  estado?: number;
  fecha_inicio?: string;
  cliente?: UsuarioConversacion;
  proveedor?: UsuarioConversacion;
  servicio?: ServicioConversacion;
}

export interface MensajeAttachment {
  type: "image" | "file" | "location_exact" | "location_live";
  url?: string;
  fileName?: string;
  fileSize?: string;
  latitude?: number;
  longitude?: number;
}

export interface Mensaje {
  id: number | string;
  sender: "user" | "other";
  senderName: string;
  senderAvatar: string;
  text?: string;
  contenido?: string;
  time: string;
  leido: boolean;
  editado: boolean;
  estado_entrega: "enviado" | "recibido" | "leido";
  tipo_mensaje: "texto" | "archivo" | "ubicacion" | "sistema";
  archivo?: string | null;
  archivo_nombre?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  reply_to?: number | null;
  attachment?: MensajeAttachment;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface GetConversacionesParams {
  q?: string;
  page?: number;
  page_size?: number;
}

export interface GetMensajesParams {
  before?: number | string;
  page_size?: number;
}

export interface SendMensajePayload {
  contenido?: string;
  archivo?: File;
  latitud?: number;
  longitud?: number;
  reply_to?: number;
}

// --- CLIENTE API CHAT ---

export const chatApi = {
  // 1. Obtener lista de conversaciones
  getConversaciones: async (
    params: GetConversacionesParams = {}
  ): Promise<PaginatedResponse<ConversacionItem>> => {
    const query = new URLSearchParams();
    if (params.q) query.append("q", params.q);
    if (params.page) query.append("page", params.page.toString());
    if (params.page_size) query.append("page_size", params.page_size.toString());

    const queryString = query.toString();
    const endpoint = `/api/mensajeria/conversaciones/${queryString ? `?${queryString}` : ""}`;
    return apiGet<PaginatedResponse<ConversacionItem>>(endpoint);
  },

  // 2. Crear o recuperar conversación existente (Idempotente)
  createConversacion: async (payload: {
    proveedor_id: string;
    servicio_id?: number;
  }): Promise<ConversacionDetail> => {
    return apiPost<ConversacionDetail>("/api/mensajeria/conversaciones/", payload);
  },

  // 3. Obtener detalle de conversación
  getConversacionDetail: async (id: string): Promise<ConversacionDetail> => {
    return apiGet<ConversacionDetail>(`/api/mensajeria/conversaciones/${id}/`);
  },

  // 4. Archivar conversación (Soft delete)
  archivarConversacion: async (id: string): Promise<void> => {
    return apiDelete<void>(`/api/mensajeria/conversaciones/${id}/`);
  },

  // 5. Señal de indicador de escritura ("start" | "stop")
  sendTypingSignal: async (
    conversacionId: string,
    action: "start" | "stop"
  ): Promise<void> => {
    return apiPost<void>(`/api/mensajeria/conversaciones/${conversacionId}/typing/`, {
      action,
    });
  },

  // 5b. Marca la conversación como leída por el usuario actual (limpia badge
  // de no-leídos en BD y dispara el broadcast "read_receipt" al otro usuario).
  marcarLeido: async (conversacionId: string): Promise<void> => {
    return apiPatch<void>(`/api/mensajeria/conversaciones/${conversacionId}/leido/`, {});
  },

  // 6. Obtener historial de mensajes de una conversación
  getMensajes: async (
    conversacionId: string,
    params: GetMensajesParams = {}
  ): Promise<PaginatedResponse<Mensaje>> => {
    const query = new URLSearchParams();
    if (params.before) query.append("before", params.before.toString());
    if (params.page_size) query.append("page_size", params.page_size.toString());

    const queryString = query.toString();
    const endpoint = `/api/mensajeria/conversaciones/${conversacionId}/mensajes/${
      queryString ? `?${queryString}` : ""
    }`;
    return apiGet<PaginatedResponse<Mensaje>>(endpoint);
  },

  // 7. Enviar un mensaje (Soporta JSON o multipart/form-data)
  sendMensaje: async (
    conversacionId: string,
    payload: SendMensajePayload
  ): Promise<Mensaje> => {
    const endpoint = `/api/mensajeria/conversaciones/${conversacionId}/mensajes/`;

    // Si viene un archivo, debemos enviar multipart/form-data
    if (payload.archivo) {
      const formData = new FormData();
      if (payload.contenido) formData.append("contenido", payload.contenido);
      formData.append("archivo", payload.archivo);
      if (payload.reply_to) formData.append("reply_to", payload.reply_to.toString());

      return apiPost<Mensaje>(endpoint, formData);
    }

    // Si es solo texto o ubicación
    return apiPost<Mensaje>(endpoint, {
      contenido: payload.contenido,
      latitud: payload.latitud,
      longitud: payload.longitud,
      reply_to: payload.reply_to,
    });
  },

  // 8. Obtener detalle de un mensaje individual
  getMensajeDetail: async (
    conversacionId: string,
    mensajeId: number | string
  ): Promise<Mensaje> => {
    return apiGet<Mensaje>(
      `/api/mensajeria/conversaciones/${conversacionId}/mensajes/${mensajeId}/`
    );
  },

  // 9. Editar contenido de un mensaje
  editarMensaje: async (
    conversacionId: string,
    mensajeId: number | string,
    contenido: string
  ): Promise<Mensaje> => {
    return apiPatch<Mensaje>(
      `/api/mensajeria/conversaciones/${conversacionId}/mensajes/${mensajeId}/`,
      { contenido }
    );
  },

  // 10. Eliminar mensaje (Soft delete)
  eliminarMensaje: async (
    conversacionId: string,
    mensajeId: number | string
  ): Promise<void> => {
    return apiDelete<void>(
      `/api/mensajeria/conversaciones/${conversacionId}/mensajes/${mensajeId}/`
    );
  },

  // 11. Descargar archivo adjunto con autenticación JWT
  downloadArchivoAdjunto: async (mensajeId: number | string): Promise<Blob> => {
    const endpoint = `/api/mensajeria/mensajes/${mensajeId}/archivo/`;
    // Usamos fetch directo pasando la URL completa y reutilizando el token del apiClient si es necesario
    const res = await apiGet<Blob>(endpoint, { responseType: "blob" } as any);
    return res;
  },
};