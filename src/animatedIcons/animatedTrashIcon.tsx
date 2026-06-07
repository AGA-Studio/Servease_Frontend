// Animated trash icon: lid lifts on hover, full delete animation on click

import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import type { Transition, Variants } from "framer-motion";
import type { HTMLAttributes } from "react";

export interface TrashIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface TrashIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  color?: string;
}

const LID_VARIANTS: Variants = {
  normal: { y: 0, rotate: 0 },
  hover: { y: -2, rotate: -8 },
  deleting: { y: -4, rotate: -15 },
};

const BODY_VARIANTS: Variants = {
  normal: { scaleY: 1, originY: 1 },
  hover: { scaleY: 1, originY: 1 },
  deleting: { scaleY: [1, 0.92, 1.04, 1], originY: 1 },
};

const LINE_VARIANTS: Variants = {
  normal: { opacity: 1, scaleY: 1 },
  hover: { opacity: 1, scaleY: 1 },
  deleting: { opacity: [1, 0.4, 1], scaleY: [1, 0.7, 1] },
};

const SPRING: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 28,
};

const SPRING_SLOW: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 22,
};

const TrashIcon = forwardRef<TrashIconHandle, TrashIconProps>(
  (
    { onMouseEnter, onMouseLeave, color = "#fff", size = 22, style, ...props },
    ref,
  ) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;
      return {
        startAnimation: async () => {
          await controls.start("deleting");
          await controls.start("normal");
        },
        stopAnimation: () => controls.start("normal"),
      };
    });

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isControlledRef.current) controls.start("hover");
        onMouseEnter?.(e);
      },
      [controls, onMouseEnter],
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isControlledRef.current) controls.start("normal");
        onMouseLeave?.(e);
      },
      [controls, onMouseLeave],
    );

    return (
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          ...style,
        }}
        {...props}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.g
            animate={controls}
            variants={LID_VARIANTS}
            transition={SPRING}
            style={{ originX: "12px", originY: "6px" }}
          >
            <path d="M3 6h18" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </motion.g>

          <motion.path
            animate={controls}
            variants={BODY_VARIANTS}
            transition={SPRING_SLOW}
            d="M19 8v12c0 1-1 2-2 2H7c-1 0-2-1-2-2V8"
          />

          <motion.line
            animate={controls}
            variants={LINE_VARIANTS}
            transition={{ ...SPRING_SLOW, delay: 0.04 }}
            x1="10"
            x2="10"
            y1="11"
            y2="17"
          />
          <motion.line
            animate={controls}
            variants={LINE_VARIANTS}
            transition={{ ...SPRING_SLOW, delay: 0.08 }}
            x1="14"
            x2="14"
            y1="11"
            y2="17"
          />
        </svg>
      </div>
    );
  },
);

TrashIcon.displayName = "TrashIcon";
export default TrashIcon;
