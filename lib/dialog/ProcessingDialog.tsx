import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ProcessingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isConfirming: boolean;
}

export const ProcessingDialog: React.FC<ProcessingDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  isConfirming,
}) => {
  const balance = localStorage.getItem("balance");
  const packageItemId = localStorage.getItem("packageItemIdCharge");
  const invoiceId = localStorage.getItem("invoiceId");
  const amountPay = localStorage.getItem("totalAmount");
  const customerName = localStorage.getItem("cusName");
  const discount = localStorage.getItem("discountAmount");
  const seller = localStorage.getItem("seller");

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value: string | null;
  }) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-100">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="font-medium text-sm">{value || "-"}</span>
    </div>
  );
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      currencyDisplay: "symbol",
    })
      .format(amount)
      .replace("₫", "đ");
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => onOpenChange(open)}>
      <AlertDialogContent className="max-w-2xl max-h-max rounded-lg overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-lg">
          <h2 className="text-2xl font-bold text-white mb-1">
            Order Processing
          </h2>
          <p className="text-blue-100 text-lg">Transaction Details</p>
        </div>

        <div className="p-4">
          <Card className="p-4 bg-gray-50 shadow-md">
            <InfoRow label="Seller" value={seller} />
            <InfoRow label="Balance" value={balance} />
            <InfoRow label="Package Item" value={packageItemId} />
            <InfoRow label="InvoiceId" value={invoiceId} />
            <InfoRow label="Customer" value={customerName} />

            <div className="mt-4 pt-4 border-t border-gray-200">
              <InfoRow
                label="Discount Amount"
                value={discount ? formatCurrency(+discount) : "$0"}
              />
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-900 font-semibold">
                  Total Amount
                </span>
                {amountPay && (
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(+amountPay)}
                  </span>
                )}
              </div>
            </div>
          </Card>

          <div className="mt-4 text-center text-sm text-gray-500">
            Please review the information before confirming
          </div>
        </div>

        <AlertDialogFooter className="p-4">
          <AlertDialogCancel className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded px-4 py-2">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isConfirming || !invoiceId}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2"
          >
            {isConfirming ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </div>
            ) : (
              "Confirm Payment"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ProcessingDialog;
