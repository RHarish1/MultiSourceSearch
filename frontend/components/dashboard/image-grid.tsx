"use client"

import type React from "react"

import type { Image } from "@/types"

interface ImageGridProps {
  page?: {
    images: Image[], 
    hasNextPage: boolean, 
    nextPage: number
  }, 
  searchQuery: string
  onImageSelect: (image: Image, pageNumber: number, index: number) => void
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function ImageGrid({ page, searchQuery, onImageSelect, onUpload }: ImageGridProps) {
  const images = page?.images || [];
  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96 rounded-lg bg-card border border-border border-dashed">
        <div className="text-center">
          <div className="text-5xl mb-6">📸</div>
          <h3 className="text-xl font-semibold mb-3 text-foreground">No images yet</h3>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {searchQuery
              ? "No images match your search. Try different keywords."
              : "Upload your first image to get started"}
          </p>
          {!searchQuery && (
            <label className="cursor-pointer">
              <div className="inline-block">
                <button className="px-6 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                  Upload Image
                </button>
              </div>
              <input type="file" accept="image/*" onChange={onUpload} className="hidden" />
            </label>
          )}
        </div>
      </div>
    )
  }

  return (
    <div id="image-grid" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {images.map((image) => (
        <div
          key={image.id}
          className="group relative rounded-lg overflow-hidden bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer"
          onClick={() => onImageSelect(image)}
        >
          <div className="aspect-square relative">
            <img
              src={image.src || "/placeholder.svg"}
              alt={image.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="text-white text-sm font-medium">View & Tag</span>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm font-medium truncate text-foreground">{image.name}</p>
            {image.tags && image.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {image.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-xs px-2 py-1 rounded bg-primary/15 text-primary">
                    {tag}
                  </span>
                ))}
                {image.tags.length > 2 && (
                  <span className="text-xs px-2 py-1 rounded bg-primary/15 text-primary">+{image.tags.length - 2}</span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
