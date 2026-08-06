import {
  Wrench,
  Zap,
  Sprout,
  SprayCan,
  Hammer,
  Paintbrush,
  KeyRound,
  Wind,
  Bug,
  Truck,
  Tag,
  type LucideIcon,
} from "lucide-react";

export interface CategoryStyle {
  icon: LucideIcon;
  color: string;
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  plomeria: { icon: Wrench, color: "#2EBCCC" },
  electricidad: { icon: Zap, color: "#FFB200" },
  jardineria: { icon: Sprout, color: "#4AA825" },
  limpieza: { icon: SprayCan, color: "#0EA5E9" },
  carpinteria: { icon: Hammer, color: "#B45309" },
  pintura: { icon: Paintbrush, color: "#845EF7" },
  cerrajeria: { icon: KeyRound, color: "#64748B" },
  aireacondicionado: { icon: Wind, color: "#06B6D4" },
  controldeplagas: { icon: Bug, color: "#DC2626" },
  mudanza: { icon: Truck, color: "#F97316" },
  otro: { icon: Tag, color: "#989898" },
};

const ALIASES: Record<string, keyof typeof CATEGORY_STYLES> = {
  plumbing: "plomeria",
  electrical: "electricidad",
  gardening: "jardineria",
  cleaning: "limpieza",
  carpentry: "carpinteria",
  painting: "pintura",
  locksmith: "cerrajeria",
  hvac: "aireacondicionado",
  pestcontrol: "controldeplagas",
  moving: "mudanza",
  mudanzas: "mudanza",
  other: "otro",
  otros: "otro",
};

export const DEFAULT_CATEGORY_STYLE: CategoryStyle = { icon: Tag, color: "#989898" };

function normalize(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

export function getCategoryStyle(name: string | null | undefined): CategoryStyle {
  if (!name) return DEFAULT_CATEGORY_STYLE;
  const key = normalize(name);
  const resolvedKey = ALIASES[key] ?? key;
  return CATEGORY_STYLES[resolvedKey] ?? DEFAULT_CATEGORY_STYLE;
}
