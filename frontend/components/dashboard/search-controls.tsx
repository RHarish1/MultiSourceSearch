"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SortBy } from "./dashboard"

interface SearchControlsProps {
  searchQuery: string
  sortBy: string
  filteredImagesCount: number
  onSearchChange: (query: string) => void
  onSortChange: (sortType: SortBy) => void
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function SearchControls({
  searchQuery,
  sortBy,
  filteredImagesCount,
  onSearchChange,
  onSortChange,
  onUpload,
}: SearchControlsProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Bar */}
        <Input
          id="search-bar"
          type="text"
          placeholder="Search images... (try: 'me and my friends on a picnic')"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 bg-card border-border"
        />

        {/* Upload Button */}
          <Button type="button" className="bg-primary hover:bg-primary/90 w-full md:w-auto">
        <label htmlFor="upload-input" className="cursor-pointer ">
            Upload Image
        </label>
          </Button>
        <input 
          id="upload-input"
          type="file" 
          accept="image/*" 
          onChange={onUpload} 
          className="hidden" 
        />
      </div>

      {/* Sort Controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-2 items-center">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <select
            id="sort-dropdown"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortBy)}
            className="bg-card border border-border rounded-md px-3 py-2 text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
          </select>
        </div>
        <p className="text-sm text-muted-foreground">
          {filteredImagesCount} image{filteredImagesCount !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  )
}
