"use client"

import { Button } from "@/components/ui/button"

interface ConnectionPromptProps {
  onConnect: (driveName: string) => void
  onSkip: () => void
}

export default function ConnectionPrompt({ onConnect, onSkip }: ConnectionPromptProps) {
  return (
    <div className="mb-8 p-6 rounded-lg bg-card border border-border">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2">Connect Your Cloud Storage</h3>
          <p className="text-muted-foreground mb-4">
            Securely connect Google Drive or Google Photos to access your photos. You can skip this and upload manually
            if you prefer.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Button onClick={() => onConnect("Google Drive")} className="bg-primary hover:bg-primary/90">
              Connect Google Drive
            </Button>
            <Button onClick={() => onConnect("Google Photos")} className="bg-primary hover:bg-primary/90">
              Connect Google Photos
            </Button>
            <Button variant="outline" onClick={onSkip}>
              Skip for Now
            </Button>
          </div>
        </div>
        <button onClick={onSkip} className="text-muted-foreground hover:text-foreground">
          ✕
        </button>
      </div>
    </div>
  )
}
