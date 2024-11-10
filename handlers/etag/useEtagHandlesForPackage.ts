import { useCallback, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import {
  confirmOrder,
  confirmOrderForCharge,
  createOrder,
  deleteOrder,
} from "@/components/services/orderuserServices";
import {
  PackageItemServices,
  GeneratePackageItem,
} from "@/components/services/packageItemService";
import paymentService from "@/components/services/paymentService";
import {
  CustomerFormValues,
  EtagFormValues,
  GenerateEtag,
} from "@/lib/validation";

interface UseEtagHandlersProps {
  customerForm: UseFormReturn<CustomerFormValues>;
  packageData: any;
  setShowTimer: any;
}
import { useRouter } from "next/navigation";
export const useEtagHandlers = ({
  customerForm,
  packageData,
  setShowTimer,
}: UseEtagHandlersProps) => {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isCustomerInfoConfirmed, setIsCustomerInfoConfirmed] = useState(false);
  const [isEtagInfoConfirmed, setIsEtagInfoConfirmed] = useState(false);
  const [isCashPaymentConfirmed, setIsCashPaymentConfirmed] = useState(false);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const router = useRouter();

  const [cachedEtagFormData, setCachedEtagFormData] = useState({});
  const resetAllStates = useCallback(() => {
    setError(null);
    setIsCustomerInfoConfirmed(false);
    setOrderId(null);
    setIsEtagInfoConfirmed(false);
    setIsCashPaymentConfirmed(false);
    setIsOrderConfirmed(false);

    // Clear relevant localStorage items
    // localStorage.removeItem("orderId");
    // localStorage.removeItem("invoiceId");
    // localStorage.removeItem("etag");
    // localStorage.removeItem("etagList");
    // localStorage.removeItem("etagTypeId");

    // Reset forms
    customerForm.reset();
  }, [customerForm]);
  const deleteExistingOrder = async () => {
    const storedOrderId = localStorage.getItem("orderId");
    if (storedOrderId) {
      try {
        await deleteOrder(storedOrderId);
        localStorage.removeItem("orderId");
        localStorage.removeItem("invoiceId");
        toast({
          title: "Order Deleted",
          description: "The existing order has been successfully deleted.",
        });
      } catch (err) {
        console.error("Error deleting order:", err);
        toast({
          title: "Error",
          description: "Failed to delete the existing order. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCustomerInfoSubmit = async (data: CustomerFormValues) => {
    // await deleteExistingOrder();

    try {
      const orderData = {
        saleType: "Package",
        paymentType: data.paymentMethod,
        totalAmount: data.price * data.quantity,
        productData: [
          {
            id: packageData.id,
            name: packageData.name,
            price: data.price,
            imgUrl: packageData.imageUrl,
            quantity: data.quantity,
          },
        ],
        customerInfo: {
          fullName: data.customerName,
          phoneNumber: data.phoneNumber,
          address: data.address,
          gender: data.gender,
          cccdPassport: data.cccdpassport,
          email: data.email,
        },
      };
      const response = await createOrder(orderData);

      localStorage.setItem("orderId", response.data.orderId);
      localStorage.setItem("invoiceId", response.data.invoiceId);
      localStorage.setItem("transactionId", response.data.transactionId);
      setOrderId(response.data.invoiceId);
      setShowTimer(true);
      setIsCustomerInfoConfirmed(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unknown error occurred while creating the order"
      );
    }
  };
  const handleGenerateChildrenVCard = async () => {
    // Generate Children VCard
  };
  const handleGenerateVCard = async (quantity: number) => {
    try {
      const packageId = localStorage.getItem("packageId") || "";
      const response = await PackageItemServices.generatePackageItem(quantity);

      if (response.status === 201) {
        const vcardData = response.data;
        // Process the vcardData as needed
        // toast.success('VCard generated successfully.');
        toast({
          title: "Success",
          description: "VCard generated successfully.",
        });
        setTimeout(() => {
          router.push("/user/package-items");
        }, 3000);
      } else {
        throw new Error(
          `Failed to generate VCard. Status code: ${response.status}`
        );
      }
    } catch (error) {
      console.error("Error generating VCard:", error);
      toast({
        title: "Error",
        description: "Failed to generate VCard. Please try again.",
      });
      // toast.error('Failed to generate VCard. Please try again.');
    }
  };
  const initiatePayment = async (paymentMethod: string, invoiceId: string) => {
    try {
      let paymentResponse;

      switch (paymentMethod.toLowerCase()) {
        case "momo":
          paymentResponse = await paymentService.momo({ invoiceId });
          break;
        case "vnpay":
          paymentResponse = await paymentService.vnpay({ invoiceId });
          break;
        case "payos":
          paymentResponse = await paymentService.payos({ invoiceId });
          break;
        case "zalopay":
          paymentResponse = await paymentService.zalopay({ invoiceId });
          break;
        default:
          throw new Error(`Unsupported payment method: ${paymentMethod}`);
      }

      if (paymentResponse?.statusCode !== 200) {
        throw new Error("Payment service returned non-200 status");
      }

      const paymentUrl = getPaymentUrl(paymentMethod, paymentResponse.data);
      if (!paymentUrl) {
        throw new Error("Payment URL not found in response");
      }

      // Navigate to payment URL
      window.location.href = paymentUrl;
      return true;
    } catch (error) {
      console.error("Payment initiation error:", error);
      throw error;
    }
  };

  const getPaymentUrl = (method: string, data: any): string | null => {
    if (!data) return null;

    switch (method.toLowerCase()) {
      case "momo":
        return data.payUrl || data.shortLink;
      case "vnpay":
        return data.vnPayResponse;
      case "payos":
        return data.checkoutUrl;
      case "zalopay":
        return data.order_url;
      default:
        return null;
    }
  };

  const handleCancelOrder = async () => {
    await deleteExistingOrder();
    setIsCustomerInfoConfirmed(false);
    setIsEtagInfoConfirmed(false);
    setIsCashPaymentConfirmed(false);
    customerForm.reset();
    setOrderId(null);
    toast({
      title: "Order Cancelled",
      description: "Your order has been cancelled and deleted.",
    });
  };

  const handleConfirmOrder = async () => {
    const invoiceId = localStorage.getItem("invoiceId");
    if (!invoiceId) {
      toast({
        title: "Error",
        description: "Invoice ID not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const paymentMethod = customerForm.getValues("paymentMethod");

    try {
      if (paymentMethod.toLowerCase() === "cash") {
        confirmOrderForCharge({
          invoiceId: localStorage.getItem("invoiceId") || "",
          transactionId: localStorage.getItem("transactionId") || "",
          transactionChargeId:
            localStorage.getItem("transactionChargeId") || "",
        });
        setIsOrderConfirmed(true);
        await handleGenerateVCard(customerForm.getValues("quantity"));
      } else {
        await initiatePayment(paymentMethod, invoiceId);
        await handleGenerateVCard(customerForm.getValues("quantity"));
      }
    } catch (err) {
      console.error("Error in order confirmation:", err);
      toast({
        title: "Error",
        description: "Failed to process order. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    isCustomerInfoConfirmed,
    isEtagInfoConfirmed,
    isCashPaymentConfirmed,
    isOrderConfirmed,
    orderId,
    packageData,
    handleCustomerInfoSubmit,
    handleGenerateVCard,
    customerForm,
    handleCancelOrder,
    handleConfirmOrder,
  };
};
