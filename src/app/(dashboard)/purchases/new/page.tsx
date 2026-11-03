"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ModulePage } from "@/components/shared/module-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { Trash2, Plus } from "lucide-react";

export default function NewPurchasePage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [supplierId, setSupplierId] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [tax, setTax] = useState(0);
  const [paid, setPaid] = useState(0);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/suppliers").then(r => r.json()).then(j => { if(j.success) setSuppliers(j.data.items || []); });
    fetch("/api/products").then(r => r.json()).then(j => { if(j.success) setProducts(j.data.items || []); });
  }, []);

  const addItem = () => {
    setItems([...items, { productId: "", variantId: "", name: "", quantity: 1, cost: 0 }]);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: string, value: any) => {
    const newItems = [...items];
    if (field === "productId") {
      const p = products.find(x => x._id === value);
      newItems[idx].productId = value;
      newItems[idx].name = p?.name || "";
      newItems[idx].variantId = "";
      newItems[idx].cost = p?.costPrice || 0;
    } else if (field === "variantId") {
      const p = products.find(x => x._id === newItems[idx].productId);
      const v = p?.variants?.find((x: any) => x._id === value);
      newItems[idx].variantId = value;
      if (v) {
        newItems[idx].name = `${p?.name} - ${v.name}`;
        newItems[idx].cost = v.cost || p?.costPrice || 0;
      }
    } else {
      newItems[idx][field] = value;
    }
    setItems(newItems);
  };

  const subtotal = items.reduce((s, i) => s + (i.cost * i.quantity), 0);
  const total = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) return toast.error("Select a supplier");
    if (items.length === 0) return toast.error("Add at least one item");
    
    setLoading(true);
    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId,
          items: items.filter(i => i.productId && i.quantity > 0),
          tax,
          paid,
          notes
        })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      
      toast.success("Purchase recorded successfully");
      router.push("/purchases");
    } catch(err: any) {
      toast.error(err.message || "Failed to record purchase");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModulePage title="Receive Purchase" description="Record incoming stock and update costs">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Items Received</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, idx) => {
                const product = products.find(p => p._id === item.productId);
                return (
                  <div key={idx} className="flex flex-wrap items-end gap-3 p-3 border rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
                    <div className="flex-1 min-w-[200px] space-y-1">
                      <Label>Product</Label>
                      <select 
                        className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                        value={item.productId}
                        onChange={(e) => updateItem(idx, "productId", e.target.value)}
                        required
                      >
                        <option value="">Select product...</option>
                        {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                      </select>
                    </div>
                    {product?.variants?.length > 0 && (
                      <div className="w-40 space-y-1">
                        <Label>Variant</Label>
                        <select
                          className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                          value={item.variantId}
                          onChange={(e) => updateItem(idx, "variantId", e.target.value)}
                          required
                        >
                          <option value="">Select...</option>
                          {product.variants.map((v: any) => <option key={v._id} value={v._id}>{v.name}</option>)}
                        </select>
                      </div>
                    )}
                    <div className="w-24 space-y-1">
                      <Label>Qty</Label>
                      <Input type="number" min="0.01" step="0.01" required value={item.quantity} onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))} />
                    </div>
                    <div className="w-32 space-y-1">
                      <Label>Unit Cost</Label>
                      <Input type="number" min="0" step="0.01" required value={item.cost} onChange={(e) => updateItem(idx, "cost", Number(e.target.value))} />
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => removeItem(idx)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
              <Button
                type="button"
                variant="outline"
                onClick={addItem}
                className="w-full border-dashed border-2 border-zinc-200 hover:border-[#245C43] hover:text-[#245C43] dark:border-zinc-700 py-3 font-semibold transition-all"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Fabric Item / Variant
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-[#2A4437]">
              <CardTitle className="text-base font-bold text-[#17251F] dark:text-[#F4F6F2]">
                Purchase &amp; Supplier Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <Label>Supplier</Label>
                <select 
                  className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#245C43] dark:border-zinc-700 dark:bg-[#17251F]"
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  required
                >
                  <option value="">Select mill / fabric supplier...</option>
                  {suppliers.map(s => <option key={s._id} value={s._id}>{s.name} ({s.company})</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Tax Amount (PKR)</Label>
                <Input type="number" min="0" value={tax} onChange={(e) => setTax(Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label>Amount Paid Today (PKR)</Label>
                <Input type="number" min="0" value={paid} onChange={(e) => setPaid(Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label>Invoice / Bilty Notes</Label>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Supplier invoice #, transporter name..." />
              </div>

              <div className="pt-4 border-t border-zinc-200/80 dark:border-[#2A4437] space-y-2">
                <div className="flex justify-between text-xs text-zinc-500 font-medium">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-500 font-medium">
                  <span>Tax</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-base">
                  <span className="text-[#17251F] dark:text-[#F4F6F2]">Total</span>
                  <span className="text-[#245C43] dark:text-[#6EE7B7]">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-xs text-red-600 font-bold">
                  <span>Payable to Supplier</span>
                  <span>{formatCurrency(total - paid)}</span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full mt-2 bg-[#245C43] hover:bg-[#1E4D37] text-white font-bold h-11 shadow-md shadow-[#245C43]/20"
                disabled={loading}
              >
                {loading ? "Recording & Updating WAC..." : "Receive Stock & Apply WAC"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </ModulePage>
  );
}
