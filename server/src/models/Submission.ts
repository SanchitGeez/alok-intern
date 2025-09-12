import mongoose, { Document, Schema } from 'mongoose';
import { ISubmission } from '@/types';

export interface ISubmissionDocument extends Omit<ISubmission, '_id'>, Document {}

const submissionSchema = new Schema<ISubmissionDocument>(
  {
    patientId: {
      type: String,
      required: [true, 'Patient ID is required'],
    },
    patientDetails: {
      name: {
        type: String,
        required: [true, 'Patient name is required'],
        trim: true,
      },
      patientId: {
        type: String,
        required: [true, 'Patient ID is required'],
        trim: true,
      },
      email: {
        type: String,
        required: [true, 'Patient email is required'],
        lowercase: true,
        trim: true,
        match: [
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          'Please provide a valid email address',
        ],
      },
      note: {
        type: String,
        trim: true,
        maxlength: [500, 'Note must be less than 500 characters'],
      },
    },
    originalImagePath: {
      type: String,
      required: [true, 'Original image path is required'],
    },
    annotatedImagePath: {
      type: String,
    },
    annotationData: {
      type: Schema.Types.Mixed,
    },
    reviewText: {
      type: String,
      trim: true,
      maxlength: [2000, 'Review text must be less than 2000 characters'],
    },
    reportPath: {
      type: String,
    },
    status: {
      type: String,
      enum: ['uploaded', 'annotated', 'reported'],
      default: 'uploaded',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc: any, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for better query performance
submissionSchema.index({ patientId: 1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ createdAt: -1 });
submissionSchema.index({ 'patientDetails.patientId': 1 });

export const Submission = mongoose.model<ISubmissionDocument>('Submission', submissionSchema);