export interface Image {
  id: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  tags: string[];
  uploadedAt?: Date | string;
  provider?: string;
}

export type ImageType = Image;
