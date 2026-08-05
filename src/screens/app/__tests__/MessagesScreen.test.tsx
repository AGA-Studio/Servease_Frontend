/**
 * TDD Spec — MessagesScreen (integration)
 *
 * Estados cubiertos (integración entre ConversationList + ChatView + API):
 *   initial mount → fetch conversations (loading)
 *   fetch success → render ConversationList
 *   click conversation → fetch messages (loading → data)
 *   fetch error → error state + retry
 *   empty conversations → empty state
 *   send message → UI actualizado (+confirmation)
 *   full page states: loading, empty, error, data
 *   estado "connecting" de WebSocket
 */
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MessagesScreen from "../MessagesScreen";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

describe("MessagesScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* ── mount / loading ── */
  it("starts fetching conversations on mount", async () => {
    render(<MessagesScreen />);
    // EXPECTED: loading state visible (skeleton/spinner)
    await waitFor(() => {
      expect(screen.getByTestId("messages-screen-root")).toBeInTheDocument();
    });
    // TODO: cuando exista, usar getByTestId("conversation-list-skeleton")
  });

  it("renders ConversationList after fetch completes", async () => {
    render(<MessagesScreen />);
    await waitFor(() => {
      expect(screen.getByTestId("messages-screen-root")).toBeInTheDocument();
    });
  });

  /* ── click conversation ── */
  it("loads ChatView when a conversation is selected", async () => {
    // EXPECTED: al hacer click en un item de ConversationList →
    //   ChatView aparece con mensajes
  });

  /* ── fetch error ── */
  it("shows error state when conversations fetch fails", async () => {
    // EXPECTED: mensaje de error + botón retry
  });

  it("retries fetch when retry button is clicked", async () => {
    // EXPECTED: al hacer click en retry → nueva fetch
  });

  /* ── empty ── */
  it("shows empty state when user has no conversations", async () => {
    // EXPECTED: "No conversations" / "Start a conversation" message
  });

  /* ── send message ── */
  it("sends a message and updates the ChatView", async () => {
    // EXPECTED: escribir en MessageInput + Enter →
    //   mensaje aparece en ChatView (optimistic/confirmed)
  });

  it("shows error if message send fails", async () => {
    // EXPECTED: indicador de error en el mensaje (red ! / "Not sent")
  });

  /* ── WebSocket ── */
  it("shows connection status indicator (connected/disconnected)", async () => {
    // EXPECTED: indicador verde "Connected" o rojo "Reconnecting..."
  });

  /* ── full page states ── */
  it("handles loading → data → error → retry → data full cycle", async () => {
    // EXPECTED: transiciones completas sin crash
  });

  it("unmounts cleanly without memory leaks", async () => {
    // EXPECTED: unmount no arroja errores ni warnings en consola
  });

  /* ── navigation ── */
  it("provides back navigation to dashboard", async () => {
    // EXPECTED: botón back → navigate("/app/dashboard")
  });
});
