import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { storeTypes } from "@/types/store/storeOwner";

// Define commission rates for different product types
const commissionRates = [
  { type: "Product", rate: "3%" },
  { type: "Service", rate: "5%" },
];

export const CommissionRatesDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const storeType = localStorage.getItem("storeType")
    ? parseInt(localStorage.getItem("storeType") as string)
    : 0;

  const currentStoreType = storeTypes.find((type) => type.value === storeType);

  const relevantCommissionRates = commissionRates.filter(
    (rate) =>
      (storeType === 1 && rate.type === "Product") ||
      (storeType === 2 && rate.type === "Service")
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <Info className="mr-2 h-4 w-4" /> Commission Rates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Store Commission Rates</DialogTitle>
          <DialogDescription>
            Important business terms regarding commission rates for{" "}
            {currentStoreType?.name} stores
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            As a {currentStoreType?.name} store owner, you will receive a
            percentage of each order:
          </p>

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="border p-2 text-left">Product Type</th>
                <th className="border p-2 text-right">Commission Rate</th>
              </tr>
            </thead>
            <tbody>
              {relevantCommissionRates.map((item) => (
                <tr key={item.type} className="hover:bg-muted/50">
                  <td className="border p-2">{item.type}</td>
                  <td className="border p-2 text-right font-semibold">
                    {item.rate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 text-sm">
            <p className="font-semibold">Important Notes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Rates are subject to change with 30 days notice</li>
              <li>Commissions are calculated on the total order value</li>
              <li>
                Taxes and shipping are not included in commission calculation
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
