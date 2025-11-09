import mongoose from 'mongoose';
export declare const File: mongoose.Model<{
    fileId: string;
    name: string;
    tags: string[];
    addedAt: NativeDate;
    mimeType?: string | null;
    driveId?: mongoose.Types.ObjectId | null;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    fileId: string;
    name: string;
    tags: string[];
    addedAt: NativeDate;
    mimeType?: string | null;
    driveId?: mongoose.Types.ObjectId | null;
}> & {
    fileId: string;
    name: string;
    tags: string[];
    addedAt: NativeDate;
    mimeType?: string | null;
    driveId?: mongoose.Types.ObjectId | null;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    fileId: string;
    name: string;
    tags: string[];
    addedAt: NativeDate;
    mimeType?: string | null;
    driveId?: mongoose.Types.ObjectId | null;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    fileId: string;
    name: string;
    tags: string[];
    addedAt: NativeDate;
    mimeType?: string | null;
    driveId?: mongoose.Types.ObjectId | null;
}>> & mongoose.FlatRecord<{
    fileId: string;
    name: string;
    tags: string[];
    addedAt: NativeDate;
    mimeType?: string | null;
    driveId?: mongoose.Types.ObjectId | null;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
//# sourceMappingURL=file.d.ts.map