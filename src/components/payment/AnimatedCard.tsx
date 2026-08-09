import { motion, AnimatePresence } from "motion/react";
import { Wifi } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

export type FieldStatus = "empty" | "typing" | "complete" | "error";
export type CardBrand =
  | "visa"
  | "mastercard"
  | "amex"
  | "discover"
  | "unknown";

export interface AnimatedCardProps {
  isDark: boolean;
  brand: CardBrand;
  numberStatus: FieldStatus;
  expiryStatus: FieldStatus;
  cvcStatus: FieldStatus;
  isCvcFocused: boolean;
}

const BRAND_GRADIENTS: Record<CardBrand, string> = {
  visa: "linear-gradient(135deg, #1a1f71 0%, #2a3a9c 45%, #0f4c94 100%)",
  mastercard: "linear-gradient(135deg, #1f1c2e 0%, #2d2440 50%, #241b2f 100%)",
  amex: "linear-gradient(135deg, #006b6b 0%, #0a8a8a 50%, #2EBCCC 100%)",
  discover: "linear-gradient(135deg, #4a2c00 0%, #8a5a00 50%, #FFB200 100%)",
  unknown: "linear-gradient(135deg, #1B244C 0%, #2a3570 50%, #1e2d5e 100%)",
};

function BrandMark({ brand }: { brand: CardBrand }) {
  if (brand === "visa") {
    return (
      <span style={{ fontStyle: "italic", fontWeight: 800, fontSize: "1.3rem", color: "#fff", letterSpacing: -1 }}>
        VISA
      </span>
    );
  }
  if (brand === "mastercard") {
    return (
      <span style={{ display: "flex", alignItems: "center" }}>
        <span style={{ width: 26, height: 26, borderRadius: "50%", background: "#EB001B", opacity: 0.9 }} />
        <span style={{ width: 26, height: 26, borderRadius: "50%", background: "#F79E1B", opacity: 0.9, marginLeft: -10 }} />
      </span>
    );
  }
  if (brand === "amex") {
    return (
      <span
        style={{
          fontWeight: 800,
          fontSize: "0.8rem",
          color: "#006b6b",
          background: "#fff",
          padding: "3px 8px",
          borderRadius: 4,
          letterSpacing: 0.5,
        }}
      >
        AMEX
      </span>
    );
  }
  if (brand === "discover") {
    return (
      <span style={{ fontWeight: 800, fontSize: "1rem", color: "#fff", fontStyle: "italic" }}>
        Discover
      </span>
    );
  }
  return <Wifi size={22} color="rgba(255,255,255,0.55)" style={{ transform: "rotate(90deg)" }} />;
}

const MaskGroup = ({
  status,
  digits = 4,
  size = "number",
  dark = false,
}: {
  status: FieldStatus;
  digits?: number;
  size?: "number" | "small";
  dark?: boolean;
}) => {
  const filled = status === "complete";
  const dotSize = size === "number" ? 8 : 6;
  const baseColor = status === "error" ? "#ff6b6b" : dark ? "#1B244C" : "#ffffff";
  return (
    <span style={{ display: "inline-flex", gap: size === "number" ? 5 : 4 }}>
      {Array.from({ length: digits }).map((_, i) => (
        <motion.span
          key={i}
          initial={false}
          animate={
            filled
              ? { opacity: 1, scale: 1 }
              : status === "typing"
                ? { opacity: [0.35, 0.8, 0.35], scale: 1 }
                : { opacity: 0.28, scale: 0.85 }
          }
          transition={
            status === "typing" && !filled
              ? { duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: i * 0.08 }
              : { duration: 0.28, ease: EASE, delay: filled ? i * 0.045 : 0 }
          }
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: "50%",
            background: baseColor,
            display: "inline-block",
          }}
        />
      ))}
    </span>
  );
};

const cardFaceBase: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  borderRadius: 20,
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
  padding: "22px 24px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  boxShadow: "0 16px 40px -12px rgba(0,0,0,0.45)",
  color: "#fff",
  overflow: "hidden",
};

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  brand,
  numberStatus,
  expiryStatus,
  cvcStatus,
  isCvcFocused,
}) => {
  return (
    <div style={{ perspective: 1200, width: "100%", maxWidth: 340, margin: "0 auto" }}>
      <motion.div
        animate={{ rotateY: isCvcFocused ? 180 : 0 }}
        transition={{ duration: 0.55, ease: EASE }}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1.586",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Front face */}
        <div style={{ ...cardFaceBase, background: BRAND_GRADIENTS[brand] }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.08, background: "radial-gradient(circle at 85% 15%, #fff 0%, transparent 55%)" }} />

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div
              style={{
                width: 38,
                height: 28,
                borderRadius: 6,
                background: "linear-gradient(135deg, #d4af6a, #f4e2b8)",
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.15)",
              }}
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={brand}
                initial={{ opacity: 0, y: -6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.9 }}
                transition={{ duration: 0.22, ease: EASE }}
              >
                <BrandMark brand={brand} />
              </motion.div>
            </AnimatePresence>
          </div>

          <div style={{ display: "flex", gap: 18, fontSize: "1.05rem", fontFamily: "'Courier New', monospace", fontWeight: 700 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <MaskGroup key={i} status={numberStatus} />
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "0.55rem", opacity: 0.6, letterSpacing: 1, marginBottom: 4 }}>TITULAR</div>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: 1, opacity: 0.9 }}>•••• •••••••</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.55rem", opacity: 0.6, letterSpacing: 1, marginBottom: 4 }}>VÁLIDA HASTA</div>
              <div style={{ fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: "0.85rem" }}>
                <MaskGroup status={expiryStatus} digits={2} size="small" />
                <span style={{ margin: "0 3px", opacity: 0.6 }}>/</span>
                <MaskGroup status={expiryStatus} digits={2} size="small" />
              </div>
            </div>
          </div>
        </div>

        {/* Back face */}
        <div style={{ ...cardFaceBase, background: BRAND_GRADIENTS[brand], transform: "rotateY(180deg)" }}>
          <div style={{ height: 38, background: "#0b0b0b", margin: "14px -24px 0" }} />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div
              style={{
                background: "#f4f4f4",
                borderRadius: 6,
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                minWidth: 70,
                justifyContent: "flex-end",
              }}
            >
              <MaskGroup status={cvcStatus} digits={brand === "amex" ? 4 : 3} size="small" dark />
            </div>
          </div>
          <div style={{ fontSize: "0.6rem", opacity: 0.55, lineHeight: 1.5 }}>
            Servease procesa este pago de forma segura a través de Stripe.
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnimatedCard;
