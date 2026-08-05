import { apiGet, apiPost, apiPatch, apiDelete } from "./apiClient";

export interface Conversation {
  id_conversacion: string;
  cliente: UserSummary;
  proveedor: UserSummary;
  ultimo_mensaje_preview: string | null;
  ultimo_mensaje_fecha: string | null;
  estado: "activa" | "archivada";
  unread_count: number;
  created_at: string;
}

export interface UserSummary {
  id: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  url_foto_perfil: string | null;
}

export interface Message {
  id_mensaje: string;
  conversacion: string;
  emisor: string;
  contenido: string;
  fecha: string;
  leido: boolean;
  editado: boolean;
  sender: "user" | "other";
  senderName: string;
}

export interface CreateConversationRequest {
  proveedor_id: string;
}

export interface SendMessageRequest {
  contenido: string;
}

export interface EditMessageRequest {
  contenido: string;
}

export async function listConversations(): Promise<Conversation[]> {
  return apiGet<Conversation[]>("/api/mensajeria/conversaciones/");
}

export async function createConversation(data: CreateConversationRequest): Promise<Conversation> {
  return apiPost<Conversation>("/api/mensajeria/conversaciones/", data);
}

export async function getConversation(id: string): Promise<Conversation> {
  return apiGet<Conversation>(`/api/mensajeria/conversaciones/${id}/`);
}

export async function archiveConversation(id: string): Promise<void> {
  return apiDelete<void>(`/api/mensajeria/conversaciones/${id}/`);
}

/** Returns a flat array of messages, newest-first, capped at 50.
 *  Pass `before` (id_mensaje) for cursor-based pagination. */
export async function listMessages(
  conversationId: string,
  before?: string
): Promise<Message[]> {
  const params = before ? `?before=${before}` : "";
  return apiGet<Message[]>(`/api/mensajeria/conversaciones/${conversationId}/mensajes/${params}`);
}

export async function sendMessage(
  conversationId: string,
  data: SendMessageRequest
): Promise<Message> {
  return apiPost<Message>(`/api/mensajeria/conversaciones/${conversationId}/mensajes/`, data);
}

export async function getMessage(
  conversationId: string,
  messageId: string
): Promise<Message> {
  return apiGet<Message>(`/api/mensajeria/conversaciones/${conversationId}/mensajes/${messageId}/`);
}

export async function editMessage(
  conversationId: string,
  messageId: string,
  data: EditMessageRequest
): Promise<Message> {
  return apiPatch<Message>(
    `/api/mensajeria/conversaciones/${conversationId}/mensajes/${messageId}/`,
    data
  );
}

export async function deleteMessage(
  conversationId: string,
  messageId: string
): Promise<void> {
  return apiDelete<void>(
    `/api/mensajeria/conversaciones/${conversationId}/mensajes/${messageId}/`
  );
}

export async function markAsRead(conversationId: string): Promise<{ count: number }> {
  return apiPatch<{ count: number }>(
    `/api/mensajeria/conversaciones/${conversationId}/leido/`,
    {}
  );
}

// ===== BLOQUEO DE USUARIOS =====

export interface Bloqueo {
  id: string;
  bloqueado: UserSummary;
  fecha: string;
}

export async function blockUser(bloqueadoId: string): Promise<Bloqueo> {
  return apiPost<Bloqueo>("/api/mensajeria/bloquear/", { bloqueado_id: bloqueadoId });
}

export async function listBlocks(): Promise<Bloqueo[]> {
  return apiGet<Bloqueo[]>("/api/mensajeria/bloquear/");
}

export async function unblockUser(bloqueoId: string): Promise<void> {
  return apiDelete<void>(`/api/mensajeria/bloquear/${bloqueoId}/`);
}
