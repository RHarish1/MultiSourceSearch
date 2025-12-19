"use client";

import type React from "react";
import { ImagePage } from "./dashboard";
import Image from "next/image";
import { ImageType } from "@/lib/schema/image.schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

interface ImageGridProps {
  page?: ImagePage;
  searchQuery: string;
  onImageSelect: (image: ImageType, pageNumber: number, index: number) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ImageGrid({
  page,
  searchQuery,
  onImageSelect,
  onUpload,
}: ImageGridProps) {
  const images = page?.images || [];
  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96 rounded-lg bg-card border border-border border-dashed">
        <div className="text-center">
          <div className="text-5xl mb-6">📸</div>
          <h3 className="text-xl font-semibold mb-3 text-foreground">
            No images yet
          </h3>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {searchQuery
              ? "No images match your search. Try different keywords."
              : "Upload your first image to get started"}
          </p>
          {!searchQuery && (
            <>
              <label htmlFor="upload-input-grid" className="cursor-pointer inline-block">
                <div className="px-6 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                  Upload Image
                </div>
              </label>
              <input
                id="upload-input-grid"
                type="file"
                accept="image/*"
                onChange={onUpload}
                className="hidden"
              />
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      id="image-grid"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      {images.map((image: ImageType, index) => (
        <ImageCard
          key={image.id}
          image={image}
          onImageSelect={() => onImageSelect(image, page?.nextPage || 1, index)}
        />
      ))}
    </div>
  );
}

function ImageCard({
  image,
  onImageSelect,
}: {
  image: ImageType;
  onImageSelect: () => void;
}) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div
      className="group relative rounded-lg overflow-hidden bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer"
      onClick={onImageSelect}
    >
      <div className="aspect-square relative">
        {isLoading && <Skeleton className="absolute inset-0" />}

        <Image
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          src={image.thumbnailUrl ?? image.url}
          alt={image.name}
          width={400}
          height={400}
          onLoad={() => setIsLoading(false)}
        />

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="text-white text-sm font-medium">View & Tag</span>
        </div>
      </div>

      <div className="p-4">
        <p className="text-sm font-medium truncate text-foreground">
          {image.name}
        </p>

        {image.tags && image.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {image.tags.slice(0, 2).map((tag: string) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded bg-primary/15 text-primary"
              >
                {tag}
              </span>
            ))}
            {image.tags.length > 2 && (
              <span className="text-xs px-2 py-1 rounded bg-primary/15 text-primary">
                +{image.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
