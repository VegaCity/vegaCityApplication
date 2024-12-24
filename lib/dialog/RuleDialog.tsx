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
      <DialogContent className="max-w-md">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-semibold text-blue-700 flex items-center gap-2">
            <InfoIcon className="w-5 h-5" />
            {currentStoreType?.name} Store Rules
          </DialogTitle>
          <DialogDescription className="mt-2 text-gray-600">
            These are the operational rules specific to your store type.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p className="text-sm text-gray-700 font-medium">
            As a {currentStoreType?.name} store owner, you must adhere to the
            following rules:
          </p>
          <ul className="space-y-3">
            {currentRestrictions.map((rule, index) => (
              <li 
                key={index} 
                className="flex items-start gap-3 text-gray-700"
              >
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm">
                  {index + 1}
                </span>
                <span className="text-sm">{rule}</span>
              </li>
            ))}
          </ul>
          
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <p className="font-semibold text-blue-700 mb-2 text-sm">Important Note:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-blue-700">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-700 mt-1.5 flex-shrink-0" />
                <span>Violating these rules may result in account suspension.</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-blue-700">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-700 mt-1.5 flex-shrink-0" />
                <span>Changes to rules will be communicated with prior notice.</span>
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <DialogClose asChild>
            <Button 
              variant="secondary"
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