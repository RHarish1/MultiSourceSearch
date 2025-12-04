import {z} from "zod";


export const UserSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string().min(1),
  connectedDrives: z.array(z.string()).default([]),
  dismissedDrivePrompt: z.boolean().default(false),
  isNewUser: z.boolean().default(true),
});

export type User = z.infer<typeof UserSchema>;

export const dummyUser: User = {
  id: "123dw2123r21d23dd3d123",
  email: "demo@example.com",
  name: "Demo User",
  connectedDrives: ["google-drive", "onedrive"],
  dismissedDrivePrompt: false,
  isNewUser: false,
};
