import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";

interface Props {
  label: string;
  isDark: boolean;
  children: (
    handlers: {
      ref: React.RefObject<HTMLButtonElement | null>;
      onMouseEnter: () => void;
      onMouseLeave: () => void;
    },
    hovered: boolean,
  ) => React.ReactNode;
  disabled?: boolean;
}

const TRANSITION_MS = 150;

const IconTooltip = ({ label, isDark, children, disabled = false }: Props) => {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [animatedIn, setAnimatedIn] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updatePos = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 6,
      left: rect.left + rect.width / 2,
    });
  }, []);

  const show = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setHovered(true);
    if (disabled) return;
    updatePos();
    setVisible(true);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setAnimatedIn(true)),
    );
  }, [disabled, updatePos]);

  const hide = useCallback(() => {
    setHovered(false);
    setAnimatedIn(false);
    hideTimer.current = setTimeout(() => setVisible(false), TRANSITION_MS);
  }, []);

  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current); }, []);

  const cardBg = isDark ? "#1e2d5e" : "#ffffff";
  const text = isDark ? "#ffffff" : "#000000";
  const divider = isDark ? "#273570" : "#e5e7eb";

  return (
    <>
      {children({ ref: btnRef, onMouseEnter: show, onMouseLeave: hide }, hovered)}
      {visible &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              transform: `translateX(-50%) translateY(${animatedIn ? 0 : -4}px)`,
              zIndex: 99999,
              background: cardBg,
              border: `1px solid ${divider}`,
              borderRadius: 8,
              padding: "5px 10px",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: text,
              whiteSpace: "nowrap",
              pointerEvents: "none",
              boxShadow: isDark
                ? "0 4px 16px rgba(0,0,0,0.45)"
                : "0 4px 16px rgba(0,0,0,0.10)",
              opacity: animatedIn ? 1 : 0,
              transition: `opacity ${TRANSITION_MS}ms ease, transform ${TRANSITION_MS}ms ease`,
              fontFamily: "inherit",
            }}
          >
            {label}
          </div>,
          document.body,
        )}
    </>
  );
};

export default IconTooltip;
