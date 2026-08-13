import { Document, Schema, model } from "mongoose";

export const CONTRACTOR_STATUS = [
  "Active",
  "Inactive",
  "Blocked",
  "Pending",
] as const;

export type ContractorStatus = (typeof CONTRACTOR_STATUS)[number];

export interface IContractor extends Document {
  companyName: string;
  registrationNumber: string;
  contactPerson: string;
  email?: string;
  phone?: string;
  address?: string;
  performanceScore: number;
  status: ContractorStatus;
  user?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const contractorSchema = new Schema<IContractor>(
  {
    companyName: { type: String, required: true, trim: true },
    registrationNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    contactPerson: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    performanceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    status: {
      type: String,
      enum: CONTRACTOR_STATUS,
      default: "Pending",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

contractorSchema.index({ companyName: 1 });
contractorSchema.index({ status: 1 });

const ContractorModel = model<IContractor>("Contractor", contractorSchema);

export default ContractorModel;
