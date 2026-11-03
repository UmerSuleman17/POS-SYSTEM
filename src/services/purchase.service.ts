import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { generateInvoiceNumber } from "@/lib/utils";
import { Purchase } from "@/models/Purchase";
import { Product } from "@/models/Product";
import { Supplier } from "@/models/Supplier";
import { Ledger } from "@/models/Ledger";
import { InventoryLog } from "@/models/InventoryLog";

export class PurchaseService {
  async createPurchase(params: {
    supplierId: string;
    items: { productId: string; variantId?: string; name: string; quantity: number; cost: number }[];
    tax: number;
    paid: number;
    branchId?: string;
    notes?: string;
    userId: string;
  }) {
    await connectDB();

    const subtotal = params.items.reduce((sum, item) => sum + item.cost * item.quantity, 0);
    const total = subtotal + params.tax;

    const purchaseNumber = generateInvoiceNumber("PUR");
    
    const purchase = await Purchase.create({
      purchaseNumber,
      supplierId: new mongoose.Types.ObjectId(params.supplierId),
      items: params.items.map(item => ({
        productId: new mongoose.Types.ObjectId(item.productId),
        variantId: item.variantId,
        name: item.name,
        quantity: item.quantity,
        cost: item.cost,
        subtotal: item.cost * item.quantity,
      })),
      subtotal,
      tax: params.tax,
      total,
      paid: params.paid,
      status: "received",
      branchId: params.branchId ? new mongoose.Types.ObjectId(params.branchId) : undefined,
      notes: params.notes,
      receivedAt: new Date(),
    });

    const dueAmount = total - params.paid;

    // 1. Update Supplier Ledger & Balance
    const supplier = await Supplier.findById(params.supplierId);
    if (supplier) {
      supplier.dueBalance += dueAmount;
      await supplier.save();

      // Record the purchase debt
      if (total > 0) {
        await Ledger.create({
          entityId: supplier._id,
          entityType: "supplier",
          type: "credit", // We owe supplier
          amount: total,
          balanceAfter: supplier.dueBalance + params.paid,
          reference: purchaseNumber,
          description: "Purchase received",
          branchId: params.branchId ? new mongoose.Types.ObjectId(params.branchId) : undefined,
          createdBy: new mongoose.Types.ObjectId(params.userId),
        });
      }

      // Record the payment
      if (params.paid > 0) {
        await Ledger.create({
          entityId: supplier._id,
          entityType: "supplier",
          type: "debit", // We paid supplier
          amount: params.paid,
          balanceAfter: supplier.dueBalance,
          reference: purchaseNumber,
          description: "Payment for purchase",
          branchId: params.branchId ? new mongoose.Types.ObjectId(params.branchId) : undefined,
          createdBy: new mongoose.Types.ObjectId(params.userId),
        });
      }
    }

    // 2. Update Inventory and Weighted Average Cost
    for (const item of params.items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      let prevStock = 0;
      let newStock = 0;

      if (item.variantId) {
        const variant = product.variants.find(v => v._id?.toString() === item.variantId);
        if (variant) {
          prevStock = variant.stock;
          // Weighted Average Cost formula for variant
          if (prevStock + item.quantity > 0) {
            variant.cost = ((prevStock * variant.cost) + (item.quantity * item.cost)) / (prevStock + item.quantity);
          }
          variant.stock += item.quantity;
          newStock = variant.stock;
        }
      } else {
        prevStock = product.stock;
        // Weighted Average Cost formula for root product
        if (prevStock + item.quantity > 0) {
          product.costPrice = ((prevStock * product.costPrice) + (item.quantity * item.cost)) / (prevStock + item.quantity);
        }
        product.stock += item.quantity;
        newStock = product.stock;
      }

      await product.save();

      await InventoryLog.create({
        productId: new mongoose.Types.ObjectId(item.productId),
        type: "purchase",
        quantity: item.quantity,
        previousStock: prevStock,
        newStock: newStock,
        reference: purchaseNumber,
        branchId: params.branchId ? new mongoose.Types.ObjectId(params.branchId) : undefined,
        createdBy: new mongoose.Types.ObjectId(params.userId),
      });
    }

    return purchase;
  }
}
