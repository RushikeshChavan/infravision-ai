import { Document, Schema, Types, model } from "mongoose";

export const INSPECTION_STATUS = ["Scheduled", "Completed", "Failed"] as const;

export type InspectionStatus = (typeof INSPECTION_STATUS)[number];

export interface IInspection extends Document {
  project: Types.ObjectId;
  inspector: Types.ObjectId;
  inspectionDate: Date;
  latitude?: number;
  longitude?: number;
  remarks?: string;
  status: InspectionStatus;
  completionPercentage: number;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const inspectionSchema = new Schema<IInspection>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    inspector: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    inspectionDate: { type: Date, required: true },
    latitude: {
      type: Number,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180,
    },
    remarks: { type: String, trim: true },
    status: {
      type: String,
      enum: INSPECTION_STATUS,
      default: "Scheduled",
    },
    completionPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

inspectionSchema.index({ project: 1 });

const InspectionModel = model<IInspection>("Inspection", inspectionSchema);

export default InspectionModel;
