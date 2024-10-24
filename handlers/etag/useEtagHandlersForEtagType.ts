// handlers/useEtagHandlers.ts
import { useState, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import {
  CustomerFormValues,
  EtagFormValues,
  GenerateEtag,
} from "@/lib/validation";
import {
  createOrder,
  deleteOrder,
} from "@/components/services/orderuserServices";
import { ETagServices } from "@/components/services/etagService";
import paymentService from "@/components/services/paymentService";

interface UseEtagHandlersProps {
  customerForm: UseFormReturn<CustomerFormValues>;
  etagForm: UseFormReturn<EtagFormValues>;
  etagInfo: {
    id: string;
    name: string;
    imageUrl: string;
  };
}

export const useEtagHandlers = ({
  customerForm,
  etagForm,
  etagInfo,
}: UseEtagHandlersProps) => {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isCustomerInfoConfirmed, setIsCustomerInfoConfirmed] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isEtagInfoConfirmed, setIsEtagInfoConfirmed] = useState(false);
  const [isCashPaymentConfirmed, setIsCashPaymentConfirmed] = useState(false);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [etagData, setEtagData] = useState<{
    startDate: Date;
    endDate: Date;
  } | null>(null);

  // Reset all states and local storage
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
        return true;
      } catch (err) {
        console.error("Error deleting order:", err);
        return false;
      }
    }
    return true;
  };

  const handleCancelEtag = () => {
    setIsEtagInfoConfirmed(false);
  };

  const handleCancelOrder = async () => {
    const deleteResult = await deleteExistingOrder();
    if (deleteResult) {
      resetAllStates();
      toast({
        title: "Order Cancelled",
        description: "Your order has been cancelled and deleted.",
      });
    } else {
      toast({
        title: "Warning",
        description:
          "Could not delete the order completely. Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  const handleCustomerInfoSubmit = async (data: CustomerFormValues) => {
    try {
      // Delete any existing order first
      await deleteExistingOrder();

      const orderData = {
        saleType: "EtagType",
        paymentType: data.paymentMethod,
        totalAmount: data.price * data.quantity,
        productData: [
          {
            id: etagInfo.id,
            name: etagInfo.name,
            price: data.price,
            imgUrl: etagInfo.imageUrl,
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

      if (response?.data?.orderId && response?.data?.invoiceId) {
        localStorage.setItem("orderId", response.data.orderId);
        localStorage.setItem("invoiceId", response.data.invoiceId);
        localStorage.setItem("etagTypeId", etagInfo.id);
        setOrderId(response.data.invoiceId);
        setIsCustomerInfoConfirmed(true);
      } else {
        throw new Error("Invalid order response");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unknown error occurred while creating the order"
      );
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });
    }
  };
  const handleAutoActivateEtag = async (
    etagId: string,
    customerData: CustomerFormValues,
    etagFormData: EtagFormValues
  ) => {
    try {
      const activateData = {
        cccd: customerData.cccd,
        name: customerData.customerName,
        phone: customerData.phoneNumber,
        gender: customerData.gender,
        birthday: new Date().toISOString(), // You might want to add a birthday field to your form
        startDate: etagFormData.etagStartDate,
        endDate: etagFormData.etagEndDate,
      };

      await ETagServices.activateEtag(etagId, activateData);

      toast({
        title: "Success",
        description: "E-Tag has been automatically activated.",
      });
    } catch (err) {
      console.error("Error in auto activation:", err);
      toast({
        title: "Warning",
        description:
          "E-Tag was generated but automatic activation failed. Please activate manually.",
        variant: "destructive",
      });
    }
  };

  const handleEtagSubmit = async (data: EtagFormValues) => {
    try {
      const etagTypeId = localStorage.getItem("etagTypeId");
      if (!etagTypeId) {
        throw new Error("ETag type ID not found");
      }

      const quantity = Number(customerForm.getValues("quantity"));
      const generateEtagData: GenerateEtag = {
        quantity,
        etagTypeId,
        generateEtagRequest: {
          startDate: new Date(data.etagStartDate),
          endDate: new Date(data.etagEndDate),
        },
      };

      const response = await ETagServices.generateEtag(generateEtagData);

      if (!response?.data) {
        throw new Error("Failed to generate E-Tag");
      }

      setEtagData({
        startDate: new Date(data.etagStartDate),
        endDate: new Date(data.etagEndDate),
      });

      if (quantity === 1 && response.data.data.etag?.id) {
        await handleAutoActivateEtag(
          response.data.data.etag.id,
          customerForm.getValues(),
          data
        );
      }

      if (response.data.data.listIdEtag?.length > 0) {
        localStorage.setItem(
          "etagList",
          JSON.stringify(response.data.data.listIdEtag)
        );
        localStorage.setItem("etag", response.data.data.id);
      } else if (response.data.data.etag?.id) {
        localStorage.setItem("etag", response.data.data.etag.id);
      } else {
        throw new Error("No ETag IDs received");
      }

      toast({
        title: "Success",
        description:
          quantity === 1
            ? "E-Tag generated and activated successfully!"
            : "E-Tags generated successfully!",
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
  const handleConfirmEtag = async () => {
    const isValid = await etagForm.trigger();
    if (!isValid) {
      const errors = etagForm.formState.errors;
      let errorMessage = "Please check the following:";
      if (errors.etagStartDate) errorMessage += "\n- Start Date is invalid";
      if (errors.etagEndDate) errorMessage += "\n- End Date is invalid";

      toast({
        title: "Validation Error",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    const startDate = new Date(etagForm.getValues("etagStartDate"));
    const endDate = new Date(etagForm.getValues("etagEndDate"));

    if (endDate <= startDate) {
      toast({
        title: "Validation Error",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }

    setIsEtagInfoConfirmed(true);
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
    error,
    isCustomerInfoConfirmed,
    isEtagInfoConfirmed,
    isCashPaymentConfirmed,
    isOrderConfirmed,
    etagData,
    handleCancelEtag,
    handleCancelOrder,
    handleCustomerInfoSubmit,
    handleEtagSubmit,
    handleConfirmEtag,
    handleConfirmOrder,
    resetAllStates,
  };
};
