"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

interface TourStep {
  id: string
  targetId: string
  title: string
  description: string
  position: "top" | "bottom" | "left" | "right"
}

const tourSteps: TourStep[] = [
  {
    id: "upload",
    targetId: "upload-button",
    title: "Upload Images",
    description:
      "Click to select and upload photos from your device. Your images are stored securely and never leave your control.",
    position: "bottom",
  },
  {
    id: "search",
    targetId: "search-bar",
    title: "Semantic Search",
    description:
      "Use natural language to search your photos. Try queries like 'me with friends at the beach' or 'vacation photos'. The search matches your image tags and names.",
    position: "bottom",
  },
  {
    id: "sort",
    targetId: "sort-dropdown",
    title: "Sort Your Photos",
    description:
      "Organize your photos by newest, oldest, or alphabetically. Use this to quickly find images by when they were uploaded or by name.",
    position: "bottom",
  },
  {
    id: "image-grid",
    targetId: "image-grid",
    title: "View & Tag Images",
    description:
      "Click any image to open it and add custom tags. Tags improve your semantic search results and help you organize photos by topic, location, or people.",
    position: "top",
  },
  {
    id: "connect-button",
    targetId: "connect-drive-button",
    title: "Connect Cloud Storage",
    description:
      "Click to connect Google Drive, Google Photos, OneDrive, or Dropbox. This allows you to securely access and import photos from your cloud storage.",
    position: "bottom",
  },
  {
    id: "connected-drives",
    targetId: "connected-drives",
    title: "Manage Connected Storage",
    description:
      "View and manage your connected cloud storage. Disconnect any service you no longer want to use. Your data remains secure at all times.",
    position: "top",
  },
]

interface TourOverlayProps {
  isActive: boolean
  onComplete: () => void
}

export default function TourOverlay({ isActive, onComplete }: TourOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const [highlightBox, setHighlightBox] = useState({ top: 0, left: 0, width: 0, height: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive) return

    const updatePositions = () => {
      const step = tourSteps[currentStep]
      const targetElement = document.getElementById(step.targetId)

      if (targetElement) {
        const rect = targetElement.getBoundingClientRect()

        // Update highlight box with fixed positioning (viewport-relative)
        setHighlightBox({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        })

        // Calculate tooltip position relative to viewport
        const tooltipOffset = 16
        let tooltipTop = rect.top
        let tooltipLeft = rect.left

        switch (step.position) {
          case "bottom":
            tooltipTop = rect.bottom + tooltipOffset
            tooltipLeft = rect.left + rect.width / 2
            break
          case "top":
            tooltipTop = rect.top - tooltipOffset
            tooltipLeft = rect.left + rect.width / 2
            break
          case "left":
            tooltipTop = rect.top + rect.height / 2
            tooltipLeft = rect.left - tooltipOffset
            break
          case "right":
            tooltipTop = rect.top + rect.height / 2
            tooltipLeft = rect.right + tooltipOffset
            break
        }

        setTooltipPosition({ top: tooltipTop, left: tooltipLeft })
      }
    }

    updatePositions()
    window.addEventListener("resize", updatePositions)
    window.addEventListener("scroll", updatePositions)

    return () => {
      window.removeEventListener("resize", updatePositions)
      window.removeEventListener("scroll", updatePositions)
    }
  }, [currentStep, isActive])

  if (!isActive) return null

  const step = tourSteps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === tourSteps.length - 1

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 z-40 pointer-events-none" />

      {/* Highlight Box - stays with viewport */}
      <div
        className="fixed z-40 border-2 border-primary rounded-lg transition-all duration-300 pointer-events-none"
        style={{
          top: `${highlightBox.top - 4}px`,
          left: `${highlightBox.left - 4}px`,
          width: `${highlightBox.width + 8}px`,
          height: `${highlightBox.height + 8}px`,
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
        }}
      />

      {/* Tooltip - stays with viewport */}
      <div
        ref={tooltipRef}
        className={`fixed z-50 bg-card border border-primary rounded-lg shadow-xl p-4 max-w-sm w-80 transition-all duration-300 ${
          step.position === "top" ? "bottom-auto" : ""
        }`}
        style={{
          top:
            step.position === "top" || step.position === "bottom"
              ? `${tooltipPosition.top}px`
              : `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          transform:
            step.position === "bottom"
              ? "translateX(-50%)"
              : step.position === "top"
                ? "translateX(-50%)"
                : step.position === "left"
                  ? "translate(-100%, -50%)"
                  : "translateY(-50%)",
        }}
      >
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-primary">
            Step {currentStep + 1} of {tourSteps.length}
          </span>
          <div className="flex gap-1">
            {tourSteps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  idx === currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-sm mb-2">{step.title}</h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4">{step.description}</p>

        {/* Navigation Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            variant="outline"
            size="sm"
            disabled={isFirstStep}
            className="flex-1"
          >
            Previous
          </Button>

          {isLastStep ? (
            <Button onClick={onComplete} size="sm" className="flex-1 bg-primary hover:bg-primary/90">
              Got it!
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentStep(Math.min(tourSteps.length - 1, currentStep + 1))}
              size="sm"
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Next
            </Button>
          )}
        </div>

        {/* Skip Tour */}
        <button
          onClick={onComplete}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground text-lg"
        >
          ✕
        </button>
      </div>
    </>
  )
}
