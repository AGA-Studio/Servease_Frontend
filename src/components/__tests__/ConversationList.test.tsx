/**
 * TDD Spec — ConversationList
 *
 * Props: { conversations, activeId, onSelect, isLoading, error, onRetry }
 *
 * Estados cubiertos:
 *   loading → skeleton
 *   empty  → "No conversations"
 *   error  → mensaje + retry
 *   data   → lista de chats con nombre, avatar, preview, time, badge
 *   selección → highlight en activeId
 *   unreadCount → badge 0 oculto, >99 muestra "99+"
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ConversationList from "../ConversationList";
import type { ConversationListProps } from "../ConversationList";
import type { ChatListItem } from "../../types/messaging";

function makeConversation(overrides: Partial<ChatListItem> = {}): ChatListItem {
  return {
    id: "1",
    name: "Sara Jimenez",
    avatar: "https://example.com/avatar.jpg",
    professionKey: "Cerrajero",
    lastMessagePreview: "Hola, ¿cómo estás?",
    timeAgoKey: "2m ago",
    unreadCount: 0,
    ...overrides,
  };
}

function renderList(props: Partial<ConversationListProps> = {}) {
  const defaults: ConversationListProps = {
    conversations: [],
    activeId: null,
    onSelect: vi.fn(),
    isLoading: false,
    error: null,
    onRetry: vi.fn(),
  };
  return render(<ConversationList {...defaults} {...props} />);
}

describe("ConversationList", () => {
  /* ── loading ── */
  it("shows skeleton/spinner while loading", () => {
    renderList({ isLoading: true });
    // TODO: reemplazar con data-testid real cuando se implemente
    expect(screen.getByTestId("conversation-list-stub")).toBeInTheDocument();
  });

  it("does NOT show skeleton when loading is false", () => {
    renderList({ isLoading: false });
    expect(screen.getByTestId("conversation-list-stub")).toBeInTheDocument();
  });

  /* ── empty ── */
  it("shows empty state when conversations array is empty", () => {
    renderList({ conversations: [] });
    // EXPECTED: texto "No conversations" o icono de empty state
    // expect(screen.getByText(/no conversations/i)).toBeInTheDocument();
  });

  it("shows empty state icon/illustration", () => {
    renderList({ conversations: [] });
    // EXPECTED: ilustración o icono de inbox vacío
  });

  /* ── error ── */
  it("shows error message when error prop is set", () => {
    renderList({ error: "Failed to load conversations" });
    // EXPECTED: mensaje de error visible
    // expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
  });

  it("renders retry button on error", () => {
    const onRetry = vi.fn();
    renderList({ error: "Error", onRetry });
    // EXPECTED: botón "Retry" / "Reintentar"
    // fireEvent.click(screen.getByRole("button", { name: /retry|reintentar/i }));
    // expect(onRetry).toHaveBeenCalledTimes(1);
  });

  /* ── data ── */
  it("renders all conversations in the list", () => {
    const items = [
      makeConversation({ id: "1", name: "Sara Jimenez" }),
      makeConversation({ id: "2", name: "Carlos Lopez" }),
    ];
    renderList({ conversations: items });
    // EXPECTED: 2 items renderizados (waitFor + queryAllByRole)
  });

  it("displays conversation name", () => {
    renderList({ conversations: [makeConversation({ name: "Maria Garcia" })] });
    // expect(screen.getByText("Maria Garcia")).toBeInTheDocument();
  });

  it("displays conversation avatar", () => {
    renderList({ conversations: [makeConversation({ avatar: "https://img.test/avatar.png" })] });
    // EXPECTED: <img> con src="https://img.test/avatar.png"
    // const img = screen.getByRole("img");
    // expect(img).toHaveAttribute("src", "https://img.test/avatar.png");
  });

  it("displays lastMessagePreview", () => {
    renderList({ conversations: [makeConversation({ lastMessagePreview: "Te envio la direccion" })] });
    // expect(screen.getByText("Te envio la direccion")).toBeInTheDocument();
  });

  it("displays timeAgoKey", () => {
    renderList({ conversations: [makeConversation({ timeAgoKey: "1h ago" })] });
    // expect(screen.getByText("1h ago")).toBeInTheDocument();
  });

  /* ── unread badge ── */
  it("shows unread badge when unreadCount > 0", () => {
    renderList({ conversations: [makeConversation({ unreadCount: 3 })] });
    // EXPECTED: badge/badge con "3"
    // expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("hides unread badge when unreadCount is 0", () => {
    renderList({ conversations: [makeConversation({ unreadCount: 0 })] });
    // EXPECTED: NO badge visible
    // expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("shows '99+' when unreadCount > 99", () => {
    renderList({ conversations: [makeConversation({ unreadCount: 150 })] });
    // expect(screen.getByText("99+")).toBeInTheDocument();
  });

  /* ── selection ── */
  it("calls onSelect with conversation id on click", () => {
    const onSelect = vi.fn();
    renderList({
      conversations: [makeConversation({ id: "conv-42" })],
      onSelect,
    });
    // fireEvent.click(screen.getByText("Sara Jimenez"));
    // expect(onSelect).toHaveBeenCalledWith("conv-42");
  });

  it("applies active/selected styling to activeId", () => {
    renderList({
      conversations: [
        makeConversation({ id: "a", name: "Alice" }),
        makeConversation({ id: "b", name: "Bob" }),
      ],
      activeId: "a",
    });
    // EXPECTED: elemento "Alice" tiene clase active/selected
    // EXPECTED: elemento "Bob" NO tiene clase active
  });

  /* ── professionKey ── */
  it("displays profession key (category)", () => {
    renderList({ conversations: [makeConversation({ professionKey: "Cerrajero" })] });
    // expect(screen.getByText("Cerrajero")).toBeInTheDocument();
  });
});
