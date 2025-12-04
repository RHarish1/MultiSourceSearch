export type ThemeName = "warm-terracotta" | "warm-rust" | "warm-emerald";

export interface ThemeColors {
  background: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  accentText: string;
  card: string;
  hover: string;
}

export const THEMES: Record<ThemeName, ThemeColors> = {
  // Warm Tones Variations
  "warm-terracotta": {
    background: "#1C1C1C",
    text: "#F5E8D8",
    textSecondary: "#D4C4B4",
    border: "#3D3D3D",
    accent: "#FF6F61",
    accentLight: "#FF8A78",
    accentDark: "#E55A4F",
    accentText: "#FFFFFF",
    card: "#252525",
    hover: "#2F2F2F",
  },

  "warm-rust": {
    background: "#1C1C1C",
    text: "#F5E8D8",
    textSecondary: "#D4C4B4",
    border: "#3D3D3D",
    accent: "#C85A54",
    accentLight: "#D97060",
    accentDark: "#A34A47",
    accentText: "#FFFFFF",
    card: "#252525",
    hover: "#2F2F2F",
  },

  // Warm Luxe Variations
  "warm-emerald": {
    background: "#1C1C1C",
    text: "#F5E8D8",
    textSecondary: "#D4C4B4",
    border: "#3D3D3D",
    accent: "#2D9E78",
    accentLight: "#3DB88E",
    accentDark: "#237D62",
    accentText: "#FFFFFF",
    card: "#252525",
    hover: "#2F2F2F",
  },
};

export const THEME_NAMES: Array<{
  value: ThemeName;
  label: string;
  description: string;
}> = [
  // Warm Tones variations
  {
    value: "warm-terracotta",
    label: "Terracotta",
    description: "Warm terracotta accents",
  },
  { value: "warm-rust", label: "Rust", description: "Deep rust accents" },
  // Warm Luxe variations
  {
    value: "warm-emerald",
    label: "Emerald",
    description: "Luxe emerald green",
  },
];
