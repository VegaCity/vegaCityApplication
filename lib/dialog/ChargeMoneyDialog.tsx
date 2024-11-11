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
      <DialogContent className="w-[600px] h-[500px] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-bold text-center">
            Charge Money
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit(onSubmit)(e);
          }}
        >
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 p-6 items-center">
            <label className="font-medium">Amount (đ)</label>
            <Input
              id="chargeAmount"
              type="text"
              value={formatAmount(amount)}
              onChange={onAmountChange}
              placeholder="0"
              className="w-full h-14 px-5 text-lg rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-right"
            />

            <label className="font-medium">CCCD/Passport</label>
            <Input type="text" {...form.register("cccdpassport")} readOnly />

            <label className="font-medium">Payment Type</label>
            <Select
              defaultValue={form.getValues("paymentType")}
              onValueChange={(value) => form.setValue("paymentType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Payment Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Momo">MoMo</SelectItem>
                <SelectItem value="VnPay">VnPay</SelectItem>
                <SelectItem value="PayOS">PayOs</SelectItem>
              </SelectContent>
            </Select>

            <label className="font-medium">Promotion Code</label>
            <Select
              value={form.getValues("promoCode")}
              onValueChange={(value) => form.setValue("promoCode", value)}
              disabled={isLoadingPromotions}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isLoadingPromotions ? "Loading..." : "Select promotion code"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no_promotion">No Promotion</SelectItem>
                {Array.isArray(promotions) &&
                  promotions.map((promotion) => (
                    <SelectItem
                      key={promotion.id}
                      value={promotion.promotionCode}
                    >
                      {promotion.promotionCode} - {promotion.description}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 mt-4 pr-6">
            <Button type="submit">Submit</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                form.reset();
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
