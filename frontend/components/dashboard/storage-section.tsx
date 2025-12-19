"use client";

import { Button } from "@/components/ui/button";
import { AVAILABLE_DRIVES, getProviderDisplayName, type ProviderType } from "@/lib/schema/drives.schema";
import { useState } from "react";

interface StorageSectionProps {
  connectDrive: (driveName: ProviderType) => void;
  disconnectDrive: (driveName: ProviderType) => void;
  connectedDrives: ProviderType[];
}

export default function StorageSection({
  connectedDrives,
  connectDrive,
  disconnectDrive,
}: StorageSectionProps) {

  const [showDriveMenu, setShowDriveMenu] = useState(false);

  const onToggleDriveMenu = () => {
    setShowDriveMenu(!showDriveMenu);
  };
  return (
    <div className="mb-8 p-6 rounded-lg bg-card border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Connected Storage</h3>

        {/* Connect Drive Button */}
        <div className="relative">
          <Button
            id="connect-drive-button"
            onClick={onToggleDriveMenu}
            className="bg-primary hover:bg-primary/90"
          >
            + Connect Drive
          </Button>

          {/* Drive Selection Menu */}
          {showDriveMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg bg-card border border-border shadow-lg z-50">
              <div className="p-4 border-b border-border">
                <p className="text-sm font-medium mb-3">
                  Select a cloud storage service:
                </p>
                <div className="space-y-2">
                  {AVAILABLE_DRIVES.map((drive) => (
                    <button
                      key={drive.provider}
                      onClick={() => {
                        connectDrive(drive.provider);
                      }}
                      disabled={connectedDrives.includes(drive.provider)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm ${
                        connectedDrives.includes(drive.provider)
                          ? "bg-muted text-muted-foreground cursor-not-allowed"
                          : "hover:bg-primary/20 text-foreground"
                      }`}
                    >
                      {connectedDrives.includes(drive.provider)
                        ? `✓ ${drive.displayName}`
                        : drive.displayName}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={onToggleDriveMenu}
                className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Connected Drives Display */}
      {connectedDrives.length > 0 ? (
        <div id="connected-drives" className="flex gap-3 flex-wrap">
          {connectedDrives.map((drive) => (
            <div
              key={drive}
              className="flex items-center justify-between gap-4 px-4 py-2 rounded-lg bg-primary/10 border border-primary/30"
            >
              <span className="text-sm font-medium text-primary">{getProviderDisplayName(drive)}</span>
              <button
                onClick={() => disconnectDrive(drive)}
                className="text-sm text-primary hover:text-destructive transition-colors"
              >
                Disconnect
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No drives connected. Click &quot;Connect Drive&quot; to get started.
        </p>
      )}
    </div>
  );
}
