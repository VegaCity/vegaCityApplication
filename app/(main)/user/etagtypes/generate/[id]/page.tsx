"use client";
import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ETagTypeServices } from "@/components/services/etagtypeServices";
import { GenerateEtag } from "@/components/services/etagService";
import { ETagServices } from "@/components/services/etagService";
import BackButton from "@/components/BackButton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createOrder,
  confirmOrder,
  deleteOrder,
} from "@/components/services/orderuserServices";
import paymentService from "@/components/services/paymentService";
import { Card } from "@/components/ui/card";
import {
  customerFormSchema,
  etagFormSchema,
  CustomerFormValues,
  EtagFormValues,
  GenerateEtagProps,
} from "@/lib/validation";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(value);
};

const GenerateEtagById = ({ params }: GenerateEtagProps) => {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isCustomerInfoConfirmed, setIsCustomerInfoConfirmed] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isEtagInfoConfirmed, setIsEtagInfoConfirmed] = useState(false);
  const [cachedEtagFormData, setCachedEtagFormData] = useState({});
  const [isCashPaymentConfirmed, setIsCashPaymentConfirmed] = useState(false);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [endDate, setEndDate] = useState("");
  const [etagData, setEtagData] = useState<{
    startDate: Date;
    endDate: Date;
  } | null>(null);
  const deleteExistingOrder = async () => {
    const storedOrderId = localStorage.getItem("orderId");
    if (storedOrderId) {
      try {
        await deleteOrder(storedOrderId);
        localStorage.removeItem("orderId");
        localStorage.removeItem("invoiceId");
      } catch (err) {
        console.error("Error deleting order:", err);
      }
    }
  };
  const handleCancelEtag = () => {
    setIsEtagInfoConfirmed(false);
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
  const handleCustomerInfoSubmit = async (data: CustomerFormValues) => {
    setIsCustomerInfoConfirmed(true);
    try {
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
      localStorage.setItem("orderId", response.data.orderId);
      localStorage.setItem("invoiceId", response.data.invoiceId);
      setOrderId(response.data.invoiceId);
      toast({
        title: "Order Created",
        description: "Customer information confirmed and order created.",
      });
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
  const handleEtagSubmit = async (data: EtagFormValues) => {
    try {
      const generateEtagData: GenerateEtag = {
        quantity: Number(customerForm.getValues("quantity")),
        etagTypeId: localStorage.getItem("etagTypeId") || "",
        generateEtagRequest: {
          startDate: new Date(data.etagStartDate),
          endDate: new Date(data.etagEndDate),
        },
      };
      const response = await ETagServices.generateEtag(generateEtagData);
      if (response.data) {
        setEtagData({
          startDate: new Date(data.etagStartDate),
          endDate: new Date(data.etagEndDate),
        });
        localStorage.setItem("etag", response.data.etag.id);
        toast({
          title: "E-Tag generated successfully",
          description: `E-Tag for ${etagInfo.name} has been generated.`,
        });
        return true;
      } else {
        throw new Error("Failed to generate E-Tag");
      }
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
      const confirmData = {
        invoiceId: invoiceId,
        etagTypeId: localStorage.getItem("etagTypeId") || "",
        generateEtagRequest: {
          startDate: new Date(etagForm.getValues("etagStartDate")),
          endDate: new Date(etagForm.getValues("etagEndDate")),
        },
      };

      if (paymentMethod === "Cash") {
        // await confirmOrder(confirmData);
        setIsOrderConfirmed(true);
        toast({
          title: "Order Confirmed",
          description: "Your cash order has been successfully confirmed.",
        });

        // Generate E-tag after confirming cash payment
        const etagGenerated = await handleEtagSubmit(etagForm.getValues());
        if (!etagGenerated) {
          toast({
            title: "Warning",
            description:
              "Order confirmed, but failed to generate E-Tag. Please contact support.",
          });
        }
      } else if (
        paymentMethod === "Momo" ||
        paymentMethod === "VnPay" ||
        paymentMethod === "PayOS"
      ) {
        try {
          // Initiate payment first
          await initiatePayment(paymentMethod, invoiceId);

          // After successful payment, generate E-tag
          const etagGenerated = await handleEtagSubmit(etagForm.getValues());
          if (!etagGenerated) {
            toast({
              title: "Warning",
              description:
                "Payment successful, but failed to generate E-Tag. Please contact support.",
            });
          } else {
            toast({
              title: "Success",
              description: `${paymentMethod} payment successful and E-Tag generated.`,
            });
          }
        } catch (paymentError) {
          console.error("Payment initiation error:", paymentError);
          toast({
            title: "Payment Error",
            description: `Failed to process ${paymentMethod} payment. Please try again.`,
            variant: "destructive",
          });
        }
      } else {
        throw new Error("Invalid payment method");
      }
    } catch (err) {
      console.error("Error confirming order:", err);
      toast({
        title: "Error",
        description: "Failed to confirm order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const initiatePayment = async (paymentMethod: string, invoiceId: string) => {
    try {
      console.log(
        `Initiating ${paymentMethod} payment for invoice ${invoiceId}`
      );

      let paymentResponse;

      if (paymentMethod === "Momo") {
        paymentResponse = await paymentService.momo({ invoiceId });
      } else if (paymentMethod === "VnPay") {
        paymentResponse = await paymentService.vnpay({ invoiceId });
      } else if (paymentMethod === "PayOS") {
        paymentResponse = await paymentService.payos({ invoiceId });
      } else {
        throw new Error("Invalid payment method");
      }

      console.log(
        "Raw payment response:",
        JSON.stringify(paymentResponse, null, 2)
      );

      if (paymentResponse && paymentResponse.statusCode === 200) {
        if (paymentMethod === "Momo") {
          console.log("Handling MoMo response");
          const momoData = paymentResponse.data;
          if (momoData.payUrl) {
            console.log("Redirecting to payUrl:", momoData.payUrl);
            window.location.href = momoData.payUrl;
          } else if (momoData.shortLink) {
            console.log("Redirecting to shortLink:", momoData.shortLink);
            window.location.href = momoData.shortLink;
          } else {
            console.error("MoMo payment URL not found in the response");
            throw new Error("MoMo payment URL not found in the response");
          }
        } else if (paymentMethod === "VnPay") {
          console.log("Handling VNPay response");
          if (paymentResponse.data.vnPayResponse) {
            console.log(
              "Redirecting to VNPay URL:",
              paymentResponse.data.vnPayResponse
            );
            window.location.href = paymentResponse.data.vnPayResponse;
          } else {
            console.error("VNPay payment URL not found in the response");
            throw new Error("VNPay payment URL not found in the response");
          }
        } else if (paymentMethod === "PayOS") {
          console.log("Handling PayOS response");
          const payosData = paymentResponse.data;
          if (payosData.checkoutUrl) {
            console.log(
              "Redirecting to PayOS checkout URL:",
              payosData.checkoutUrl
            );
            window.location.href = payosData.checkoutUrl;
          } else {
            console.error("PayOS checkout URL not found in the response");
            throw new Error("PayOS checkout URL not found in the response");
          }
        }
      } else {
        console.error("Invalid payment response structure or status code");
        throw new Error("Invalid payment response structure or status code");
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast({
        title: "Payment Error",
        description: `Failed to initiate ${paymentMethod} payment. Please try again.`,
        variant: "destructive",
      });
      throw error;
    }
  };

  const customerForm = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      customerName: "",
      phoneNumber: "",
      address: "",
      cccd: "",
      paymentMethod: "Cash",
      gender: "male",
      quantity: 1,
      price: 0,
    },
  });

  const etagForm = useForm<EtagFormValues>({
    resolver: zodResolver(etagFormSchema),
    defaultValues: {
      etagStartDate: new Date().toISOString().split("T")[0],
      etagEndDate: new Date().toISOString().split("T")[0],
    },
    mode: "all",
  });
  useEffect(() => {
    const validateForm = async () => {
      await etagForm.trigger();
    };
    validateForm();
  }, [endDate, etagForm]);

  useEffect(() => {
    const { etagStartDate, etagEndDate } = etagForm.watch();
    if (etagStartDate && etagEndDate) {
      const start = new Date(etagStartDate);
      const end = new Date(etagEndDate);
    }
  }, [etagForm.watch("etagStartDate"), etagForm.watch("etagEndDate")]);
  const [isLoading, setIsLoading] = useState(true);
  const [etagInfo, setEtagInfo] = useState({
    id: "",
    name: "",
    bonusRate: 0,
    amount: 0,
    imageUrl: "",
  });
  useEffect(() => {
    const fetchEtagData = async () => {
      try {
        const response = await ETagTypeServices.getETagTypeById(params.id);
        const etagData = response.data.data.etagType;
        console.log("E-Tag Data:", etagData);
        if (etagData) {
          setEtagInfo({
            id: etagData.id,
            name: etagData.name,
            bonusRate: etagData.bonusRate,
            amount: etagData.amount,
            imageUrl: etagData.imageUrl || "/path/to/placeholder-image.jpg",
          });
        } else {
          setError("No E-Tag data found");
        }
      } catch (err) {
        console.error("Error fetching E-Tag data:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchEtagData();
  }, [params.id]);

  if (isLoading) return <div className="text-center p-4">Loading...</div>;
  if (error)
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <BackButton text="Back To E-Tag Types" link="/user/etagtypes" />
      <h3 className="text-2xl font-bold mb-6">
        Generate E-Tag for {etagInfo.name}
      </h3>
      <div className="mb-8 flex justify-center">
        <Card className="overflow-hidden w-full px-4 max-w-4xl">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2">
              <img
                src={etagInfo.imageUrl}
                alt={etagInfo.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:w-1/2 p-8 flex flex-col justify-center">
              <h2 className="text-2xl font-semibold mb-2">{etagInfo.name}</h2>
              <p className="text-xl font-bold text-green-600 mb-2">
                {formatCurrency(etagInfo.amount)}
              </p>
              <p className="text-sm text-gray-600">
                Bonus Rate:
                <span className="font-semibold text-red-500">
                  {etagInfo.bonusRate}%
                </span>
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="container mx-auto px-4 w-full max-w-5xl">
        <Form {...customerForm}>
          <form
            onSubmit={customerForm.handleSubmit(handleCustomerInfoSubmit)}
            className="space-y-6"
          >
            <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-14 text-center">
                Thông Tin Khách Hàng
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={customerForm.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium dark:text-gray-300">
                        Họ và Tên
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white"
                          placeholder="Nhập họ và tên"
                          {...field}
                          disabled={isCustomerInfoConfirmed}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={customerForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Số điện thoại
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white"
                          placeholder="Nhập số điện thoại"
                          {...field}
                          disabled={isCustomerInfoConfirmed}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={customerForm.control}
                  name="cccd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        CCCD:
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white"
                          placeholder="Nhập CCCD"
                          {...field}
                          disabled={isCustomerInfoConfirmed}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={customerForm.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Giới tính
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isCustomerInfoConfirmed}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn giới tính" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Nam</SelectItem>
                          <SelectItem value="female">Nữ</SelectItem>
                          <SelectItem value="other">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={customerForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Số lượng
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white"
                          disabled={isCustomerInfoConfirmed}
                          onChange={(e) => {
                            field.onChange(e.target.valueAsNumber);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={customerForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Giá tiền
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          {...field}
                          className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white"
                          disabled={isCustomerInfoConfirmed}
                          value={field.value?.toLocaleString("en-US")}
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(/,/g, "");
                            const numericValue = parseFloat(rawValue) || 0;

                            field.onChange(numericValue);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={customerForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Địa chỉ
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white"
                          placeholder="Nhập địa chỉ"
                          {...field}
                          disabled={isCustomerInfoConfirmed}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={customerForm.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phương thức Thanh Toán
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isCustomerInfoConfirmed}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Cash">Tiền mặt</SelectItem>
                          <SelectItem value="Momo">Momo</SelectItem>
                          <SelectItem value="VnPay">VNPay</SelectItem>
                          <SelectItem value="PayOS">PayOs</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="flex justify-end">
              {!isCustomerInfoConfirmed && (
                <Button type="submit">Confirm Information</Button>
              )}
            </div>
          </form>
        </Form>
      </div>
      {isCustomerInfoConfirmed && (
        <div className="container mx-auto px-4 w-full max-w-5xl">
          <Form {...etagForm}>
            <form
              onSubmit={(e) => {
                etagForm.handleSubmit(handleEtagSubmit)(e);
              }}
              className="space-y-6 mt-8"
            >
              <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-12 text-center">
                  Thông Tin ETag
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={etagForm.control}
                    name="etagStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Ngày Bắt Đầu
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={etagForm.control}
                    name="etagEndDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Ngày Kết Thúc
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                            value={endDate || field.value || ""}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              setEndDate(newValue);
                              field.onChange(newValue);
                            }}
                            onBlur={() => {
                              field.onBlur();
                              etagForm.trigger("etagEndDate");
                            }}
                            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                {!isEtagInfoConfirmed ? (
                  <>
                    <Button type="button" onClick={handleCancelEtag}>
                      Cancel
                    </Button>
                    <Button type="button" onClick={handleConfirmEtag}>
                      Confirm E-tag Information
                    </Button>
                  </>
                ) : !isOrderConfirmed ? (
                  <>
                    <Button type="button" onClick={handleCancelOrder}>
                      Cancel Order
                    </Button>
                    <Button type="button" onClick={handleConfirmOrder}>
                      Confirm Order
                    </Button>
                  </>
                ) : (
                  <>
                    <Button type="submit">Generate E-Tag</Button>
                  </>
                )}
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
};
export default GenerateEtagById;
