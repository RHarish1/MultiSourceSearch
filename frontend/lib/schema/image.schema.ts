import { z } from "zod";
import { AVAILABLE_DRIVES } from "./drives.schema";

export const ImageSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.url(),
  thumbnailUrl: z.url().optional(),
  size: z.number(),
  mimeType: z.string(),
  source: z.enum(AVAILABLE_DRIVES.map((drive) => drive.id)),
  uploadedAt: z.date(),
  tags: z.array(z.string()).default([]),
  metadata: z.object({
    width: z.number().optional(),
    height: z.number().optional(),
    location: z.string().optional(),
    camera: z.string().optional(),
  }).optional(),
});

export type ImageType = z.infer<typeof ImageSchema>;
