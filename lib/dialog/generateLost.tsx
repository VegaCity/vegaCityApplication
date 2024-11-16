import React, { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PackageItemServices } from "@/components/services/packageItemService";
import { useToast } from "@/components/ui/use-toast";
import {
  confirmOrderForCharge,
  confirmOrderForGenerateNewVCard,
} from "@/components/services/orderuserServices";
import axios, { AxiosResponse } from "axios";
interface PackageItem {
  id: string;
  packageId: string;
  cusCccdpassport: string | null;
  cusEmail: string | null;
  cusName: string | null;
  phoneNumber: string | null;
  rfid: string | null;
  status: string;
}
interface GeneratePackageItemResponse {
  statusCode: number;
  messageResponse: string;
  data: {
    packageItemIIId: string;
    invoiceId: string;
    transactionId: string;
  };
  parentName: null;
}
interface GenerateNewCardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  packageItem: PackageItem | null;
}

const GenerateNewCardDialog = ({
  isOpen,
  onClose,
  onSuccess,
  packageItem,
}: GenerateNewCardDialogProps) => {
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const [formData, setFormData] = useState({
    packageItemId: "",
    cccdpassport: "",
    name: "",
    phoneNumber: "",
    rfid: "",
    email: "",
    reason: "",
  });

  useEffect(() => {
    if (packageItem) {
      setFormData({
        packageItemId: packageItem.id,
        cccdpassport: packageItem.cusCccdpassport || "",
        name: packageItem.cusName || "",
        phoneNumber: packageItem.phoneNumber || "",
        email: packageItem.cusEmail || "",
        rfid: packageItem.rfid || "",
        reason: "",
      });
    }
  }, [packageItem]);

  const handleConfirmPayment = async () => {
    try {
      const invoiceId = localStorage.getItem("invoiceId");
      const transactionId = localStorage.getItem("transactionId");

      if (!invoiceId || !transactionId) {
        throw new Error("Missing payment information");
      }

      const confirmData = {
        invoiceId,
        transactionId,
      };

      await confirmOrderForGenerateNewVCard(confirmData);

      toast({
        title: "Success",
        description: "Payment completed successfully",
        variant: "default",
      });

      // Clear localStorage after successful payment
      localStorage.removeItem("newInvoiceId");
      localStorage.removeItem("transactionId");
      localStorage.removeItem("transactionChargeId");

      setShowPaymentDialog(false);
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payment",
        variant: "destructive",
      });
    }
  };
  const walletBalance: number = parseFloat(
    localStorage.getItem("walletBalance") || "0"
  );
  console.log(walletBalance, "walletBalance");
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await PackageItemServices.generatePackageItemLost(
        quantity
      );

      if (response.data.statusCode === 200) {
        if (
          response.data.messageResponse.includes(
            "Successfully Create New PackageItem , proceed Pay to Active!!"
          )
        ) {
          // Case 2: Cần thanh toán để kích hoạt
          console.log(response.data);
          localStorage.setItem("invoiceId", response.data.data.invoiceId);
          localStorage.setItem(
            "transactionId",
            response.data.data.transactionId
          );

          toast({
            title: "Payment Required",
            description:
              "Your balance is insufficient. Please proceed with the payment of 50,000 VND",
          });
          setShowPaymentDialog(true);
        } else {
          // Case 1: Tạo thành công và không cần thanh toán thêm
          toast({
            title: "Success",
            description: `Successfully generated ${quantity} new card(s)`,
            variant: "default",
          });
          onSuccess();
          onClose();
        }
      }
    } catch (error) {
      console.error("Error generating new card:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate new card",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <AlertDialog open={isOpen} onOpenChange={onClose}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold">
              Generate New Card
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500">
              Generate a new card to replace the lost one
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                max="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, Number(e.target.value)))
                }
                className="h-9"
                placeholder="Enter quantity"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="h-9">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              className="h-9 bg-blue-500 hover:bg-blue-600"
              disabled={isLoading || !!error}
            >
              {isLoading ? "Generating..." : "Generate New Card"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Payment Required</AlertDialogTitle>
            <AlertDialogDescription>
              Your balance is insufficient to complete this transaction. A
              payment of 50,000 VND is required to proceed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPayment}>
              Proceed to Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default GenerateNewCardDialog;
