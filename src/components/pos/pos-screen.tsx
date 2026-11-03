"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Barcode,
  Trash2,
  Pause,
  Play,
  CreditCard,
  Banknote,
  Printer,
  Plus,
  Minus,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useDebounce } from "@/hooks/use-debounce";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useCartStore } from "@/stores/cart-store";
import { formatCurrency } from "@/lib/utils";
import { printThermalReceipt } from "@/lib/print-invoice";
import type { CartItem } from "@/types";

interface ProductResult {
  _id: string;
  name: string;
  sku: string;
  barcode?: string;
  sellingPrice: number;
  stock: number;
  images?: string[];
  taxRate?: number;
  variants?: any[];
}

export function PosScreen() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<ProductResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "credit">("cash");
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedProductForVariant, setSelectedProductForVariant] = useState<ProductResult | null>(null);
  const debouncedSearch = useDebounce(search);

  const {
    items,
    discount,
    taxRate,
    heldCarts,
    addItem,
    removeItem,
    updateQuantity,
    setDiscount,
    clearCart,
    holdCart,
    resumeCart,
    getSubtotal,
    getTotal,
  } = useCartStore();

  const fetchProducts = useCallback(async (q: string) => {
    if (!q) {
      setProducts([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/products/search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      if (json.success) setProducts(json.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(debouncedSearch);
  }, [debouncedSearch, fetchProducts]);

  useEffect(() => {
    fetch("/api/customers").then(r => r.json()).then(j => {
      if (j.success) setCustomers(j.data?.items || []);
    });
  }, []);

  const addProductToCart = (product: ProductResult, variant?: any) => {
    if (product.variants && product.variants.length > 0 && !variant) {
      setSelectedProductForVariant(product);
      return;
    }
    
    const stock = variant ? variant.stock : product.stock;
    if (stock <= 0) {
      toast.error("Out of stock");
      return;
    }
    const item: CartItem = {
      productId: product._id,
      variantId: variant?._id,
      name: variant ? `${product.name} - ${variant.name}` : product.name,
      sku: variant?.sku || product.sku,
      barcode: variant?.barcode || product.barcode,
      price: variant?.price || product.sellingPrice,
      quantity: 1,
      discount: 0,
      tax: product.taxRate ?? 0,
      image: product.images?.[0],
    };
    addItem(item);
    setSearch("");
    setProducts([]);
    setSelectedProductForVariant(null);
    toast.success(`Added ${item.name}`);
  };

  const handleBarcodeScan = async (barcode: string) => {
    const res = await fetch(`/api/products/barcode/${barcode}`);
    const json = await res.json();
    if (json.success && json.data) {
      addProductToCart(json.data);
    } else {
      toast.error("Product not found");
    }
  };

  useKeyboardShortcuts({
    "ctrl+f": () => document.getElementById("pos-search")?.focus(),
    "ctrl+h": () => holdCart(),
    f2: () => setPaymentMethod("cash"),
    f3: () => setPaymentMethod("card"),
  });

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    if (paymentMethod === "credit" && !selectedCustomerId) {
      toast.error("Please select a customer for Udhaar");
      return;
    }
    setCheckoutLoading(true);
    try {
      const total = getTotal();
      const res = await fetch("/api/sales/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          discount,
          taxRate,
          payments: [{ method: paymentMethod, amount: total }],
          customerId: selectedCustomerId || undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      printThermalReceipt({
        storeName: "RetailPOS",
        invoiceNumber: json.data.invoiceNumber,
        date: new Date().toLocaleString(),
        cashier: "Cashier",
        items,
        subtotal: getSubtotal(),
        discount,
        tax: getSubtotal() * (taxRate / 100),
        total,
        payments: [{ method: paymentMethod, amount: total }],
      });

      clearCart();
      toast.success("Sale completed!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="grid h-[calc(100vh-7.5rem)] gap-4 lg:grid-cols-3">
      <div className="flex flex-col gap-4 lg:col-span-2">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            id="pos-search"
            placeholder="Scan barcode or search unstitched fabric / suits (Ctrl+F)..."
            className="h-11 pl-10 pr-10 rounded-xl border-zinc-200 bg-white text-sm shadow-sm transition-all focus-visible:ring-[#245C43] dark:border-[#2A4437] dark:bg-[#17251F]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && search.length >= 8) {
                handleBarcodeScan(search);
              }
            }}
            autoFocus
          />
          <Barcode className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        </div>

        <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 md:grid-cols-4 content-start">
          {loading && (
            <p className="col-span-full py-8 text-center text-sm text-zinc-500">Searching fabrics...</p>
          )}
          {products.map((product) => (
            <button
              key={product._id}
              type="button"
              onClick={() => addProductToCart(product)}
              className="group relative flex flex-col justify-between rounded-xl border border-zinc-200/90 bg-white p-3.5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#245C43] hover:shadow-md dark:border-[#2A4437] dark:bg-[#17251F]"
            >
              <div>
                <span className="line-clamp-2 text-sm font-semibold text-zinc-900 group-hover:text-[#245C43] dark:text-zinc-100 dark:group-hover:text-[#6EE7B7] pr-12">
                  {product.name}
                </span>
                <span className="mt-2 block text-base font-extrabold text-[#245C43] dark:text-[#6EE7B7]">
                  {formatCurrency(product.sellingPrice)}
                </span>
              </div>
              <Badge
                variant={product.stock <= 5 ? "warning" : "secondary"}
                className="absolute top-2.5 right-2.5 text-[10px] px-2 py-0.5"
              >
                {product.stock} left
              </Badge>
            </button>
          ))}
        </div>
      </div>

      <Card className="flex flex-col shadow-sm">
        <CardHeader className="flex flex-col gap-2.5 pb-3">
          <div className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-[#17251F] dark:text-[#F4F6F2]">
              Current Sale ({items.length})
            </CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => holdCart()} title="Hold bill (Ctrl+H)">
                <Pause className="h-4 w-4 text-zinc-500" />
              </Button>
              <Button variant="ghost" size="icon" onClick={clearCart} title="Clear cart">
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
          <select 
            className="flex h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50/60 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#245C43] dark:border-[#2A4437] dark:bg-white/5 font-medium"
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
          >
            <option value="">Walk-in Customer (General)</option>
            {customers.map(c => <option key={c._id} value={c._id}>{c.name} {c.phone ? `(${c.phone})` : ""}</option>)}
          </select>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-3 overflow-hidden">
          {heldCarts.length > 0 && (
            <div className="flex flex-wrap gap-1 pb-1">
              {heldCarts.map((h) => (
                <Button key={h.id} variant="outline" size="sm" onClick={() => resumeCart(h.id)} className="h-7 text-xs border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100">
                  <Play className="mr-1 h-3 w-3" />
                  Resume #{h.id.slice(-4)}
                </Button>
              ))}
            </div>
          )}

          <div className="flex-1 space-y-2 overflow-y-auto pr-0.5">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId}`}
                className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50/80 p-2.5 transition-colors dark:border-[#2A4437]/40 dark:bg-black/20"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{item.name}</p>
                  <p className="text-xs text-zinc-500">
                    {formatCurrency(item.price)} each
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 rounded-md border-zinc-300 dark:border-zinc-700"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1, item.variantId)
                    }
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-7 text-center text-sm font-bold text-zinc-800 dark:text-zinc-200">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 rounded-md border-zinc-300 dark:border-zinc-700"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1, item.variantId)
                    }
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="py-12 text-center text-sm text-zinc-400">
                <ShoppingCart className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600 mb-2 opacity-50" />
                Cart is empty
              </div>
            )}
          </div>

          <div className="space-y-2 border-t border-zinc-200/80 dark:border-[#2A4437] pt-3">
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Discount amount"
                value={discount || ""}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                className="h-8 text-xs rounded-lg"
              />
            </div>
            <div className="flex justify-between text-xs text-zinc-500 font-medium">
              <span>Subtotal</span>
              <span>{formatCurrency(getSubtotal())}</span>
            </div>
            <div className="flex justify-between text-lg font-extrabold">
              <span className="text-[#17251F] dark:text-[#F4F6F2]">Total</span>
              <span className="text-[#245C43] dark:text-[#6EE7B7]">{formatCurrency(getTotal())}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <Button
                variant={paymentMethod === "cash" ? "default" : "outline"}
                className={paymentMethod === "cash" ? "bg-[#245C43] text-white hover:bg-[#1E4D37] shadow-sm shadow-[#245C43]/20" : "hover:border-[#245C43]"}
                onClick={() => setPaymentMethod("cash")}
              >
                <Banknote className="mr-1 h-4 w-4" />
                Cash
              </Button>
              <Button
                variant={paymentMethod === "card" ? "default" : "outline"}
                className={paymentMethod === "card" ? "bg-[#1E3A5F] text-white hover:bg-[#152B47] shadow-sm" : "hover:border-[#1E3A5F]"}
                onClick={() => setPaymentMethod("card")}
              >
                <CreditCard className="mr-1 h-4 w-4" />
                Card
              </Button>
              <Button
                variant={paymentMethod === "credit" ? "default" : "outline"}
                className={paymentMethod === "credit" ? "bg-[#B45309] text-white hover:bg-[#92400E] shadow-sm" : "hover:border-amber-600"}
                onClick={() => setPaymentMethod("credit")}
                title="Udhaar / Customer Credit"
              >
                Udhaar
              </Button>
            </div>

            <Button
              className="w-full bg-[#245C43] hover:bg-[#1E4D37] text-white font-bold h-11 text-sm shadow-md shadow-[#245C43]/30 transition-all"
              size="lg"
              onClick={handleCheckout}
              disabled={checkoutLoading || items.length === 0}
            >
              <Printer className="mr-2 h-4 w-4" />
              {checkoutLoading ? "Finalizing Sale..." : "Complete & Print Receipt"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedProductForVariant} onOpenChange={(open) => !open && setSelectedProductForVariant(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#17251F] dark:text-[#F4F6F2]">
              Select Fabric Variant
            </DialogTitle>
            <p className="text-xs text-zinc-500">
              {selectedProductForVariant?.name}
            </p>
          </DialogHeader>
          <div className="grid gap-2.5 py-3">
            {selectedProductForVariant?.variants?.map((v: any) => (
              <Button
                key={v._id}
                variant="outline"
                className="justify-between h-auto py-3 px-4 rounded-xl hover:border-[#245C43] hover:bg-[#245C43]/5 text-left transition-all"
                onClick={() => selectedProductForVariant && addProductToCart(selectedProductForVariant, v)}
                disabled={v.stock <= 0}
              >
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{v.name}</span>
                  <span className="text-xs text-zinc-500">
                    {v.stock > 0 ? `${v.stock} in stock` : "Out of stock"}
                  </span>
                </div>
                <span className="font-extrabold text-[#245C43] dark:text-[#6EE7B7]">
                  {formatCurrency(v.price || selectedProductForVariant.sellingPrice)}
                </span>
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedProductForVariant(null)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
