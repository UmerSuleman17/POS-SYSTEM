"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Upload, Loader2, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { productSchema, type ProductInput } from "@/validations/product.schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Category {
  _id: string;
  name: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ProductFormDialog({ open, onOpenChange, onSuccess }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      costPrice: 0,
      sellingPrice: 0,
      stock: 0,
      taxRate: 0,
      lowStockThreshold: 5,
      unit: "meter",
      variants: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  useEffect(() => {
    if (open) {
      fetch("/api/categories")
        .then((r) => r.json())
        .then((json) => {
          if (json.success) setCategories(json.data);
        });
      reset({
        name: "",
        categoryId: "",
        costPrice: 0,
        sellingPrice: 0,
        stock: 0,
        taxRate: 0,
        lowStockThreshold: 5,
        unit: "meter",
        variants: [],
        collectionName: "",
        season: "",
        fabricType: "",
        occasion: "",
        finish: "",
      });
      setImageUrl("");
    }
  }, [open, reset]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setImageUrl(json.data.url);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: ProductInput) => {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        images: imageUrl ? [imageUrl] : [],
      }),
    });
    const json = await res.json();

    if (!json.success) {
      toast.error(json.error ?? "Failed to create product");
      return;
    }

    toast.success("Product created");
    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
          <DialogDescription>
            Create a product with variants and clothing-specific attributes.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="clothing">Clothing Attributes</TabsTrigger>
              <TabsTrigger value="variants">Variants</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Product Image</Label>
                <div className="flex items-center gap-4">
                  {imageUrl && (
                    <div className="relative h-16 w-16 overflow-hidden rounded-lg border">
                      <Image src={imageUrl} alt="Preview" fill className="object-cover" unoptimized />
                    </div>
                  )}
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-4 py-3 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900">
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {uploading ? "Uploading..." : "Upload image"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Name *</Label>
                <Input {...register("name")} />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Category *</Label>
                <select
                  className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  {...register("categoryId")}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-sm text-red-500">{errors.categoryId.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cost Price (Default)</Label>
                  <Input type="number" step="0.01" {...register("costPrice", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label>Selling Price (Default) *</Label>
                  <Input type="number" step="0.01" {...register("sellingPrice", { valueAsNumber: true })} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Stock (Total)</Label>
                  <Input type="number" step="0.01" {...register("stock", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label>Tax %</Label>
                  <Input type="number" {...register("taxRate", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Input {...register("unit")} placeholder="meter, pcs, suit" />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="clothing" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fabric Type</Label>
                  <Input {...register("fabricType")} placeholder="e.g. Wash & Wear, Cotton" />
                </div>
                <div className="space-y-2">
                  <Label>Season</Label>
                  <Input {...register("season")} placeholder="e.g. Summer, Winter" />
                </div>
                <div className="space-y-2">
                  <Label>Collection Name</Label>
                  <Input {...register("collectionName")} placeholder="e.g. Eid Collection 2026" />
                </div>
                <div className="space-y-2">
                  <Label>Occasion</Label>
                  <Input {...register("occasion")} placeholder="e.g. Casual, Formal" />
                </div>
                <div className="space-y-2">
                  <Label>Finish</Label>
                  <Input {...register("finish")} placeholder="e.g. Soft, Stiff" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="variants" className="space-y-4 pt-4">
              <div className="flex justify-between items-center">
                <Label>Product Variants</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => append({ name: "", sku: "", price: 0, cost: 0, stock: 0, color: "", width: "" })}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Variant
                </Button>
              </div>
              
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-4 pr-8">
                    <div className="space-y-2">
                      <Label>Variant Name *</Label>
                      <Input {...register(`variants.${index}.name`)} placeholder="e.g. Navy Blue / 54 inches" />
                      {errors.variants?.[index]?.name && (
                        <p className="text-sm text-red-500">{errors.variants[index].name?.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>SKU *</Label>
                      <Input {...register(`variants.${index}.sku`)} placeholder="e.g. WW-NAVY-54" />
                      {errors.variants?.[index]?.sku && (
                        <p className="text-sm text-red-500">{errors.variants[index].sku?.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Color</Label>
                      <Input {...register(`variants.${index}.color`)} placeholder="e.g. Navy Blue" />
                    </div>
                    <div className="space-y-2">
                      <Label>Width</Label>
                      <Input {...register(`variants.${index}.width`)} placeholder="e.g. 54 inches" />
                    </div>
                    <div className="space-y-2">
                      <Label>Barcode</Label>
                      <Input {...register(`variants.${index}.barcode`)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Price</Label>
                      <Input type="number" step="0.01" {...register(`variants.${index}.price`, { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Cost</Label>
                      <Input type="number" step="0.01" {...register(`variants.${index}.cost`, { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Stock</Label>
                      <Input type="number" step="0.01" {...register(`variants.${index}.stock`, { valueAsNumber: true })} />
                    </div>
                  </div>
                </div>
              ))}
              
              {fields.length === 0 && (
                <p className="text-sm text-zinc-500 text-center py-4">No variants added. Product will be treated as a single item.</p>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#245C43] hover:bg-[#1E4D37] text-white font-semibold shadow-sm shadow-[#245C43]/20"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
