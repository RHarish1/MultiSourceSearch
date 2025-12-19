"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getProviderDisplayName,
  type ProviderType,
} from "@/lib/schema/drives.schema";
import Image from "next/image";
import { X } from "lucide-react";
import toast from "react-hot-toast";

interface UploadModalProps {
  file: File;
  connectedDrives: ProviderType[];
  onUpload: (
    file: File,
    provider: ProviderType,
    fileName?: string,
    tags?: string[]
  ) => Promise<void>;
  onClose: () => void;
}

export default function UploadModal({
  file,
  connectedDrives,
  onUpload,
  onClose,
}: UploadModalProps) {
  const [fileName, setFileName] = useState(file.name.replace(/\.[^/.]+$/, "")); // Remove extension
  const [tags, setTags] = useState<string>("");
  const [selectedProvider, setSelectedProvider] = useState<ProviderType>(
    connectedDrives[0]
  );
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string>("");

  // Generate preview
  useState(() => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isUploading) return;

    setIsUploading(true);
    try {
      const tagArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      await onUpload(file, selectedProvider, fileName, tagArray);
      onClose();
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : "Failed to upload image. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Image</DialogTitle>
          <DialogDescription>
            Add details about your image before uploading
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Preview */}
          <div className="flex justify-center">
            <div className="relative w-64 h-64 rounded-lg overflow-hidden bg-muted border border-border">
              {preview ? (
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Loading preview...
                </div>
              )}
            </div>
          </div>

          {/* File Name */}
          <div className="space-y-2">
            <Label htmlFor="fileName">File Name</Label>
            <Input
              id="fileName"
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter file name"
              required
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., vacation, family, beach"
            />
            <p className="text-xs text-muted-foreground">
              Add tags to make your images easier to find
            </p>
          </div>

          {/* Provider Selection */}
          <div className="space-y-2">
            <Label htmlFor="provider">Upload to</Label>
            <Select
              value={selectedProvider}
              onValueChange={(value) =>
                setSelectedProvider(value as ProviderType)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a drive" />
              </SelectTrigger>
              <SelectContent>
                {connectedDrives.map((provider) => (
                  <SelectItem key={provider} value={provider}>
                    {getProviderDisplayName(provider)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Info */}
          <div className="space-y-1 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
            <p><span className="font-medium">Size:</span> {(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <p><span className="font-medium">Type:</span> {file.type}</p>
          </div>

          {/* Actions */}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
