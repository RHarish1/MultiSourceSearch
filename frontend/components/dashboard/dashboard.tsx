"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/dashboard/header";
import ConnectionPrompt from "@/components/dashboard/connection-prompt";
import StorageSection from "@/components/dashboard/storage-section";
import SearchControls from "@/components/dashboard/search-controls";
import ImageDetailModal from "@/components/dashboard/image-detail-modal";
import { User } from "@/lib/schema/user.schema";
import ImageGrid from "./image-grid";
import { logout } from "@/lib/services/auth.service";
import TourOverlay from "./tour-overlay";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { getImages } from "@/lib/services/images.service";
import { ImageType } from "@/lib/schema/image.schema";
import { connectDrive, disconnectDrive, dismissDrivePrompt } from "@/lib/services/drives.service";
import type { ProviderType } from "@/lib/schema/drives.schema";
import UploadModal from "./upload-modal";
import toast from "react-hot-toast";

interface DashboardProps {
  user: User;
}

export enum SortBy {
  NEWEST = "newest",
  OLDEST = "oldest",
  NAME_ASC = "name-asc",
  NAME_DESC = "name-desc",
}

export interface SelectedImage {
  image: ImageType; 
  pageNumber: number;
  index: number;
}

export interface ImagePage {
  images: ImageType[];
  nextPage: number;
  hasNextPage: boolean;
}

