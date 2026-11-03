"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { requirePermission } from "@/lib/auth-helpers";
import { generateSKU, generateBarcode } from "@/lib/utils";
import { ProductRepository } from "@/repositories/product.repository";
import { zodFirstError } from "@/lib/zod-error";
import { productSchema } from "@/validations/product.schema";

const repo = new ProductRepository();

export async function createProductAction(formData: FormData) {
  await requirePermission("products.manage");
  await connectDB();

  const raw = Object.fromEntries(formData.entries());
  const parsed = productSchema.safeParse({
    ...raw,
    costPrice: Number(raw.costPrice),
    sellingPrice: Number(raw.sellingPrice),
    stock: Number(raw.stock ?? 0),
    taxRate: Number(raw.taxRate ?? 0),
  });

  if (!parsed.success) {
    return { success: false, error: zodFirstError(parsed.error) };
  }

  const data = parsed.data;
  const product = await repo.create({
    name: data.name,
    slug: data.name.toLowerCase().replace(/\s+/g, "-"),
    sku: data.sku ?? generateSKU(),
    barcode: data.barcode ?? generateBarcode(),
    description: data.description,
    categoryId: new mongoose.Types.ObjectId(data.categoryId),
    brandId: data.brandId ? new mongoose.Types.ObjectId(data.brandId) : undefined,
    collectionName: data.collectionName,
    season: data.season,
    fabricType: data.fabricType,
    occasion: data.occasion,
    finish: data.finish,
    branchId: data.branchId ? new mongoose.Types.ObjectId(data.branchId) : undefined,
    costPrice: data.costPrice,
    sellingPrice: data.sellingPrice,
    taxRate: data.taxRate,
    stock: data.stock,
    lowStockThreshold: data.lowStockThreshold,
    unit: data.unit,
    images: data.images ?? [],
    variants: data.variants?.map((v: any) => ({
      name: v.name,
      sku: v.sku ?? generateSKU(),
      barcode: v.barcode ?? generateBarcode(),
      price: v.price,
      cost: v.cost,
      stock: v.stock,
      color: v.color,
      colorCode: v.colorCode,
      width: v.width,
      size: v.size,
      fabric: v.fabric,
      design: v.design,
      pattern: v.pattern,
    })) ?? [],
  });

  revalidatePath("/products");
  return { success: true, data: product };
}

export async function deleteProductAction(id: string) {
  await requirePermission("products.manage");
  await connectDB();
  await repo.delete(id);
  revalidatePath("/products");
  return { success: true };
}
