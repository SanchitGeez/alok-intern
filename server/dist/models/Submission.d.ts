import mongoose, { Document } from 'mongoose';
import { ISubmission } from '@/types';
export interface ISubmissionDocument extends Omit<ISubmission, '_id'>, Document {
}
export declare const Submission: mongoose.Model<ISubmissionDocument, {}, {}, {}, mongoose.Document<unknown, {}, ISubmissionDocument, {}, {}> & ISubmissionDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Submission.d.ts.map