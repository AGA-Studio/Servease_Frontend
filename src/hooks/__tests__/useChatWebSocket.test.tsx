/**
 * TDD Spec — useChatWebSocket
 *
 * Hook API:
 *   useChatWebSocket({ conversationId, onMessage, onError?, onClose? })
 *   => { isConnected, sendMessage, disconnect, connect }
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useChatWebSocket } from "../useChatWebSocket";

vi.mock("../../lib/authToken", () => ({ getAccessToken: vi.fn() }));
import { getAccessToken } from "../../lib/authToken";

// ── Mock WebSocket ──
class MockWebSocket {
  url: string;
  onopen: (() => void) | null = null;
  onclose: ((e: { code: number }) => void) | null = null;
  onmessage: ((e: { data: string }) => void) | null = null;
  onerror: ((e: Event) => void) | null = null;
  readyState: number;
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  static instances: MockWebSocket[] = [];

  constructor(url: string) {
    this.url = url;
    this.readyState = MockWebSocket.CONNECTING;
    MockWebSocket.instances.push(this);
  }

  send(_data: string) {}
  close() {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.({ code: 1000 });
  }
  simulateOpen() {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.();
  }
  static reset() { MockWebSocket.instances = []; }
}

const tick = () => new Promise((r) => setTimeout(r, 30));

/**
 * Hook options factory.
 * IMPORTANT: onMessage debe ser estable entre renders para evitar que
 * useCallback recalcule connect y el efecto se reinicie (lo que cerraría el WS).
 * Pasamos onMessage por separado en tests que lo necesitan.
 */
function hookOpts(overrides: Record<string, unknown> = {}) {
  return { conversationId: "conv-1", ...overrides } as Parameters<typeof useChatWebSocket>[0];
}

describe("useChatWebSocket", () => {
  let orig: typeof WebSocket;

  beforeEach(() => {
    orig = globalThis.WebSocket;
    globalThis.WebSocket = MockWebSocket as unknown as typeof WebSocket;
    MockWebSocket.reset();
    vi.mocked(getAccessToken).mockResolvedValue("test-token");
  });

  afterEach(() => {
    globalThis.WebSocket = orig;
  });

  /* ── connect ── */
  it("opens a WebSocket connection on mount", async () => {
    const onMsg = vi.fn();
    renderHook(() => useChatWebSocket(hookOpts({ onMessage: onMsg })));
    await tick();
    expect(MockWebSocket.instances.length).toBeGreaterThan(0);
  });

  it("includes the token and conversationId in the WS URL", async () => {
    const onMsg = vi.fn();
    renderHook(() => useChatWebSocket(hookOpts({ conversationId: "conv-42", onMessage: onMsg })));
    await tick();
    expect(MockWebSocket.instances[0].url).toContain("conv-42");
    expect(MockWebSocket.instances[0].url).toContain("token=test-token");
  });

  it("does NOT connect when getAccessToken returns null", async () => {
    const onMsg = vi.fn();
    vi.mocked(getAccessToken).mockResolvedValue(null);
    renderHook(() => useChatWebSocket(hookOpts({ onMessage: onMsg })));
    await tick();
    expect(MockWebSocket.instances.length).toBe(0);
  });

  /* ── disconnect ── */
  it("closes WebSocket on unmount", async () => {
    const onMsg = vi.fn();
    const { unmount } = renderHook(() => useChatWebSocket(hookOpts({ onMessage: onMsg })));
    await tick();
    const closeSpy = vi.spyOn(MockWebSocket.instances[0], "close");
    unmount();
    expect(closeSpy).toHaveBeenCalled();
  });

  /* ── sendMessage ── */
  it("sendMessage sends correctly formatted JSON", async () => {
    const onMsg = vi.fn();
    const { result } = renderHook(() => useChatWebSocket(hookOpts({ onMessage: onMsg })));
    await tick();

    act(() => { MockWebSocket.instances[0].simulateOpen(); });

    const sendSpy = vi.spyOn(MockWebSocket.instances[0], "send");
    act(() => { result.current.sendMessage("Hola mundo"); });

    expect(sendSpy).toHaveBeenCalledOnce();
    const sent = JSON.parse(sendSpy.mock.calls[0][0]);
    expect(sent.action).toBe("new_message");
    expect(sent.contenido).toBe("Hola mundo");
  });

  it("sendMessage does nothing when WebSocket not open", async () => {
    const onMsg = vi.fn();
    const { result } = renderHook(() => useChatWebSocket(hookOpts({ onMessage: onMsg })));
    await tick();

    const sendSpy = vi.spyOn(MockWebSocket.instances[0], "send");
    act(() => { result.current.sendMessage("test"); });

    expect(sendSpy).not.toHaveBeenCalled();
  });

  /* ── receive ── */
  it("calls onMessage when receiving data", async () => {
    const onMessage = vi.fn();
    renderHook(() => useChatWebSocket(hookOpts({ onMessage })));
    await tick();
    act(() => { MockWebSocket.instances[0].simulateOpen(); });
    act(() => {
      MockWebSocket.instances[0].onmessage?.({ data: JSON.stringify({ id: 1, text: "hi" }) });
    });
    expect(onMessage).toHaveBeenCalledWith({ id: 1, text: "hi" });
  });

  it("handles JSON parse errors gracefully (no crash)", async () => {
    const onMsg = vi.fn();
    renderHook(() => useChatWebSocket(hookOpts({ onMessage: onMsg })));
    await tick();
    expect(() => {
      act(() => MockWebSocket.instances[0].onmessage?.({ data: "invalid json" }));
    }).not.toThrow();
  });

  /* ── connected state ── */
  it("isConnected reflects connection status", async () => {
    const onMsg = vi.fn();
    const { result } = renderHook(() => useChatWebSocket(hookOpts({ onMessage: onMsg })));
    await tick();

    expect(result.current.isConnected).toBe(false);

    act(() => { MockWebSocket.instances[0].simulateOpen(); });
    expect(result.current.isConnected).toBe(true);
  });

  it("isConnected goes to false on close", async () => {
    const onMsg = vi.fn();
    const { result } = renderHook(() => useChatWebSocket(hookOpts({ onMessage: onMsg })));
    await tick();
    act(() => { MockWebSocket.instances[0].simulateOpen(); });
    expect(result.current.isConnected).toBe(true);

    act(() => { MockWebSocket.instances[0].close(); });
    expect(result.current.isConnected).toBe(false);
  });

  /* ── error ── */
  it("calls onError when WebSocket error event fires", async () => {
    const onMsg = vi.fn();
    const onError = vi.fn();
    renderHook(() => useChatWebSocket(hookOpts({ onMessage: onMsg, onError })));
    await tick();
    act(() => MockWebSocket.instances[0].onerror?.(new Event("error")));
    expect(onError).toHaveBeenCalled();
  });
});
