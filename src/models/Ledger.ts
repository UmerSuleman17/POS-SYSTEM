import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ILedger extends Document {
  entityId: mongoose.Types.ObjectId; // Customer or Supplier ID
  entityType: "customer" | "supplier";
  type: "debit" | "credit";
  amount: number;
  balanceAfter: number;
  reference: string; // Sale Invoice or Purchase Number, or manual payment
  description?: string;
  branchId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

const LedgerSchema = new Schema<ILedger>(
  {
    entityId: { type: Schema.Types.ObjectId, required: true },
    entityType: { type: String, enum: ["customer", "supplier"], required: true },
    type: { type: String, enum: ["debit", "credit"], required: true },
    amount: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    reference: { type: String, required: true },
    description: String,
    branchId: { type: Schema.Types.ObjectId, ref: "Branch" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

LedgerSchema.index({ entityId: 1, entityType: 1 });

export const Ledger: Model<ILedger> =
  mongoose.models.Ledger ?? mongoose.model<ILedger>("Ledger", LedgerSchema);
