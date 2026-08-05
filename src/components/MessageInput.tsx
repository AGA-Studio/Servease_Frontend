import { useState, useRef, useCallback, useEffect } from "react";

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function MessageInput({ onSend, disabled = false, placeholder = "Escribe un mensaje..." }: MessageInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [rows, setRows] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    // Auto-resize textarea
    const lines = value.split("\n").length;
    setRows(Math.min(Math.max(lines, 1), 5));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setText("");
      setRows(1);
    }
  };

  // Auto-resize on mount if there's initial text
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      const lineHeight = 24; // approximate line height
      const newRows = Math.min(Math.max(Math.ceil(scrollHeight / lineHeight), 1), 5);
      setRows(newRows);
    }
  }, [text]);

  return (
    <div className="message-input-container" style={styles.container}>
      <div className="input-wrapper" style={styles.wrapper}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          style={styles.textarea}
          aria-label="Mensaje"
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || text.trim() === ""}
          style={styles.sendBtn}
          aria-label="Enviar mensaje"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
      {disabled && <p style={styles.disabledHint}>Conectando...</p>}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "12px 16px",
    background: "var(--card-bg)",
    borderTop: "1px solid var(--divider)",
  },
  wrapper: {
    display: "flex",
    alignItems: "flex-end",
    gap: 12,
    background: "var(--main-bg)",
    border: "1px solid var(--divider)",
    borderRadius: 24,
    padding: "8px 16px",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  textarea: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    resize: "none",
    fontSize: "0.95rem",
    lineHeight: 1.5,
    color: "var(--text)",
    fontFamily: "inherit",
    minHeight: 24,
    maxHeight: 120,
    padding: 0,
    width: "100%",
  },
  sendBtn: {
    flexShrink: 0,
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "#2EBCCC",
    color: "white",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s, transform 0.1s",
    opacity: 1,
  },
  disabledHint: {
    marginTop: 8,
    fontSize: "0.75rem",
    color: "var(--text-secondary)",
    textAlign: "center",
  },
};
