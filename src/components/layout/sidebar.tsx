"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse,
  Users,
  Truck,
  ShoppingBag,
  Receipt,
  Wallet,
  UserCog,
  BarChart3,
  Settings,
  Bell,
  Building2,
  Tags,
  Award,
  Scissors,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navSections = [
  {
    title: "Main",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/pos", label: "POS Counter", icon: ShoppingCart },
      { href: "/sales", label: "Sales & Invoices", icon: Receipt },
    ],
  },
  {
    title: "Fabric & Inventory",
    items: [
      { href: "/products", label: "Fabrics & Suits", icon: Package },
      { href: "/inventory", label: "Stock Levels", icon: Warehouse },
      { href: "/categories", label: "Categories", icon: Tags },
      { href: "/brands", label: "Brands", icon: Award },
    ],
  },
  {
    title: "Purchases & Partners",
    items: [
      { href: "/purchases", label: "Purchases (WAC)", icon: ShoppingBag },
      { href: "/suppliers", label: "Suppliers", icon: Truck },
      { href: "/customers", label: "Customers (Udhaar)", icon: Users },
      { href: "/expenses", label: "Expenses", icon: Wallet },
      { href: "/employees", label: "Employees", icon: UserCog },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/reports", label: "Reports", icon: BarChart3 },
      { href: "/branches", label: "Branches", icon: Building2 },
      { href: "/notifications", label: "Notifications", icon: Bell },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 bg-[#17251F] text-[#F4F6F2] border-r border-[#245C43]/40 lg:flex lg:flex-col">
      <div className="flex h-16 items-center px-5 border-b border-[#245C43]/30">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#245C43] text-white shadow-sm shadow-[#245C43]/50">
            <Scissors className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1 font-bold text-base tracking-tight leading-none text-white">
              <span>Fabric</span>
              <span className="text-[#3D8964]">POS</span>
            </div>
            <span className="text-[10px] text-[#A3B5A8] tracking-wider uppercase font-medium mt-0.5">
              Men&apos;s Unstitched Store
            </span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-[#7A8E80]">
              {section.title}
            </p>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    active
                      ? "bg-[#245C43] text-white shadow-sm shadow-[#245C43]/40 font-semibold"
                      : "text-[#A3B5A8] hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      active
                        ? "text-white"
                        : "text-[#7A8E80] group-hover:text-[#3D8964]"
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
