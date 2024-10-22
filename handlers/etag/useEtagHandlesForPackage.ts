import { useCallback, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import {
  createOrder,
  deleteOrder,
} from "@/components/services/orderuserServices";
import { ETagServices } from "@/components/services/etagService";
import paymentService from "@/components/services/paymentService";
import {
  CustomerFormValues,
  EtagFormValues,
  GenerateEtag,
} from "@/lib/validation";

interface UseEtagHandlersProps {
  customerForm: UseFormReturn<CustomerFormValues>;
  etagForm: UseFormReturn<EtagFormValues>;
  packageData: any;
}

export const useEtagHandlers = ({
  customerForm,
  etagForm,
  packageData,
}: UseEtagHandlersProps) => {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isCustomerInfoConfirmed, setIsCustomerInfoConfirmed] = useState(false);
  const [isEtagInfoConfirmed, setIsEtagInfoConfirmed] = useState(false);
  const [isCashPaymentConfirmed, setIsCashPaymentConfirmed] = useState(false);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [etagData, setEtagData] = useState<{
    startDate: Date;
    endDate: Date;
  } | null>(null);
  const [cachedEtagFormData, setCachedEtagFormData] = useState({});
  const resetAllStates = useCallback(() => {
    setError(null);
    setIsCustomerInfoConfirmed(false);
    setOrderId(null);
    setIsEtagInfoConfirmed(false);
    setIsCashPaymentConfirmed(false);
    setIsOrderConfirmed(false);
    setEtagData(null);

    // Clear relevant localStorage items
    // localStorage.removeItem("orderId");
    // localStorage.removeItem("invoiceId");
    // localStorage.removeItem("etag");
    // localStorage.removeItem("etagList");
    // localStorage.removeItem("etagTypeId");

    // Reset forms
    customerForm.reset();
    etagForm.reset();
  }, [customerForm, etagForm]);
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
    await deleteExistingOrder();

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
          cccd: data.cccd,
        },
      };
      const response = await createOrder(orderData);

      localStorage.setItem("orderId", response.data.orderId);
      localStorage.setItem("invoiceId", response.data.invoiceId);

      setOrderId(response.data.invoiceId);
      setIsCustomerInfoConfirmed(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unknown error occurred while creating the order"
      );
    }
  };

  const handleEtagSubmit = async (data: EtagFormValues) => {
    try {
      const etagTypeId = localStorage.getItem("etagTypeId");
      if (!etagTypeId) {
        throw new Error("ETag type ID not found");
      }

      const generateEtagData: GenerateEtag = {
        quantity: Number(customerForm.getValues("quantity")),
        etagTypeId: etagTypeId,
        generateEtagRequest: {
          startDate: new Date(data.etagStartDate),
          endDate: new Date(data.etagEndDate),
        },
      };

      const response = await ETagServices.generateEtag(generateEtagData);

      if (!response?.data) {
        throw new Error("Failed to generate E-Tag");
      }

      // Store start and end dates
      setEtagData({
        startDate: new Date(data.etagStartDate),
        endDate: new Date(data.etagEndDate),
      });

      // Handle ETag IDs storage
      if (response.data.data.listIdEtag?.length > 0) {
        localStorage.setItem(
          "etagList",
          JSON.stringify(response.data.listIdEtag)
        );
        localStorage.setItem("etag", response.data.data.listIdEtag[0]);
      } else if (response.data.etag?.id) {
        localStorage.setItem("etag", response.data.data.etag.id);
      } else {
        throw new Error("No ETag IDs received");
      }

      toast({
        title: "Success",
        description: "E-Tag generated successfully!",
      });

      return true;
    } catch (err) {
      console.error("Error in handleEtagSubmit:", err);
      toast({
        title: "Error",
        description: "Failed to generate E-Tag. Please try again.",
        variant: "destructive",
      });
      return false;
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

  const handleConfirmEtag = async () => {
    const isValid = await etagForm.trigger();

    if (isValid) {
      setIsEtagInfoConfirmed(true);
      setCachedEtagFormData(etagForm.getValues());
      toast({
        title: "E-tag Information Confirmed",
        description: "You can now generate the E-tag.",
      });
    } else {
      const errors = etagForm.formState.errors;
      let errorMessage =
        "Please fill in all required E-tag information fields correctly:";
      if (errors.etagStartDate) errorMessage += " Start Date is invalid.";
      if (errors.etagEndDate) errorMessage += " End Date is invalid.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleCancelOrder = async () => {
    await deleteExistingOrder();
    setIsCustomerInfoConfirmed(false);
    setIsEtagInfoConfirmed(false);
    setIsCashPaymentConfirmed(false);
    customerForm.reset();
    etagForm.reset();
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
        const etagResult = await handleEtagSubmit(etagForm.getValues());
        if (etagResult) {
          setIsOrderConfirmed(true);
        }
      } else {
        // For other payment methods, handle both payment and etag generation
        const etagResult = await handleEtagSubmit(etagForm.getValues());
        if (etagResult) {
          await initiatePayment(paymentMethod, invoiceId);
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
    etagData,
    packageData,
    handleCustomerInfoSubmit,
    handleEtagSubmit,
    handleConfirmEtag,
    handleCancelOrder,
    handleConfirmOrder,
  };
};
