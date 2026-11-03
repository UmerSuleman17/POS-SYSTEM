import { z } from "zod";

export const productVariantSchema = z.object({
  name: z.string().min(1, "Variant name is required"),
  sku: z.string().min(1, "SKU is required"),
  barcode: z.string().optional(),
  price: z.number().min(0),
  cost: z.number().min(0).optional(),
  stock: z.number().min(0).optional(),
  color: z.string().optional(),
  colorCode: z.string().optional(),
  width: z.string().optional(),
  size: z.string().optional(),
  fabric: z.string().optional(),
  design: z.string().optional(),
  pattern: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().optional(),
  collectionName: z.string().optional(),
  season: z.string().optional(),
  fabricType: z.string().optional(),
  occasion: z.string().optional(),
  finish: z.string().optional(),
  costPrice: z.number().min(0),
  sellingPrice: z.number().min(0),
  taxRate: z.number().min(0).max(100),
  stock: z.number().min(0),
  lowStockThreshold: z.number().min(0),
  unit: z.string(),
  images: z.array(z.string()).optional(),
  branchId: z.string().optional(),
  variants: z.array(productVariantSchema).optional(),
});

export const saleCheckoutSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string().optional(),
      name: z.string(),
      sku: z.string(),
      price: z.number(),
      quantity: z.number().refine((val) => val !== 0, "Quantity cannot be zero"),
      discount: z.number().default(0),
      tax: z.number().default(0),
    })
  ).min(1),
  discount: z.number().default(0),
  taxRate: z.number().default(0),
  payments: z.array(
    z.object({
      method: z.enum(["cash", "card", "mobile", "bank", "credit"]),
      amount: z.number(),
      reference: z.string().optional(),
    })
  ).min(1),
  customerId: z.string().optional(),
  notes: z.string().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type SaleCheckoutInput = z.infer<typeof saleCheckoutSchema>;
