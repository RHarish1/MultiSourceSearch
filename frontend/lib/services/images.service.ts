import { ImageSchema } from "@/lib/schema/image.schema";
import { api } from "../api/client";
import { handleError } from "@/lib/errors/errorHandler";

export const getImages = async (
  pageParam: number,
  userId: string,
  query?: string,
  sortBy?: string
) => {
  try {
    const response = await api("/images", {
      method: "GET",
      params: {
        userId,
        query,
        sortBy,
        page: pageParam,
      },
    });
    const validatedImages = ImageSchema.array().parse(response.data.images);
    return {
      images: validatedImages,
      nextPage: pageParam + 1,
      hasNextPage: response.data.hasNextPage as boolean,
    };
  } catch (error) {
    throw new Error(handleError(error));
  }
};


export const uploadImage = async (file: File, userId: string)=>{
  try {
    // TODO: Implement upload image functionality
    console.log("Uploading image for user:", userId, file.name);
  } catch (error) {
    handleError(error);
    throw new Error(handleError(error));
  }
}