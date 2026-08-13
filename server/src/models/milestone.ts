import { Document, Schema, Types, model } from "mongoose";

export const MILESTONE_STATUS = [
  "Pending",
  "In Progress",
  "Completed",
  "Delayed",
] as const;

export type MilestoneStatus = (typeof MILESTONE_STATUS)[number];

export interface IMilestone extends Document {
  project: Types.ObjectId;
  name: string;
  description?: string;
  plannedDate?: Date;
  actualDate?: Date;
  completionPercentage: number;
  status: MilestoneStatus;
  verifiedBy?: Types.ObjectId;
  verificationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const milestoneSchema = new Schema<IMilestone>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    plannedDate: { type: Date },
    actualDate: { type: Date },
    completionPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    status: {
      type: String,
      enum: MILESTONE_STATUS,
      default: "Pending",
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    verificationDate: { type: Date },
  },
  { timestamps: true },
);

milestoneSchema.index({ project: 1 });

const MilestoneModel = model<IMilestone>("Milestone", milestoneSchema);

export default MilestoneModel;
