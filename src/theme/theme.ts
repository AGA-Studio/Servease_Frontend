export interface AppTheme {
  mainBg: string;
  primary: string;
  sidebarBg: string;
  sidebarSelected: string;
  sidebarInactive: string;
  sidebarInactiveIcon: string;
  text: string;
  textSecondary: string;
  divider: string;
  borderContainer: string;
  input: string;
  aqua: string;
  orange: string;
  blueKpi: string;
  green: string;
  red: string;
}

export const lightTheme: AppTheme = {
  mainBg: "#F6F8F8",
  primary: "#1B244C",
  sidebarBg: "#FFFFFF",
  sidebarSelected: "#2EBCCC",
  sidebarInactive: "rgba(27,36,76,0.7)",
  sidebarInactiveIcon: "#1B244C",
  text: "#000000",
  textSecondary: "#989898",
  divider: "#CCCCCC",
  borderContainer: "#E5E7EB",
  input: "#F8FAFC",
  aqua: "#2EBCCC",
  orange: "#FFB200",
  blueKpi: "#0432FF",
  green: "#4AA825",
  red: "#FF0000",
};

export const darkTheme: AppTheme = {
  mainBg: "#1B244C",
  primary: "#1B244C",
  sidebarBg: "#1B244C",
  sidebarSelected: "#2EBCCC",
  sidebarInactive: "#EFEFEF",
  sidebarInactiveIcon: "#989898",
  text: "#FFFFFF",
  textSecondary: "#989898",
  divider: "#273570",
  borderContainer: "#1B244C",
  input: "#273570",
  aqua: "#2EBCCC",
  orange: "#FFB200",
  blueKpi: "#0432FF",
  green: "#4AA825",
  red: "#FF0000",
};

export type ThemeMode = "light" | "dark";

export const getTheme = (mode: ThemeMode): AppTheme =>
  mode === "light" ? lightTheme : darkTheme;