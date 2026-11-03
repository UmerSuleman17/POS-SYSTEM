import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface Transaction {
  _id: string;
  invoiceNumber: string;
  total: number;
  createdAt: string;
  cashierId?: { name?: string };
}

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-[#17251F] dark:text-[#F4F6F2]">
          Recent Transactions
        </CardTitle>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Latest completed counter sales</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2.5">
          {transactions.length === 0 && (
            <p className="text-sm text-zinc-500 py-6 text-center">No transactions recorded yet</p>
          )}
          {transactions.map((tx) => (
            <div
              key={tx._id}
              className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 transition-colors hover:bg-zinc-50 dark:border-[#2A4437]/50 dark:hover:bg-white/5"
            >
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{tx.invoiceNumber}</p>
                <p className="text-xs text-zinc-500" suppressHydrationWarning>
                  {new Date(tx.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#245C43] dark:text-[#6EE7B7]">
                  {formatCurrency(tx.total)}
                </p>
                <Badge variant="secondary" className="text-[11px] bg-[#E8EBE6] text-[#245C43] dark:bg-[#245C43]/20 dark:text-[#6EE7B7]">
                  {tx.cashierId?.name ?? "Counter"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
