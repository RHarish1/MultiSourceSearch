export declare function uploadToDrive(userId: string, provider: "google" | "onedrive", file: Express.Multer.File): Promise<{
    id: string;
    url: string;
    thumbnail?: string;
}>;
export declare function deleteFromDrive(userId: string, provider: "google" | "onedrive", fileId: string): Promise<boolean>;
//# sourceMappingURL=driveUtils.d.ts.map