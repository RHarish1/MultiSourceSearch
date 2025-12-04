export interface Drive {
  id: string;
  name: string;
  icon: string;
  color: string;
  authEndpoint: string;
}

export const AVAILABLE_DRIVES: Drive[] = [
  {
    id: "google-drive",
    name: "Google Drive",
    icon: "🔵",
    color: "#4285F4",
    authEndpoint: "/auth/google",
  },
  {
    id: "onedrive",
    name: "OneDrive",
    icon: "🔷",
    color: "#0078D4",
    authEndpoint: "/auth/onedrive",
  },
  {
    id: "dropbox",
    name: "Dropbox",
    icon: "📦",
    color: "#0061FF",
    authEndpoint: "/auth/dropbox",
  },
  {
    id: "local",
    name: "Local Upload",
    icon: "💾",
    color: "#6c757d",
    authEndpoint: "/auth/local",
  }
];
