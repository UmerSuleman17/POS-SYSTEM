"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ModulePage } from "@/components/shared/module-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CustomerLedgerPage() {
  const params = useParams();
  const id = params.id as string;
  const [entries, setEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [payOpen, setPayOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");

  const loadLedger = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/customers/${id}/ledger`);
      const json = await res.json();
      if (json.success) setEntries(json.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLedger();
  }, [id]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/customers/${id}/ledger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), description: desc }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      
      toast.success("Payment recorded successfully");
      setPayOpen(false);
      setAmount("");
      setDesc("");
      loadLedger();
    } catch (err: any) {
      toast.error(err.message || "Failed to record payment");
    }
  };

  return (
    <ModulePage title="Customer Ledger (Udhaar Khata)" description="Audit trail of credit purchases and received payments">
      <div className="flex justify-end mb-4">
        <Dialog open={payOpen} onOpenChange={setPayOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#245C43] hover:bg-[#1E4D37] text-white font-semibold shadow-sm shadow-[#245C43]/20">
              Receive Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-[#17251F] dark:text-[#F4F6F2]">
                Receive Customer Payment
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePayment} className="space-y-4">
              <div className="space-y-2">
                <Label>Amount (PKR)</Label>
                <Input type="number" required min="1" step="any" placeholder="e.g. 5000" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Payment Notes / Reference</Label>
                <Input placeholder="e.g. Cash / JazzCash / Bank Transfer reference" value={desc} onChange={(e) => setDesc(e.target.value)} />
              </div>
              <Button type="submit" className="w-full bg-[#245C43] hover:bg-[#1E4D37] text-white font-bold">
                Record Payment to Ledger
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-[#2A4437]">
          <CardTitle className="text-base font-bold text-[#17251F] dark:text-[#F4F6F2]">
            Udhaar Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-8 text-center text-sm text-zinc-500">Loading ledger entries...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-zinc-200/80 bg-zinc-50/60 dark:border-[#2A4437] dark:bg-white/5">
                    <th className="py-3 px-4 font-semibold text-zinc-600 dark:text-zinc-300">Date</th>
                    <th className="py-3 px-4 font-semibold text-zinc-600 dark:text-zinc-300">Reference</th>
                    <th className="py-3 px-4 font-semibold text-zinc-600 dark:text-zinc-300">Description</th>
                    <th className="py-3 px-4 font-semibold text-zinc-600 dark:text-zinc-300">Type</th>
                    <th className="py-3 px-4 font-semibold text-right text-zinc-600 dark:text-zinc-300">Amount</th>
                    <th className="py-3 px-4 font-semibold text-right text-zinc-600 dark:text-zinc-300">Balance After</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-[#2A4437]/40">
                  {entries.map((e, idx) => (
                    <tr
                      key={idx}
                      className={e.type === "debit" ? "bg-red-50/30 hover:bg-red-50/60 dark:bg-red-950/10" : "bg-[#245C43]/5 hover:bg-[#245C43]/10 dark:bg-[#245C43]/10"}
                    >
                      <td className="py-3 px-4 font-medium text-zinc-700 dark:text-zinc-300">{formatDate(new Date(e.createdAt))}</td>
                      <td className="py-3 px-4 font-mono text-xs text-zinc-600 dark:text-zinc-400">{e.reference}</td>
                      <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300">{e.description || "—"}</td>
                      <td className="py-3 px-4">
                        <Badge variant={e.type === "credit" ? "success" : "destructive"} className="text-[11px] font-bold">
                          {e.type === "credit" ? "PAYMENT (CR)" : "UDHAAR (DR)"}
                        </Badge>
                      </td>
                      <td className={`py-3 px-4 text-right font-bold ${e.type === "debit" ? "text-red-600" : "text-[#245C43] dark:text-[#6EE7B7]"}`}>
                        {formatCurrency(e.amount)}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-[#17251F] dark:text-[#F4F6F2]">
                        {formatCurrency(e.balanceAfter)}
                      </td>
                    </tr>
                  ))}
                  {entries.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-sm text-zinc-500">
                        No ledger transactions recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </ModulePage>
  );
}