export default function Dashboard({ user: initialUser }: DashboardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(initialUser);

  // Query Related
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.NEWEST);
  const queryKey = useMemo(
    () => ["images", searchQuery, sortBy],
    [searchQuery, sortBy]
  );

  const { data, isFetching, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: queryKey,
    queryFn: ({ pageParam = 1 }) =>
      getImages(pageParam, user.email, searchQuery, sortBy),
    getNextPageParam: (lastPage) => {
      if (lastPage.hasNextPage) {
        return lastPage.nextPage;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  const [showConnectModal, setShowConnectModal] = useState(
    (!user?.connectedDrives || user.connectedDrives.length === 0) &&
      !user?.dismissedDrivePrompt
  );
  const [showTour, setShowTour] = useState(user?.isNewUser ?? true);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSort = (type: SortBy) => {
    setSortBy(type);
  };

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files || files.length === 0) return;

    // Check if user has connected drives
    if (user.connectedDrives.length === 0) {
      toast.error("Please connect a drive first before uploading images.");
      setShowConnectModal(true);
      return;
    }

    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    // Open upload modal
    setUploadFile(file);
  };

  const handleUploadSubmit = async (
    file: File,
    provider: ProviderType,
    fileName?: string,
    tags?: string[]
  ) => {
    try {
      const { uploadImage } = await import("@/lib/services/images.service");
      await uploadImage(file, provider, tags, fileName);
      
      // Refresh the images list
      await queryClient.invalidateQueries({ queryKey: ["images"] });
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to upload image. Please try again.";
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleConnectDrive = (provider: ProviderType) => {
    if (!user.connectedDrives.includes(provider)) {
      // Redirect to OAuth flow on backend
      connectDrive(provider);
    }
  };

  const handleDisconnectDrive = async (provider: ProviderType) => {
    try {
      await disconnectDrive(provider);
      const newDrives = user.connectedDrives.filter(
        (drive) => drive !== provider
      );
      setUser({ ...user, connectedDrives: newDrives });
    } catch (error) {
      console.error("Failed to disconnect drive:", error);
    }
  };

  const handleSkipDriveConnection = async () => {
    try {
      await dismissDrivePrompt();
      setUser({ ...user, dismissedDrivePrompt: true });
      setShowConnectModal(false);
    } catch (error) {
      console.error("Failed to dismiss prompt:", error);
      setShowConnectModal(false);
    }
  };

  const handleAddTag = async (imageId: string, tag: string) => {
    if (!tag.trim()) return;
    
    try {
      // Find the image and update tags
      const allImages = data?.pages.flatMap(page => page.images) || [];
      const image = allImages.find(img => img.id === imageId);
      if (!image) return;

      const newTags = [...image.tags, tag];
      const { updateImageTags } = await import("@/lib/services/images.service");
      await updateImageTags(imageId, newTags);
      
      // Refresh the images list
      await queryClient.invalidateQueries({ queryKey: ["images"] });
      toast.success("Tag added successfully!");
    } catch (error) {
      console.error("Failed to add tag:", error);
      toast.error("Failed to add tag. Please try again.");
    }
  };

  const handleRemoveTag = async (imageId: string, tag: string) => {
    try {
      // Find the image and update tags
      const allImages = data?.pages.flatMap(page => page.images) || [];
      const image = allImages.find(img => img.id === imageId);
      if (!image) return;

      const newTags = image.tags.filter(t => t !== tag);
      const { updateImageTags } = await import("@/lib/services/images.service");
      await updateImageTags(imageId, newTags);
      
      // Refresh the images list
      await queryClient.invalidateQueries({ queryKey: ["images"] });
      toast.success("Tag removed successfully!");
    } catch (error) {
      console.error("Failed to remove tag:", error);
      toast.error("Failed to remove tag. Please try again.");
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Are you sure you want to delete this image? This action cannot be undone.")) {
      return;
    }

    try {
      const { deleteImage } = await import("@/lib/services/images.service");
      await deleteImage(imageId);
      
      // Refresh the images list
      await queryClient.invalidateQueries({ queryKey: ["images"] });
      toast.success("Image deleted successfully!");
    } catch (error) {
      console.error("Failed to delete image:", error);
      toast.error("Failed to delete image. Please try again.");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleCompleteTour = () => {
    setShowTour(false);
  };
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);

  const handleSelectedImage= (image: ImageType, pageNumber: number, index: number) => {
    setSelectedImage({ image, pageNumber, index });
  };
  

  return (
    <div className="min-h-screen bg-background">
      {/* Tour Overlay */}
      <TourOverlay isActive={showTour} onComplete={handleCompleteTour} />

      {/* Header */}
      <DashboardHeader
        user={user}
        onToggleTour={() => setShowTour(true)}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Connection Prompt - Only shown if drives not connected and not dismissed */}
        {showConnectModal && (
          <ConnectionPrompt
            onConnect={handleConnectDrive}
            onSkip={handleSkipDriveConnection}
          />
        )}

        {/* Storage Section */}
        <StorageSection
          connectedDrives={user.connectedDrives}
          connectDrive={handleConnectDrive}
          disconnectDrive={handleDisconnectDrive}
        />

        {/* Search and Controls */}
        <SearchControls
          searchQuery={searchQuery}
          sortBy={sortBy}
          filteredImagesCount={data?.pages.length || 0}
          onSearchChange={handleSearch}
          onSortChange={handleSort}
          onUpload={handleUploadImage}
        />

        {/* Image Grid */}
        {data ? (
          data.pages.map((page, index) => {
            return (
              <ImageGrid
                key={`page-${index}`}
                page={page}
                searchQuery={searchQuery}
                onImageSelect={handleSelectedImage}
                onUpload={handleUploadImage}
              />
            );
          })
        ) : (
          <ImageGrid
            searchQuery={searchQuery}
            onImageSelect={handleSelectedImage}
            onUpload={handleUploadImage}
          />
        )}
      </main>

      {/* Image Detail Modal */}
      {selectedImage && (
        <ImageDetailModal
          selectedImage={selectedImage}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          onDeleteImage={handleDeleteImage}
          onClose={() => setSelectedImage(null)}
        />
      )}

      {/* Upload Modal */}
      {uploadFile && (
        <UploadModal
          file={uploadFile}
          connectedDrives={user.connectedDrives}
          onUpload={handleUploadSubmit}
          onClose={() => setUploadFile(null)}
        />
      )}
    </div>
  );
}
