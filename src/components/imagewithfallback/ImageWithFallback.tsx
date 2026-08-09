import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ImageOff } from "lucide-react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

const EASE = [0.22, 1, 0.36, 1] as const;

const Shimmer = ({ bg }: { bg: string }) => (
  <motion.div
    animate={{ opacity: [0.6, 1, 0.6] }}
    transition={{ duration: 1.4, repeat: Infinity, ease: [0.4, 0, 0.6, 1] }}
    style={{ position: "absolute", inset: 0, background: bg }}
  />
);

/**
 * Badge/icon sizing is driven by an explicit size token rather than a
 * container-relative clamp — the callers already know their fixed pixel
 * dimensions (44px avatar-tile vs. 340px hero), and a token gives crisp,
 * intentional proportions instead of a badge that reads as too large in
 * small tiles or lost in big ones.
 */
const SIZE_TOKENS = {
  sm: { badge: 28, icon: 14 },
  md: { badge: 42, icon: 20 },
  lg: { badge: 56, icon: 26 },
} as const;

type FallbackSize = keyof typeof SIZE_TOKENS;

interface ImageWithFallbackProps {
  src?: string | null;
  alt: string;
  isDark: boolean;
  className?: string;
  /** Owns width/height/aspectRatio — the component fills its container. */
  style?: React.CSSProperties;
  borderRadius?: number | string;
  /** Defaults to a generic ImageOff icon; pass a category/context icon to match the surrounding UI. */
  fallbackIcon?: React.ReactNode;
  /** Empty-state badge scale — pick to match the container: sm ≤60px, md ~70-160px, lg >160px. */
  size?: FallbackSize;
  onLoad?: () => void;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  isDark,
  className,
  style,
  borderRadius = 12,
  fallbackIcon,
  size = "md",
  onLoad,
}) => {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading",
  );
  const prevSrc = useRef(src);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prevSrc.current !== src) {
      prevSrc.current = src;
      setStatus("loading");
    }
  }, [src]);

  const token = SIZE_TOKENS[size];
  const emptyBg = isDark ? "#273570" : "#e5e7eb";
  const skeletonBg = emptyBg;
  const badgeBg = isDark ? "rgba(46,188,204,0.16)" : "rgba(46,188,204,0.1)";

  const showImage = Boolean(src) && status !== "error";
  const showEmpty = !src || status === "error";

  return (
    <div
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius,
        background: emptyBg,
        ...style,
      }}
    >
      {showImage && status === "loading" && <Shimmer bg={skeletonBg} />}

      {showImage && (
        <img
          key={src}
          src={src ?? undefined}
          alt={alt}
          onLoad={() => {
            setStatus("loaded");
            onLoad?.();
          }}
          onError={() => setStatus("error")}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: status === "loaded" ? 1 : 0,
            filter:
              !reducedMotion && status !== "loaded" ? "blur(6px)" : "blur(0px)",
            transform:
              !reducedMotion && status !== "loaded"
                ? "scale(1.02)"
                : "scale(1)",
            transition: reducedMotion
              ? "opacity 200ms ease-out"
              : "opacity 250ms cubic-bezier(0.23, 1, 0.32, 1), filter 250ms cubic-bezier(0.23, 1, 0.32, 1), transform 250ms cubic-bezier(0.23, 1, 0.32, 1)",
          }}
        />
      )}

      <motion.div
        initial={false}
        animate={{ opacity: showEmpty ? 1 : 0 }}
        transition={{ duration: 0.2, ease: EASE }}
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: token.badge,
            height: token.badge,
            borderRadius: "50%",
            background: badgeBg,
            color: "#2EBCCC",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {fallbackIcon ?? <ImageOff size={token.icon} />}
        </div>
      </motion.div>
    </div>
  );
};

export default ImageWithFallback;
