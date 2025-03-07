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
} from "@/components/services/Package/packageItemService";
import paymentService from "@/components/services/paymentService";
import {
  CustomerFormValues,
  EtagFormValues,
  GenerateEtag,
} from "@/lib/validation";
import { useRouter, useSearchParams } from "next/navigation";
import { VCardCustomerInfo } from "@/types/paymentFlow/orderUser";
interface UseEtagHandlersProps {
  customerForm: UseFormReturn<CustomerFormValues>;
  packageData: any;
  setShowTimer: any;
}

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
        totalAmount: data.price,
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
          cccdPassport: data.cccdPassport,
          email: data.email,
        },
      };
      const response = await createOrder(orderData);

      localStorage.setItem("orderId", response.data.orderId);
      localStorage.setItem("invoiceId", response.data.invoiceId);
      localStorage.setItem("transactionId", response.data.transactionId);
      localStorage.setItem("packageOrderId", response.data.packageOrderId);
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
  const searchParams = useSearchParams();
  const isAdultParam = searchParams.get("isAdult");

  const handleGenerateVCardForAdult = async (
    quantity: number,
    customerInfo: any
  ) => {
    try {
      const response = await PackageItemServices.generatePackageItem({
        quantity,
        packageId: packageData.id,
        cusName: customerInfo.fullName,
        cusEmail: customerInfo.email,
        cusCccdpassport: customerInfo.cccdPassport,
        phoneNumber: customerInfo.phoneNumber,
      });

      if (response.status === 201) {
        const vcardData = response.data;
        const paymentMethod = customerForm.getValues("paymentMethod");

        if (paymentMethod.toLowerCase() === "cash") {
          toast({
            title: "Success",
            description: "VCard generated successfully.",
          });
          setTimeout(() => {
            router.push("/user/package-items");
          }, 2000);
        } else {
          router.push("/user/package-items");
        }
      } else {
        throw new Error(
          `Failed to generate VCard for adult. Status code: ${response.status}`
        );
      }
    } catch (error) {
      console.error("Error generating VCard for adult:", error);
      toast({
        title: "Error",
        description: "Failed to generate VCard for adult. Please try again.",
      });
    }
  };

  const handleGenerateVCardForMinor = async (
    quantity: number,
    customerInfo: any
  ) => {
    try {
      const response = await PackageItemServices.generatePackageItemForChild({
        quantity,
        packageId: packageData.packageId,
        cusName: customerInfo.fullName,
        packageOrderId: localStorage.getItem("packageItemId") || "",
      });

      if (response.status === 201) {
        const vcardData = response.data;
        const paymentMethod = customerForm.getValues("paymentMethod");

        if (paymentMethod.toLowerCase() === "cash") {
          toast({
            title: "Success",
            description: "VCard generated successfully.",
          });
          setTimeout(() => {
            router.push("/user/package-items");
          });
        } else {
          router.push("/user/package-items");
        }
      } else {
        throw new Error(
          `Failed to generate VCard for minor. Status code: ${response.status}`
        );
      }
    } catch (error) {
      console.error("Error generating VCard for minor:", error);
      toast({
        title: "Error",
        description: "Failed to generate VCard for minor. Please try again.",
      });
    }
  };
  const initiatePayment = async (
    paymentMethod: string,
    invoiceId: string
    // key: string,
    // urlDirect: string,
    // urlIpn: string
  ) => {
    try {
      let paymentResponse;

      switch (paymentMethod.toLowerCase()) {
        case "momo":
          paymentResponse = await paymentService.momo({
            invoiceId,
            // key,
            // urlDirect,
            // urlIpn,
          });
          break;
        case "vnpay":
          paymentResponse = await paymentService.vnpay({
            invoiceId,
            // key,
            // urlDirect,
            // urlIpn,
          });
          break;
        case "payos":
          paymentResponse = await paymentService.payos({
            invoiceId,
            // key,
            // urlDirect,
            // urlIpn,
          });
          break;
        case "zalopay":
          paymentResponse = await paymentService.zalopay({
            invoiceId,
            // key,
            // urlDirect,
            // urlIpn,
          });
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
    window.location.reload();
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
    const quantity = customerForm.getValues("quantity");
    const customerInfo = customerForm.getValues();

    // Ensure quantity is between 1 and 5 for minor vCard generation
    if (isAdultParam === "true" && (quantity < 1 || quantity > 5)) {
      toast({
        title: "Error",
        description:
          "Quantity must be between 1 and 5 for minor vCard generation.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (paymentMethod.toLowerCase() === "cash") {
        const confirmResult = await confirmOrderForCharge({
          invoiceId,
          transactionId: localStorage.getItem("transactionId") || "",
        });

        if (confirmResult) {
          setIsOrderConfirmed(true);

          try {
            if (isAdultParam === "true") {
              await handleGenerateVCardForMinor(quantity, {
                fullName: customerInfo.customerName,
                email: customerInfo.email,
                cccdPassport: customerInfo.cccdPassport,
                phoneNumber: customerInfo.phoneNumber,
                packageOrderId: localStorage.getItem("packageOrderId"),
              });
            } else {
              await handleGenerateVCardForAdult(quantity, {
                fullName: customerInfo.customerName,
                email: customerInfo.email,
                cccdPassport: customerInfo.cccdPassport,
                phoneNumber: customerInfo.phoneNumber,
              });
            }
          } catch (generateError) {
            console.error("Error generating vCard:", generateError);
            toast({
              title: "Warning",
              description:
                "Payment confirmed but failed to generate vCard. Please contact support.",
              variant: "destructive",
            });
          }
        }
      } else {
        await initiatePayment(paymentMethod, invoiceId);

        if (isAdultParam === "true") {
          await handleGenerateVCardForMinor(quantity, {
            fullName: customerInfo.customerName,
            email: customerInfo.email,
            cccdPassport: customerInfo.cccdPassport,
            phoneNumber: customerInfo.phoneNumber,
            packageOrderId: localStorage.getItem("packageOrderId"),
          });
        } else {
          await handleGenerateVCardForAdult(quantity, {
            fullName: customerInfo.customerName,
            email: customerInfo.email,
            cccdPassport: customerInfo.cccdPassport,
            phoneNumber: customerInfo.phoneNumber,
          });
        }
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
    customerForm,
    handleCancelOrder,
    handleConfirmOrder,
  };
};
