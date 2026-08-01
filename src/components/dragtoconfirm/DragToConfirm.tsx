import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate, type PanInfo } from "motion/react";
import { Check, ChevronsRight, Loader2 } from "lucide-react";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const THUMB_SIZE = 48;
const TRACK_PADDING = 4;

interface DragToConfirmProps {
  label: string;
  confirmedLabel: string;
  onConfirm: () => void | Promise<void>;
  isDark: boolean;
  accentColor?: string;
  disabled?: boolean;
}

const DragToConfirm: React.FC<DragToConfirmProps> = ({
  label,
  confirmedLabel,
  onConfirm,
  isDark,
  accentColor = "#2EBCCC",
  disabled = false,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const [status, setStatus] = useState<"idle" | "submitting" | "confirmed">("idle");
  const dragX = useMotionValue(0);
  const maxDrag = Math.max(trackWidth - THUMB_SIZE - TRACK_PADDING * 2, 1);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      setTrackWidth(entries[0].contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const labelOpacity = useTransform(dragX, [0, maxDrag * 0.55], [1, 0]);
  const fillWidth = useTransform(dragX, (x) => x + THUMB_SIZE + TRACK_PADDING * 2);

  const handleDragEnd = async (_: PointerEvent, info: PanInfo) => {
    if (status !== "idle") return;
    const passedThreshold = dragX.get() >= maxDrag * 0.72 || info.velocity.x > 700;

    if (!passedThreshold) {
      animate(dragX, 0, { type: "spring", stiffness: 420, damping: 32 });
      return;
    }

    animate(dragX, maxDrag, { type: "spring", stiffness: 380, damping: 34 });
    setStatus("submitting");
    try {
      await onConfirm();
      setStatus("confirmed");
    } catch {
      setStatus("idle");
      animate(dragX, 0, { type: "spring", stiffness: 420, damping: 32 });
    }
  };

  const isLocked = disabled || status !== "idle";

  return (
    <div
      ref={trackRef}
      style={{
        position: "relative",
        width: "100%",
        height: THUMB_SIZE + TRACK_PADDING * 2,
        borderRadius: 999,
        background: isDark ? "#151f45" : "#eef1f4",
        border: `1.5px solid ${isDark ? "#273570" : "#e2e8f0"}`,
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          width: fillWidth,
          background:
            status === "confirmed"
              ? "#4AA825"
              : `linear-gradient(90deg, ${accentColor}55, ${accentColor})`,
          borderRadius: 999,
        }}
      />

      <motion.span
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.85rem",
          fontWeight: 700,
          color: isDark ? "#ffffff" : "#1B244C",
          opacity: status === "confirmed" ? 0 : labelOpacity,
          pointerEvents: "none",
          letterSpacing: "0.01em",
        }}
      >
        {label}
      </motion.span>

      <motion.span
        initial={false}
        animate={{ opacity: status === "confirmed" ? 1 : 0 }}
        transition={{ duration: 0.2, ease: EASE_OUT }}
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.85rem",
          fontWeight: 700,
          color: "#ffffff",
          pointerEvents: "none",
        }}
      >
        {confirmedLabel}
      </motion.span>

      <motion.div
        drag={isLocked ? false : "x"}
        dragConstraints={{ left: 0, right: maxDrag }}
        dragElastic={0}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{
          x: dragX,
          position: "absolute",
          top: TRACK_PADDING,
          left: TRACK_PADDING,
          width: THUMB_SIZE,
          height: THUMB_SIZE,
          borderRadius: "50%",
          background: status === "confirmed" ? "#4AA825" : "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 10px rgba(0,0,0,0.22)",
          cursor: isLocked ? "default" : "grab",
          touchAction: "pan-y",
        }}
        whileTap={isLocked ? undefined : { scale: 0.94 }}
      >
        {status === "submitting" ? (
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
            <Loader2 size={20} color={accentColor} />
          </motion.div>
        ) : status === "confirmed" ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.25, ease: EASE_OUT }}>
            <Check size={20} color="#ffffff" strokeWidth={2.5} />
          </motion.div>
        ) : (
          <ChevronsRight size={20} color={accentColor} />
        )}
      </motion.div>
    </div>
  );
};

export default DragToConfirm;
