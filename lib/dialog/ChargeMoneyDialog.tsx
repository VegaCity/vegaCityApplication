import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Promotion } from "@/types/promotion/Promotion";
import { UseFormReturn } from "react-hook-form";
import { CreditCard, Wallet, AlertTriangle } from "lucide-react";

interface ChargeMoneyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<any>;
  onSubmit: (data: any) => void;
  amount: string;
  onAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formatAmount: (value: string) => string;
  promotions: Promotion[];
  isLoadingPromotions: boolean;
}

export const ChargeMoneyDialog: React.FC<ChargeMoneyDialogProps> = ({
  isOpen,
  onOpenChange,
  form,
  onSubmit,
  amount,
  onAmountChange,
  formatAmount,
  promotions,
  isLoadingPromotions,
}) => {
  const [amountError, setAmountError] = useState<string | null>(null);

  const validateAmount = (value: string) => {
    const numericAmount = parseFloat(value.replace(/[^\d]/g, ""));

    if (isNaN(numericAmount)) {
      setAmountError("Please enter a valid amount");
      return false;
    }

    if (numericAmount < 50000) {
      setAmountError("Minimum deposit is 50,000 VND");
      return false;
    }

    if (numericAmount % 10000 !== 0) {
      setAmountError("Amount must be a multiple of 10,000 VND");
      return false;
    }

    setAmountError(null);
    return true;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAmountChange(e);
    validateAmount(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAmount(amount)) {
      form.handleSubmit(onSubmit)(e);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          form.reset();
          setAmountError(null);
        }
      }}
    >
      <DialogContent className="w-[550px] max-h-[85vh] overflow-y-auto bg-white rounded-xl shadow-lg">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl font-semibold text-center text-blue-800">
            <Wallet
              className="inline-block mr-2 mb-1 text-blue-700"
              size={28}
            />
            Deposit Money
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-5 px-6">
          <div className="space-y-6">
            {/* Amount Section */}
            <div className="p-6 bg-gray-50 shadow-md rounded-lg">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Amount (VND)
              </label>
              <Input
                id="chargeAmount"
                type="text"
                value={formatAmount(amount)}
                onChange={handleAmountChange}
                placeholder="Enter an amount"
                className={`text-xl font-medium h-12 pr-4 rounded-lg border-2 ${
                  amountError
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                } transition duration-200 ease-in-out`}
              />
              {amountError && (
                <div className="mt-2 text-red-600 flex items-center">
                  <AlertTriangle className="mr-2" size={18} />
                  {amountError}
                </div>
              )}
              <div className="text-sm text-gray-500 mt-2">
                * Minimum deposit: 50,000 VND <br />* Must be a multiple of
                10,000 VND
              </div>
            </div>

            {/* CCCD/Passport Section */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <CreditCard className="mr-2 text-blue-600" size={18} />
                CCCD/Passport
              </label>
              <Input
                type="text"
                {...form.register("cccdPassport", {
                  required: "Please enter your CCCD/Passport",
                  validate: (value) => value.trim() !== "" || "Cannot be empty",
                })}
                placeholder="Enter CCCD or Passport number"
                className="h-12 rounded-lg border-gray-300 focus:ring-blue-500 transition duration-200 ease-in-out"
              />
            </div>

            {/* Payment Method Section */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <Wallet className="mr-2 text-blue-600" size={18} />
                Payment Method
              </label>
              <Select
                defaultValue={form.getValues("paymentType")}
                onValueChange={(value) => form.setValue("paymentType", value)}
              >
                <SelectTrigger className="h-12 rounded-lg border-gray-300 focus:ring-blue-500 transition duration-200 ease-in-out">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Momo">MoMo</SelectItem>
                  <SelectItem value="VnPay">VnPay</SelectItem>
                  <SelectItem value="PayOS">PayOS</SelectItem>
                  <SelectItem value="ZaloPay">ZaloPay</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              className="h-11 px-5 text-gray-600 border-gray-300 hover:border-gray-400 transition duration-200 ease-in-out"
              onClick={() => {
                onOpenChange(false);
                form.reset();
                setAmountError(null);
                onAmountChange({
                  target: { value: "" },
                } as React.ChangeEvent<HTMLInputElement>);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!!amountError}
              className="h-11 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition duration-200 ease-in-out"
            >
              Confirm Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChargeMoneyDialog;
