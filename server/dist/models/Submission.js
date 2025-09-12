"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Submission = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const submissionSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.Mixed,
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
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
});
submissionSchema.index({ patientId: 1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ createdAt: -1 });
submissionSchema.index({ 'patientDetails.patientId': 1 });
exports.Submission = mongoose_1.default.model('Submission', submissionSchema);
//# sourceMappingURL=Submission.js.map