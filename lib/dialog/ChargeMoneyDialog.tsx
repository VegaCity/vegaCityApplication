import React, { useState, useEffect } from "react";
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
import {
  CreditCard,
  Wallet,
  AlertTriangle,
  Gift,
  ChevronRight,
  X,
} from "lucide-react";
import { PromotionServices } from "@/components/services/Promotion/promotionServices";

interface ChargeMoneyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<any>;
  onSubmit: (data: any) => void;
  amount: string;
  onAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formatAmount: (value: string) => string;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const ChargeMoneyDialog: React.FC<ChargeMoneyDialogProps> = ({
  isOpen,
  onOpenChange,
  form,
  onSubmit,
  amount,
  onAmountChange,
  formatAmount,
}) => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [amountError, setAmountError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPromotions = async () => {
      if (!isOpen) return;
      try {
        setLoading(true);
        const response = await PromotionServices.getPromotions({
          page: 1,
          size: 10,
        });
        if (response.data?.data) {
          const activePromotions = response.data.data.filter(
            (promotion: Promotion) => promotion.status === 3
          );
          setPromotions(activePromotions);
        }
      } catch (error) {
        console.error("Error fetching promotions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, [isOpen]);

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
    if (numericAmount > 5000000) {
      setAmountError("Maximum deposit is 5,000,000 VND");
      return false;
    }
    setAmountError(null);
    return true;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d]/g, "");

    // Giới hạn số tiền tối đa là 5,000,000
    const numericAmount = parseInt(value, 10);
    if (numericAmount > 5000000) {
      value = "5000000";
    }

    // Tạo một event mới với giá trị đã được xử lý
    const newEvent = {
      ...e,
      target: {
        ...e.target,
        value: value,
      },
    };

    onAmountChange(newEvent);
    validateAmount(value);
  };
  const formatDisplayAmount = (value: string): string => {
    const numericValue = parseInt(value.replace(/[^\d]/g, ""), 10);
    if (isNaN(numericValue)) return "";
    if (numericValue > 5000000) return "5,000,000";
    return new Intl.NumberFormat("vi-VN").format(numericValue);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAmount(amount)) {
      form.handleSubmit(onSubmit)(e);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      onAmountChange({
        target: { value: "0" },
      } as React.ChangeEvent<HTMLInputElement>);
      form.reset();
      setAmountError(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="w-full max-h-[85vh] overflow-y-auto bg-white rounded-xl shadow-lg">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl font-semibold text-center text-blue-800">
            <Wallet
              className="inline-block mr-2 mb-1 text-blue-700"
              size={28}
            />
            Charge Money
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 px-2 ml-4">
          <div className="flex items-center text-blue-700 font-medium mb-1">
            <Gift className="mr-2" size={20} />
            Active Promotions
          </div>

          <div className="flex overflow-x-auto space-x-2 pb-1/100">
            {promotions.map((promotion) => (
              <div
                key={promotion.id}
                className="flex-shrink-0 w-64 p-4 rounded-lg bg-gray-50 border border-gray-200"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-blue-800 text-sm">
                    {promotion.name}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {promotion.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-2 px-8">
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
                * Minimum deposit: 50,000 VND <br />
                * Maximum deposit: 5,000,000 VND <br />* Must be a multiple of
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
                readOnly
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
              onClick={() => handleDialogClose(false)}
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
