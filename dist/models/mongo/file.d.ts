import mongoose from 'mongoose';
export declare const File: mongoose.Model<{
    name: string;
    fileId: string;
    tags: string[];
    addedAt: NativeDate;
    driveId?: mongoose.Types.ObjectId | null;
    mimeType?: string | null;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    name: string;
    fileId: string;
    tags: string[];
    addedAt: NativeDate;
    driveId?: mongoose.Types.ObjectId | null;
    mimeType?: string | null;
}> & {
    name: string;
    fileId: string;
    tags: string[];
    addedAt: NativeDate;
    driveId?: mongoose.Types.ObjectId | null;
    mimeType?: string | null;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    name: string;
    fileId: string;
    tags: string[];
    addedAt: NativeDate;
    driveId?: mongoose.Types.ObjectId | null;
    mimeType?: string | null;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    name: string;
    fileId: string;
    tags: string[];
    addedAt: NativeDate;
    driveId?: mongoose.Types.ObjectId | null;
    mimeType?: string | null;
}>> & mongoose.FlatRecord<{
    name: string;
    fileId: string;
    tags: string[];
    addedAt: NativeDate;
    driveId?: mongoose.Types.ObjectId | null;
    mimeType?: string | null;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
//# sourceMappingURL=file.d.ts.map