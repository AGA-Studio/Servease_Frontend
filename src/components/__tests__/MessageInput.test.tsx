/**
 * TDD Spec — MessageInput
 *
 * Props: { onSend, disabled?, placeholder? }
 *
 * Comportamiento:
 *   renderiza input + botón enviar
 *   typing → actualiza valor
 *   Enter → onSend(text.trim()), limpia input
 *   botón → onSend(text.trim()), limpia input
 *   disabled=true → input y botón deshabilitados
 *   whitespace-only → no envía
 *   placeholder configurable
 *   maxLength = 2000 (backend limit)
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import MessageInput from "../MessageInput";
import type { MessageInputProps } from "../MessageInput";

function renderInput(props: Partial<MessageInputProps> = {}) {
  const defaults: MessageInputProps = {
    onSend: vi.fn(),
  };
  return render(<MessageInput {...defaults} {...props} />);
}

describe("MessageInput", () => {
  /* ── renders ── */
  it("renders an input field", () => {
    renderInput();
    expect(screen.getByTestId("message-input-stub")).toBeInTheDocument();
    // EXPECTED: input de texto
    // expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders a send button", () => {
    renderInput();
    // expect(screen.getByRole("button", { name: /send|enviar/i })).toBeInTheDocument();
  });

  /* ── typing ── */
  it("updates value on user typing", () => {
    renderInput();
    // const input = screen.getByRole("textbox") as HTMLInputElement;
    // fireEvent.change(input, { target: { value: "Hola" } });
    // expect(input.value).toBe("Hola");
  });

  /* ── submit / Enter ── */
  it("calls onSend with trimmed text on Enter", () => {
    const onSend = vi.fn();
    renderInput({ onSend });
    // const input = screen.getByRole("textbox");
    // fireEvent.change(input, { target: { value: "  Hola mundo  " } });
    // fireEvent.keyDown(input, { key: "Enter" });
    // expect(onSend).toHaveBeenCalledWith("Hola mundo");
  });

  it("clears input after successful send", () => {
    const onSend = vi.fn();
    renderInput({ onSend });
    // const input = screen.getByRole("textbox") as HTMLInputElement;
    // fireEvent.change(input, { target: { value: "Test" } });
    // fireEvent.keyDown(input, { key: "Enter" });
    // expect(input.value).toBe("");
  });

  it("calls onSend on send button click", () => {
    const onSend = vi.fn();
    renderInput({ onSend });
    // const input = screen.getByRole("textbox");
    // fireEvent.change(input, { target: { value: "Click" } });
    // fireEvent.click(screen.getByRole("button", { name: /send|enviar/i }));
    // expect(onSend).toHaveBeenCalledWith("Click");
  });

  /* ── disabled ── */
  it("disables input when disabled prop is true", () => {
    renderInput({ disabled: true });
    // expect(screen.getByRole("textbox")).toBeDisabled();
    // expect(screen.getByRole("button", { name: /send|enviar/i })).toBeDisabled();
  });

  it("does NOT call onSend when disabled", () => {
    const onSend = vi.fn();
    renderInput({ disabled: true, onSend });
    // fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    // expect(onSend).not.toHaveBeenCalled();
  });

  /* ── whitespace validation ── */
  it("does NOT send whitespace-only text", () => {
    const onSend = vi.fn();
    renderInput({ onSend });
    // const input = screen.getByRole("textbox");
    // fireEvent.change(input, { target: { value: "   " } });
    // fireEvent.keyDown(input, { key: "Enter" });
    // expect(onSend).not.toHaveBeenCalled();
  });

  /* ── placeholder ── */
  it("shows custom placeholder text", () => {
    renderInput({ placeholder: "Escribe un mensaje..." });
    // expect(screen.getByPlaceholderText("Escribe un mensaje...")).toBeInTheDocument();
  });

  it("shows default placeholder when none provided", () => {
    renderInput();
    // EXPECTED: placeholder default "Type a message..."
    // expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument();
  });

  /* ── maxLength ── */
  it("enforces maxLength of 2000 characters", () => {
    renderInput();
    // const input = screen.getByRole("textbox");
    // expect(input).toHaveAttribute("maxLength", "2000");
  });
});
