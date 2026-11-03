import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { requirePermission } from "@/lib/auth-helpers";
import { Ledger } from "@/models/Ledger";
import mongoose from "mongoose";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("customers.manage");
    await connectDB();
    const { id } = await params;
    
    const entries = await Ledger.find({
      entityId: new mongoose.Types.ObjectId(id),
      entityType: "customer",
    }).sort({ createdAt: -1 }).populate("createdBy", "name").lean();

    return apiSuccess(entries);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Failed to fetch ledger", 400);
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission("customers.manage");
    await connectDB();
    const { id } = await params;
    
    const { amount, reference, description } = await req.json();
    if (!amount || amount <= 0) return apiError("Amount must be positive");

    const { Customer } = await import("@/models/Customer");
    const customer = await Customer.findById(id);
    if (!customer) return apiError("Customer not found", 404);

    customer.dueBalance -= amount;
    await customer.save();

    const entry = await Ledger.create({
      entityId: customer._id,
      entityType: "customer",
      type: "credit", // Customer paid us
      amount: amount,
      balanceAfter: customer.dueBalance,
      reference: reference || `PAY-${Date.now()}`,
      description: description || "Payment Received",
      createdBy: new mongoose.Types.ObjectId(session.user.id),
    });

    return apiSuccess(entry, "Payment received successfully");
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Failed to add payment", 400);
  }
}
