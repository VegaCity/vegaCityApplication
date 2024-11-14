import React from "react";
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
import { CreditCard, Wallet, Tag } from "lucide-react";

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
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          form.reset();
        }
      }}
    >
      <DialogContent className="w-[600px] h-[500px] max-w-3xl bg-white rounded-2xl shadow-xl">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl font-bold text-center text-gray-800">
            <Wallet className="inline-block mr-2 mb-1" size={28} />
            Charge Money
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit(onSubmit)(e);
          }}
          className="mt-6"
        >
          <div className="space-y-6 px-6">
            {/* Amount Input with larger size and better styling */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Amount (đ)
              </label>
              <Input
                id="chargeAmount"
                type="text"
                value={formatAmount(amount)}
                onChange={onAmountChange}
                placeholder="0"
                className="text-3xl font-medium h-16 text-right pr-4 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* CCCD/Passport with icon */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <CreditCard className="mr-2" size={18} />
                CCCD/Passport
              </label>
              <Input
                type="text"
                {...form.register("cccdpassport")}
                readOnly
                className="h-12 rounded-lg"
              />
            </div>

            {/* Payment Type with better styling */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <Wallet className="mr-2" size={18} />
                Payment Type
              </label>
              <Select
                defaultValue={form.getValues("paymentType")}
                onValueChange={(value) => form.setValue("paymentType", value)}
              >
                <SelectTrigger className="h-12 rounded-lg">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Momo">MoMo</SelectItem>
                  <SelectItem value="VnPay">VnPay</SelectItem>
                  <SelectItem value="PayOS">PayOs</SelectItem>
                  <SelectItem value="ZaloPay">ZaloPay</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Promotion Code with icon and loading state */}
            {/* <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <Tag className="mr-2" size={18} />
                Promotion Code
              </label>
              <Select
                value={form.getValues("promoCode")}
                onValueChange={(value) => form.setValue("promoCode", value)}
                disabled={isLoadingPromotions}
              >
                <SelectTrigger className="h-12 rounded-lg">
                  <SelectValue
                    placeholder={
                      isLoadingPromotions
                        ? "Loading promotions..."
                        : "Select promotion code"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_promotion" className="text-gray-500">
                    No Promotion
                  </SelectItem>
                  {Array.isArray(promotions) &&
                    promotions.map((promotion) => (
                      <SelectItem
                        key={promotion.id}
                        value={promotion.promotionCode}
                        className="py-3"
                      >
                        <div>
                          <div className="font-medium">
                            {promotion.promotionCode}
                          </div>
                          <div className="text-sm text-gray-500">
                            {promotion.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div> */}
          </div>

          {/* Action Buttons with gradient background */}
          <div className="mt-8 px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-11 px-6"
              onClick={() => {
                onOpenChange(false);
                form.reset();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-11 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium"
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
