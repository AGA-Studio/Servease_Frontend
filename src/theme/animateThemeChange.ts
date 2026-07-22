// Applies a theme change with a circular reveal transition (View Transitions API),
// expanding from the click origin. Falls back to an instant switch when unsupported
// or when the user prefers reduced motion.

import type { ThemeMode } from "./theme";

const applyTheme = (mode: ThemeMode) => {
  document.documentElement.setAttribute("data-theme", mode);
  localStorage.setItem("servease-theme", mode);
};

export const animateThemeChange = (
  mode: ThemeMode,
  originX?: number,
  originY?: number,
) => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!document.startViewTransition || reducedMotion) {
    applyTheme(mode);
    return;
  }

  const x = originX ?? window.innerWidth / 2;
  const y = originY ?? window.innerHeight / 2;
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  const transition = document.startViewTransition(() => applyTheme(mode));

  transition.ready.then(() => {
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 550,
        easing: "cubic-bezier(0.23, 1, 0.32, 1)",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  });
};
