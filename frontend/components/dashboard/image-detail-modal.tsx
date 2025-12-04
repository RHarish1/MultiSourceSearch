"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SelectedImage } from "./dashboard"
import { useState } from "react"

interface ImageDetailModalProps {
  selectedImage: SelectedImage
  onAddTag: (imageId: string, tag: string) => void
  onRemoveTag: (imageId: string, tag: string) => void
  onDeleteImage: (imageId: string) => void
  onClose: () => void
}

export default function ImageDetailModal({
  selectedImage,
  onAddTag,
  onRemoveTag,
  onDeleteImage,
  onClose,
}: ImageDetailModalProps) {
  const [imageTag, setImageTag] = useState("");
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onAddTag(selectedImage.image.id, imageTag);
      setImageTag("");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border sticky top-0 bg-card">
          <h2 className="text-lg font-semibold">{selectedImage.image.name}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Image Preview */}
          <img src={selectedImage.image.thumbnailUrl || "/placeholder.svg"} alt={selectedImage.image.name} className="w-full rounded-lg" />

          {/* Tags Section */}
          <div>
            <h3 className="font-semibold mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedImage.image.tags?.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onRemoveTag(selectedImage.image.id, tag)}
                  className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm hover:bg-destructive/20 hover:text-destructive transition-colors"
                >
                  {tag} ×
                </button>
              ))}
            </div>

            {/* Add Tag Input */}
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Add a tag..."
                value={imageTag}
                onKeyDown={handleKeyPress}
                className="flex-1 bg-background border-border"
              />
              <Button onClick={() => onAddTag(selectedImage.image.id, imageTag)} className="bg-primary hover:bg-primary/90">
                Add
              </Button>
            </div>
          </div>

          {/* Image Metadata */}
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Uploaded: {new Date(selectedImage.image.uploadedAt).toLocaleDateString()}</p>
            <p>Source: {selectedImage.image.source}</p>
          </div>

          {/* Delete Button */}
          <Button onClick={() => onDeleteImage(selectedImage.image.id)} className="w-full bg-destructive hover:bg-destructive/90">
            Delete Image
          </Button>
        </div>
      </div>
    </div>
  )
}
