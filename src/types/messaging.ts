/**
 * Frontend-facing types for the messaging domain.
 *
 * These are the types the UI components consume — they are DECOUPLED from
 * the API response types in messagesApi.ts. The mapping happens in a
 * data layer (custom hook or transform function).
 */

export interface ChatListItem {
  id: string;
  name: string;
  avatar: string;
  professionKey: string;
  lastMessagePreview: string;
  timeAgoKey: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "other";
  senderName: string;
  senderAvatar: string;
  text: string;
  time: string;
  leido: boolean;
  editado: boolean;
}
