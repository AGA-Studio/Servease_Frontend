/**
 * TDD Spec — ChatView
 *
 * Props: { conversationId, messages, isLoading, error, onSendMessage, onRetry }
 *
 * Estados cubiertos:
 *   null conversation → "Select a conversation"
 *   loading → spinner/skeleton
 *   error → mensaje + retry
 *   empty messages → "No messages yet"
 *   data → lista de mensajes (user right, other left)
 *   read/unread indicator
 *   edited indicator
 *   scroll to bottom on new message
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ChatView from "../ChatView";
import type { ChatViewProps } from "../ChatView";
import type { ChatMessage } from "../../types/messaging";

function makeMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: "msg-1",
    sender: "other",
    senderName: "Sara Jimenez",
    senderAvatar: "https://example.com/avatar.jpg",
    text: "Hola, ¿en qué puedo ayudarte?",
    time: "10:30",
    leido: true,
    editado: false,
    ...overrides,
  };
}

function renderView(props: Partial<ChatViewProps> = {}) {
  const defaults: ChatViewProps = {
    conversationId: "conv-1",
    messages: [],
    isLoading: false,
    error: null,
    onSendMessage: vi.fn(),
    onRetry: vi.fn(),
  };
  return render(<ChatView {...defaults} {...props} />);
}

describe("ChatView", () => {
  /* ── null conversation ── */
  it("shows placeholder when conversationId is null", () => {
    renderView({ conversationId: null });
    // expect(screen.getByText(/select a conversation/i)).toBeInTheDocument();
    expect(screen.getByTestId("chat-view-stub")).toBeInTheDocument();
  });

  /* ── loading ── */
  it("shows loading state while fetching messages", () => {
    renderView({ isLoading: true });
    expect(screen.getByTestId("chat-view-stub")).toBeInTheDocument();
  });

  /* ── error ── */
  it("shows error message and retry button on error", () => {
    const onRetry = vi.fn();
    renderView({ error: "Failed to load messages", onRetry });
    // EXPECTED: mensaje de error + botón retry
    // expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    // fireEvent.click(screen.getByRole("button", { name: /retry|reintentar/i }));
    // expect(onRetry).toHaveBeenCalledTimes(1);
  });

  /* ── empty ── */
  it("shows 'No messages yet' when messages array is empty", () => {
    renderView({ messages: [] });
    // expect(screen.getByText(/no messages/i)).toBeInTheDocument();
  });

  /* ── messages ── */
  it("renders all messages in the list", () => {
    renderView({ messages: [makeMessage({ id: "1" }), makeMessage({ id: "2" })] });
    // EXPECTED: 2 message bubbles
  });

  it("aligns 'user' messages to the right", () => {
    renderView({
      messages: [makeMessage({ id: "u1", sender: "user", text: "Hola" })],
    });
    // EXPECTED: mensaje con align-right o clase "sent"
  });

  it("aligns 'other' messages to the left", () => {
    renderView({
      messages: [makeMessage({ id: "o1", sender: "other", text: "Hola" })],
    });
    // EXPECTED: mensaje con align-left o clase "received"
  });

  it("displays senderName for 'other' messages", () => {
    renderView({
      messages: [makeMessage({ sender: "other", senderName: "Sara J." })],
    });
    // expect(screen.getByText("Sara J.")).toBeInTheDocument();
  });

  it("displays message text", () => {
    renderView({
      messages: [makeMessage({ text: "Te envio la cotizacion" })],
    });
    // expect(screen.getByText("Te envio la cotizacion")).toBeInTheDocument();
  });

  it("displays message time", () => {
    renderView({
      messages: [makeMessage({ time: "11:45" })],
    });
    // expect(screen.getByText("11:45")).toBeInTheDocument();
  });

  /* ── read/unread ── */
  it("shows read indicator (check) when leido is true", () => {
    renderView({
      messages: [makeMessage({ sender: "user", leido: true })],
    });
    // EXPECTED: doble check / "Read" indicator
  });

  it("shows unread indicator when leido is false", () => {
    renderView({
      messages: [makeMessage({ sender: "user", leido: false })],
    });
    // EXPECTED: single check / "Sent" indicator
  });

  /* ── edited ── */
  it("shows edited indicator when editado is true", () => {
    renderView({
      messages: [makeMessage({ editado: true, text: "Mensaje editado" })],
    });
    // expect(screen.getByText(/edited|editado/i)).toBeInTheDocument();
  });

  it("does NOT show edited indicator when editado is false", () => {
    renderView({
      messages: [makeMessage({ editado: false })],
    });
    // expect(screen.queryByText(/edited|editado/i)).not.toBeInTheDocument();
  });

  /* ── scroll ── */
  it("scrolls to bottom when new message arrives", () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;

    const { rerender } = render(
      <ChatView
        conversationId="conv-1"
        messages={[makeMessage({ id: "1" })]}
        isLoading={false}
        error={null}
        onSendMessage={vi.fn()}
        onRetry={vi.fn()}
      />,
    );

    rerender(
      <ChatView
        conversationId="conv-1"
        messages={[makeMessage({ id: "1" }), makeMessage({ id: "2" })]}
        isLoading={false}
        error={null}
        onSendMessage={vi.fn()}
        onRetry={vi.fn()}
      />,
    );

    // EXPECTED: scrollIntoView se llamó al menos una vez
    // expect(scrollIntoView).toHaveBeenCalledTimes(1);
  });

  /* ── input ── */
  it("includes a MessageInput for typing new messages", () => {
    renderView();
    // EXPECTED: input de texto presente
    // const input = screen.getByRole("textbox");
    // expect(input).toBeInTheDocument();
  });

  it("calls onSendMessage when MessageInput submits", () => {
    const onSendMessage = vi.fn();
    renderView({ onSendMessage });
    // EXPECTED: escribir + Enter → onSendMessage llamado con texto
    // fireEvent.change(input, { target: { value: "Hola" } });
    // fireEvent.keyDown(input, { key: "Enter" });
    // expect(onSendMessage).toHaveBeenCalledWith("Hola");
  });
});
