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
import { useInfiniteQuery } from "@tanstack/react-query";
import { getImages } from "@/lib/services/images.service";
import { Image } from "@/lib/schema/image.schema";
import { connectDrive, disconnectDrive } from "@/lib/services/drives.service";

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
  image: Image; 
  pageNumber: number;
  index: number;
}

export default function Dashboard({ user: initialUser }: DashboardProps) {
  const router = useRouter();
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSort = (type: SortBy) => {
    setSortBy(type);
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files) {
      try {
        // TODO: Implement image upload logic
        // TODO: Update state and storage with the new image
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  const handleConnectDrive = (driveName: string) => {
    if (!user.connectedDrives.includes(driveName)) {
      const newDrives = [...user.connectedDrives, driveName];
      setUser({ ...user, connectedDrives: newDrives });
      connectDrive(user.id, driveName);
      setShowConnectModal(false);
    }
  };

  const handleDisconnectDrive = (driveName: string) => {
    const newDrives = user.connectedDrives.filter(
      (drive) => drive !== driveName
    );
    setUser({ ...user, connectedDrives: newDrives });
    disconnectDrive(user.id, driveName);
    
  };

  const handleSkipDriveConnection = () => {
    setUser({ ...user, dismissedDrivePrompt: true });
    setShowConnectModal(false);
  };

  const handleAddTag = (imageId: string, tag: string) => {
    if (!tag.trim()) return;
    // TODO: update state and storage
  };

  const handleRemoveTag = (imageId: string, tag: string) => {
    // TODO: update state and storage
  };

  const handleDeleteImage = (imageId: string) => {
    // TODO: update state and storage
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleCompleteTour = () => {
    setShowTour(false);
  };
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const handleSelectedImage= (image: Image, pageNumber: number, index: number) => {
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
                onImageSelect={setSelectedImage}
                onUpload={handleUploadImage}
              />
            );
          })
        ) : (
          <ImageGrid
            searchQuery={searchQuery}
            onImageSelect={setSelectedImage}
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
    </div>
  );
}
