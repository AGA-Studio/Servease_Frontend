

import { useEffect, useState } from "react";
import type { ThemeMode } from "./theme";

const readTheme = (): ThemeMode =>
  (document.documentElement.getAttribute("data-theme") as ThemeMode) || "light";

export const useThemeMode = (): { theme: ThemeMode; isDark: boolean } => {
  const [theme, setTheme] = useState<ThemeMode>(readTheme);

  useEffect(() => {
    const obs = new MutationObserver(() => setTheme(readTheme()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  return { theme, isDark: theme === "dark" };
};
