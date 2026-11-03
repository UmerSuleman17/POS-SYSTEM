import { DollarSign, ShoppingBag, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface StatsCardsProps {
  today: { revenue: number; sales: number; avgOrder: number };
  week: { revenue: number; sales: number };
  lowStockCount: number;
}

export function StatsCards({ today, week, lowStockCount }: StatsCardsProps) {
  const stats = [
    {
      title: "Today's Revenue",
      value: formatCurrency(today.revenue),
      icon: DollarSign,
      change: `${today.sales} sales today`,
      borderClass: "border-l-4 border-l-[#245C43]",
      iconBg: "bg-[#245C43]/10 text-[#245C43] dark:bg-[#245C43]/20 dark:text-[#6EE7B7]",
    },
    {
      title: "Weekly Revenue",
      value: formatCurrency(week.revenue),
      icon: TrendingUp,
      change: `${week.sales} orders this week`,
      borderClass: "border-l-4 border-l-[#3D8964]",
      iconBg: "bg-[#3D8964]/10 text-[#3D8964] dark:bg-[#3D8964]/20 dark:text-[#6EE7B7]",
    },
    {
      title: "Avg Order Value",
      value: formatCurrency(today.avgOrder),
      icon: ShoppingBag,
      change: "Calculated per ticket",
      borderClass: "border-l-4 border-l-[#17251F] dark:border-l-[#A3B5A8]",
      iconBg: "bg-zinc-100 text-zinc-800 dark:bg-white/10 dark:text-zinc-200",
    },
    {
      title: "Low Stock Alerts",
      value: String(lowStockCount),
      icon: AlertTriangle,
      change: lowStockCount > 0 ? "Requires restocking" : "Inventory healthy",
      borderClass: "border-l-4 border-l-amber-500",
      iconBg: lowStockCount > 0
        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
        : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
      alert: lowStockCount > 0,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className={`overflow-hidden transition-all hover:shadow-md ${stat.borderClass}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {stat.title}
              </CardTitle>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.iconBg}`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="text-2xl font-extrabold tracking-tight text-[#17251F] dark:text-[#F4F6F2]">
                {stat.value}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
