// Reactive theme hook: reflects the current data-theme attribute and updates live when it changes,
// instead of reading localStorage once at mount (which left screens stuck on the previous theme).

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
