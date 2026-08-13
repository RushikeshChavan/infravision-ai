import { Document, Schema, Types, model } from "mongoose";

export const PROJECT_STATUSES = [
  "Planned",
  "Ongoing",
  "Delayed",
  "Completed",
  "Cancelled",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export interface IProject extends Document {
  name: string;
  description?: string;
  projectCode: string;
  department: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  plannedStartDate?: Date;
  plannedEndDate?: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  totalBudget?: number;
  status: ProjectStatus;
  projectManager: Types.ObjectId;
  contractor?: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    projectCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    department: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
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
    plannedStartDate: { type: Date },
    plannedEndDate: { type: Date },
    actualStartDate: { type: Date },
    actualEndDate: { type: Date },
    totalBudget: {
      type: Number,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: PROJECT_STATUSES,
      default: "Planned",
    },
    projectManager: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contractor: {
      type: Schema.Types.ObjectId,
      ref: "Contractor",
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

projectSchema.index({ projectCode: 1 }, { unique: true });
projectSchema.index({ status: 1 });
projectSchema.index({ department: 1 });

const ProjectModel = model<IProject>("Project", projectSchema);

export default ProjectModel;
