import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { connectDB } from "@/lib/db";
import { DashboardService } from "@/services/dashboard.service";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

const dashboardService = new DashboardService();

export default async function DashboardPage() {
  await connectDB();
  const overview = await dashboardService.getOverview();
  const chart = await dashboardService.getSalesChart(7);

  return (
    <DashboardShell title="Dashboard">
      <div className="space-y-6">
        <StatsCards
          today={overview.today}
          week={overview.week}
          lowStockCount={overview.lowStockAlerts.length}
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <SalesChart data={chart} />
          <RecentTransactions
            transactions={overview.recentTransactions as never[]}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-[#17251F] dark:text-[#F4F6F2]">
                Top Selling Fabrics &amp; Suits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {overview.topProducts.map(
                  (p: { _id: unknown; name: string; quantity: number; revenue: number }, idx: number) => (
                    <div
                      key={String(p._id)}
                      className="flex items-center justify-between text-sm p-2 rounded-lg transition-colors hover:bg-zinc-50 dark:hover:bg-white/5"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E8EBE6] text-xs font-bold text-[#245C43] dark:bg-[#245C43]/20 dark:text-[#6EE7B7]">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">{p.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#245C43] dark:text-[#6EE7B7]">
                          {formatCurrency(p.revenue)}
                        </span>
                        <span className="text-xs text-zinc-500 block">
                          {p.quantity} units sold
                        </span>
                      </div>
                    </div>
                  )
                )}
                {overview.topProducts.length === 0 && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 py-6 text-center">No sales data yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-[#17251F] dark:text-[#F4F6F2]">
                Low Stock Restock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {overview.lowStockAlerts.map((p) => (
                  <div
                    key={String(p._id)}
                    className="flex items-center justify-between rounded-lg border border-amber-200/80 bg-amber-50/60 p-2.5 text-sm dark:border-amber-900/50 dark:bg-amber-950/30"
                  >
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{p.name}</span>
                    <span className="font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded text-xs">
                      {p.stock} remaining
                    </span>
                  </div>
                ))}
                {overview.lowStockAlerts.length === 0 && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 py-6 text-center">All inventory stock levels healthy</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
