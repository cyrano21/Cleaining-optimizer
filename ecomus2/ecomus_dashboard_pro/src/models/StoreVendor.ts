import mongoose, { Schema, Types } from "mongoose";

export interface StoreVendorDocument extends mongoose.Document {
  storeId: Types.ObjectId;
  vendorId: Types.ObjectId;
  role: "owner" | "manager";
  status: "active" | "invited" | "disabled";
  subscribedPlan?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StoreVendorSchema = new Schema<StoreVendorDocument>(
  {
    storeId:  { type: Schema.Types.ObjectId, ref: "Store", required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "User",  required: true },
    role:     { type: String, enum: ["owner", "manager"], default: "owner" },
    status:   { type: String, enum: ["active", "invited", "disabled"], default: "active" },
    subscribedPlan: String,
  },
  { timestamps: true }
);

export default mongoose.models.StoreVendor ||
         mongoose.model<StoreVendorDocument>("StoreVendor", StoreVendorSchema);
