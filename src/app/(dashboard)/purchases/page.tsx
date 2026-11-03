import { ModulePage } from "@/components/shared/module-page";
import { PurchasesPage } from "@/components/purchases/purchases-page";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Purchases" };

export default function Page() {
  return (
    <ModulePage title="Purchases" description="Purchase orders, history, and returns">
      <div className="flex justify-end mb-4">
        <Link href="/purchases/new">
          <Button className="bg-[#245C43] hover:bg-[#1E4D37] text-white font-semibold shadow-sm shadow-[#245C43]/20">
            Receive New Purchase
          </Button>
        </Link>
      </div>
      <PurchasesPage />
    </ModulePage>
  );
}
