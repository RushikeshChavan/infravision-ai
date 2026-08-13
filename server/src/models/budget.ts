import { Document, Schema, Types, model } from "mongoose";

export interface IBudget extends Document {
  project: Types.ObjectId;
  allocatedAmount: number;
  utilizedAmount: number;
  remainingAmount: number;
  category: string;
  description?: string;
  lastUpdatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema<IBudget>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    allocatedAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    utilizedAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    remainingAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    category: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    lastUpdatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

budgetSchema.index({ project: 1 });

const BudgetModel = model<IBudget>("Budget", budgetSchema);

export default BudgetModel;
