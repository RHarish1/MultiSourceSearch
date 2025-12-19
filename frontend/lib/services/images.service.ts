import type { Image } from "@/lib/schema/image.schema";
import { api } from "../api/client";
import { handleError } from "@/lib/errors/errorHandler";
import type { ProviderType } from "../schema/drives.schema";
import { SortBy } from "@/components/dashboard/dashboard";
import { z } from "zod";

const BackendImageSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  fileUrl: z.url(),
  thumbnailUrl: z.url().nullable(),
  tags: z.array(z.string()),
  uploadedAt: z.string().or(z.date()).nullable().optional(),
  provider: z.string().optional(),
});

export const getImages = async (
  pageParam: number,
  userId: string,
  searchQuery?: string,
  sortBy?: SortBy
) => {
  try {
    const params: { search?: string } = {};
    
    if (searchQuery && searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    const response = await api("/images", {
      method: "GET",
      params,
    });

    // Backend returns array directly: { id, fileName, fileUrl, tags }
    const backendImagesRaw = Array.isArray(response) ? response : [];
    const backendImages = z.array(BackendImageSchema).parse(backendImagesRaw);
    
    // Transform to frontend Image format
    const images: Image[] = backendImages.map((img) => ({
      id: img.id,
      name: img.fileName,
      url: img.fileUrl,
      thumbnailUrl: img.thumbnailUrl || img.fileUrl,
      tags: img.tags,
      uploadedAt: img.uploadedAt ?? undefined,
      provider: img.provider,
    }));
    
    // Apply client-side sorting
    let sortedImages = images;
    if (sortBy) {
      sortedImages = sortImages(images, sortBy);
    }

    // Simple pagination - 20 per page
    const pageSize = 20;
    const start = (pageParam - 1) * pageSize;
    const end = start + pageSize;
    const paginatedImages = sortedImages.slice(start, end);
    console.log(images);
    return {
      images: paginatedImages,
      nextPage: pageParam + 1,
      hasNextPage: end < sortedImages.length,
    };
  } catch (error) {
    throw new Error(handleError(error));
  }
};

function sortImages(images: Image[], sortBy: SortBy): Image[] {
  const sorted = [...images];
  
  switch (sortBy) {
    case SortBy.NEWEST:
      // Already sorted by createdAt desc from backend
      return sorted;
    case SortBy.OLDEST:
      return sorted.reverse();
    case SortBy.NAME_ASC:
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case SortBy.NAME_DESC:
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    default:
      return sorted;
  }
}

export const uploadImage = async (
  file: File,
  provider: ProviderType,
  tags?: string[],
  fileName?: string
) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("provider", provider);
    
    if (fileName) {
      formData.append("fileName", fileName);
    }
    
    if (tags && tags.length > 0) {
      formData.append("tags", tags.join(","));
    }

    const response = await api("/images/upload", {
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response;
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const updateImageTags = async (imageId: string, tags: string[]) => {
  try {
    await api(`/images/${imageId}`, {
      method: "PUT",
      data: {
        tags: tags.join(","),
      },
    });
    return { success: true };
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const deleteImage = async (imageId: string) => {
  try {
    await api(`/images/${imageId}`, {
      method: "DELETE",
    });
    return { success: true };
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const searchImages = async (query: string, useAnd: boolean = false) => {
  try {
    const response = await api("/images/search", {
      method: "GET",
      params: {
        q: query,
        and: useAnd ? "true" : "false",
      },
    });

    const backendImages = z.array(BackendImageSchema).parse(response.images || []);
    
    // Transform to frontend Image format
    const images: Image[] = backendImages.map((img) => ({
      id: img.id,
      name: img.fileName,
      url: img.fileUrl,
      thumbnailUrl: img.thumbnailUrl || img.fileUrl,
      tags: img.tags,
      uploadedAt: img.uploadedAt ?? undefined,
      provider: img.provider,
    }));
    console.log(images);
    return images;
  } catch (error) {
    throw new Error(handleError(error));
  }
};