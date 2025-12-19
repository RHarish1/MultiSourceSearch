// Provider types must match backend enum values exactly
export type ProviderType = "google" | "onedrive";

export const PROVIDER_TYPES: Record<ProviderType, ProviderType> = {
  google: "google",
  onedrive: "onedrive",
} as const;

export interface Drive {
  provider: ProviderType;
  displayName: string;
  icon: string;
  color: string;
}

export const AVAILABLE_DRIVES: Drive[] = [
  {
    provider: "google",
    displayName: "Google Drive",
    icon: "🔵",
    color: "#4285F4",
  },
  {
    provider: "onedrive",
    displayName: "OneDrive",
    icon: "🔷",
    color: "#0078D4",
  },
];

// Helper to get display name from provider type
export const getProviderDisplayName = (provider: ProviderType): string => {
  const drive = AVAILABLE_DRIVES.find(d => d.provider === provider);
  return drive?.displayName || provider;
};

// Helper to validate provider type
export const isValidProvider = (provider: string): provider is ProviderType => {
  return provider === "google" || provider === "onedrive";
};
