import { Document, Schema, Types, model } from "mongoose";

export const DOCUMENT_TYPES = [
  "Contract",
  "Approval",
  "Estimate",
  "Invoice",
  "Progress Report",
  "Completion Report",
  "Other",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const DOCUMENT_CLASSIFICATIONS = [
  "PUBLIC",
  "INTERNAL",
  "RESTRICTED",
  "CONFIDENTIAL",
] as const;

export type DocumentClassification = (typeof DOCUMENT_CLASSIFICATIONS)[number];

export interface IDocument extends Document {
  project: Types.ObjectId;
  uploadedBy: Types.ObjectId;
  documentType: DocumentType;
  fileName: string;
  fileUrl: string;
  classification: DocumentClassification;
  description?: string;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    documentType: {
      type: String,
      enum: DOCUMENT_TYPES,
      required: true,
    },
    fileName: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true, trim: true },
    classification: {
      type: String,
      enum: DOCUMENT_CLASSIFICATIONS,
      required: true,
      default: "INTERNAL",
    },
    description: { type: String, trim: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

documentSchema.index({ project: 1 });

const DocumentModel = model<IDocument>("Document", documentSchema);

export default DocumentModel;
