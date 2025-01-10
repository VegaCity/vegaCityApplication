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
import { storeTypes } from "@/types/store/storeOwner";
import { InfoIcon } from "lucide-react";

export const StoreRulesDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const storeType = localStorage.getItem("storeType")
    ? parseInt(localStorage.getItem("storeType") as string)
    : 0;

  const currentStoreType = storeTypes.find((type) => type.value === storeType);

  const restrictions = {
    Product: [
      "You can sell products only.",
      "You cannot offer services.",
      "Ensure all items meet product quality standards.",
    ],
    Service: [
      "You can offer services only.",
      "You cannot sell products.",
      "Provide clear descriptions of your service offerings.",
    ],
  };

  const currentRestrictions =
    storeType === 1 ? restrictions.Product : restrictions.Service;

  const balanceNotes = [
    "Balance shows the withdrawal amount of the Store wallet",
    "Initial balance represents the total amount the store received from the QR code payment invoice",
    "VirtualCurrency may realize store revenue through other payment methods and the system does not hold these funds",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-2 hover:bg-blue-50 transition-colors"
        >
          <InfoIcon className="w-4 h-4 mr-2" />
          View Store Rules
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader className="pb-3 border-b">
          <DialogTitle className="text-lg font-semibold text-blue-700 flex items-center gap-2">
            <InfoIcon className="w-4 h-4" />
            {currentStoreType?.name} Store Rules
          </DialogTitle>
          <DialogDescription className="mt-1 text-gray-600 text-sm">
            These are the operational rules specific to your store type.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <p className="text-sm text-gray-700 font-medium">
            As a {currentStoreType?.name} store owner, you must adhere to the
            following rules:
          </p>
          <ul className="space-y-2">
            {currentRestrictions.map((rule, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-700">
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
                  {index + 1}
                </span>
                <span className="text-sm">{rule}</span>
              </li>
            ))}
          </ul>

          <div className="bg-blue-50 rounded-lg border border-blue-100 p-3">
            <p className="font-medium text-blue-700 mb-1.5 text-sm">
              Important Note:
            </p>
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2 text-sm text-blue-700">
                <span className="w-1 h-1 rounded-full bg-blue-700 mt-1.5 flex-shrink-0" />
                <span>
                  Violating these rules may result in account suspension.
                </span>
              </li>
              <li className="flex items-start gap-2 text-sm text-blue-700">
                <span className="w-1 h-1 rounded-full bg-blue-700 mt-1.5 flex-shrink-0" />
                <span>
                  Changes to rules will be communicated with prior notice.
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-yellow-50 rounded-lg border border-yellow-100 p-3">
            <p className="font-medium text-yellow-700 mb-1.5 text-sm">
              Balance Information:
            </p>
            <ul className="space-y-1.5">
              {balanceNotes.map((note, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-yellow-700"
                >
                  <span className="w-1 h-1 rounded-full bg-yellow-700 mt-1.5 flex-shrink-0" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter className="border-t pt-3">
          <DialogClose asChild>
            <Button
              variant="secondary"
              size="sm"
              className="w-full sm:w-auto hover:bg-blue-50 transition-colors"
            >
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StoreRulesDialog;
