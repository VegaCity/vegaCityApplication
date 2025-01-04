"use client";
import BackButton from "@/components/BackButton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  FormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { PackageItemServices } from "@/components/services/Package/packageItemService";
import { PackageItem } from "@/types/packageitem";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import paymentService from "@/components/services/paymentService";
import {
  formSchema,
  FormValues,
  customerFormSchema,
  PackageItemDetailPageProps,
  CustomerFormValues,
} from "@/lib/validation";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  confirmOrder,
  confirmOrderForCharge,
  confirmOrderForChargeVCard,
  GetOrdersById,
} from "@/components/services/orderuserServices";
import { AlertDialogAction } from "@radix-ui/react-alert-dialog";
import { ConfirmOrderData } from "@/types/paymentFlow/orderUser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PromotionServices } from "@/components/services/Promotion/promotionServices";
import { Promotion } from "@/types/promotion/Promotion";
import { GenerateChildrenVCardDialog } from "@/lib/dialog/GenerateChildrenVCardDialog";
import { ChargeMoneyDialog } from "@/lib/dialog/ChargeMoneyDialog";
import { ProcessingDialog } from "@/lib/dialog/ProcessingDialog";
import { QRCodeDialog } from "@/lib/dialog/QRCodeDialog";
import { UpdateRFIDAlertDialog } from "@/lib/dialog/UpdateRFIDDialog";
import { useRouter, usePathname } from "next/navigation";
import CustomerStatusField from "@/components/field/customerField";
import { Loader } from "@/components/loader/Loader";
import { decryptId, encryptId } from "@/utils/encryption";
import { formatVNDCurrencyValue } from "@/lib/utils/formatVNDCurrency";

const PackageItemDetailPage = ({ params }: PackageItemDetailPageProps) => {
  const { toast } = useToast();
  const [packageItem, setPackageItem] = useState<PackageItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  //Loading Statew
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isDoneUpsRFID, setIsDoneUpsRFID] = useState(false);
  const [isConfirmPayment, setIsConfirmPayment] = useState(false);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isProcessingPopupOpen, setIsProcessingPopupOpen] = useState(false);
  const [shouldShowAlertDialog, setShouldShowAlertDialog] = useState(false);
  const [pendingInvoiceId, setPendingInvoiceId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(false);
  const [promotionError, setPromotionError] = useState<string | null>(null);
  const [isUpdateRFIDDialogOpen, setIsUpdateRFIDDialogOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [isChildrenVCardDialogOpen, setIsChildrenVCardDialogOpen] =
    useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const childrenVCardForm = useForm({
    defaultValues: {
      quantity: 1,
      packageItemId: "",
    },
  });

  const handleUpdateRFID = async (rfid: string) => {
    try {
      // Call API to update RFID
      const packageItemId = localStorage.getItem("packageItemId");
      await PackageItemServices.updateRFID(packageItemId as string, rfid);
      toast({
        title: "RFID Updated",
        description: "RFID has been updated successfully",
      });
      setIsDoneUpsRFID(true);
      // setTimeout(() => {
      //   window.location.reload();
      // }, 3000);
      setIsUpdateRFIDDialogOpen(false);
      await PackageItemServices.getPackageItemById({
        id: packageItemId as string,
      });
    } catch (error: any) {
      console.error("Error updating RFID:", error);

      // Lấy message lỗi từ response
      const errorMessage =
        error.response?.data?.Error || error.response?.data?.messageResponse;

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Chỉ cho phép nhập số
    const value = e.target.value.replace(/[^0-9]/g, "");
    setAmount(value);
    setError("");

    // Cập nhật giá trị vào form
    formCharge.setValue("chargeAmount", parseInt(value) || 0);
  };
  const formatAmount = (value: string): string => {
    return value ? parseInt(value).toLocaleString("vi-VN") : "";
  };
  // Cập nhật form khi component mount
  useEffect(() => {
    if (packageItem) {
      childrenVCardForm.reset({
        quantity: 1,
        packageItemId: localStorage.getItem("packageItemId") || "",
      });
    }
  }, [packageItem, childrenVCardForm]);

  const handleGenerateChildrenVCard = () => {
    const { cusName, gender, phoneNumber, cusEmail, cusCccdpassport, isAdult } =
      form.getValues();
    const packageId = localStorage.getItem("packageIdCurrent");

    router.push(
      `/user/packages/generate/${packageId}?phoneNumber=${phoneNumber}&email=${cusEmail}&cccdPassport=${cusCccdpassport}&isAdult=${isAdult}`
    );
  };
  const handleChargeMoney = async (data: {
    packageOrderId: string;
    chargeAmount: number;
    cccdPassport: any;
    paymentType: string;
  }) => {
    try {
      setIsLoading(true);
      // Ensure charge amount is valid
      const chargeAmount = parseInt(amount) || 0;
      if (chargeAmount <= 0) {
        toast({
          title: "Error",
          description: "Please enter a valid amount",
          variant: "destructive",
        });
        return;
      }
      const decryptedId = decryptId(params.id);
      const cusCccdpassport = form.getValues("cusCccdpassport");
      const response = await PackageItemServices.chargeMoney({
        packageOrderId: packageItem?.id || "",
        chargeAmount: data.chargeAmount,
        cccdPassport: cusCccdpassport,
        paymentType: data.paymentType,
      });

      if (response.status === 200 && response.data?.data) {
        const { urlDirect, invoiceId, transactionChargeId } =
          response.data.data;

        // Store necessary data in localStorage
        localStorage.setItem("pendingInvoiceId", invoiceId);
        localStorage.setItem("transactionChargeId", transactionChargeId);
        localStorage.setItem("transactionId", response.data.transactionId);
        localStorage.setItem("balance", response.data.data.balance);
        localStorage.setItem(
          "packageItemIdCharge",
          response.data.data.packageItemId
        );
        localStorage.setItem("invoiceId", response.data.data.invoiceId);

        if (invoiceId) {
          try {
            const responseOrder = await GetOrdersById(invoiceId);
            const orderData = responseOrder.data?.data?.orderExist;

            if (orderData) {
              // Safely access nested properties
              const discountAmount =
                orderData.promotionOrders?.[0]?.discountAmount ?? 0;
              const totalAmount = orderData.totalAmount ?? 0;
              const cusName = orderData.packageOrder?.cusName ?? "";
              const seller = responseOrder.data?.data?.seller ?? "";
              localStorage.setItem("discountAmount", discountAmount.toString());
              localStorage.setItem("totalAmount", totalAmount.toString());
              localStorage.setItem("cusName", cusName);
              localStorage.setItem("seller", seller);
            }
          } catch (orderError) {
            console.error("Error fetching order details:", orderError);
            // Continue with the process even if order details fetch fails
          }

          if (!urlDirect) {
            toast({
              title: "Error",
              description: "Payment URL is missing from response",
              variant: "destructive",
            });
            return;
          }

          if (data.paymentType === "Cash") {
            setPendingInvoiceId(invoiceId);
            setShouldShowAlertDialog(true);
            setIsProcessingPopupOpen(true);
          } else {
            await initiatePayment(
              data.paymentType,
              invoiceId,
              response.data.data.key,
              response.data.data.urlDirect,
              response.data.data.urlIpn
            );
          }
        }
      } else {
        // Handle error response
        if (response.data) {
          toast({
            title: `Error ${response.data.StatusCode}`,
            description: response.data.Error || "An unknown error occurred",
            variant: "destructive",
          });
          console.error("Error details:", {
            StatusCode: response.data.StatusCode,
            Error: response.data.Error,
            TimeStamp: response.data.TimeStamp,
          });
        } else {
          throw new Error(
            `Failed to charge money. Status code: ${response.status}`
          );
        }
      }
    } catch (error: any) {
      console.error("Error charging money:", error);
      // Check if error has response data
      if (error.response?.data) {
        const errorData = error.response.data;
        toast({
          title: `Error ${errorData.StatusCode}`,
          description: errorData.Error || "An unknown error occurred",
          variant: "destructive",
        });
        console.error("Error details:", {
          StatusCode: errorData.StatusCode,
          Error: errorData.Error,
          TimeStamp: errorData.TimeStamp,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to charge money. Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
      setIsPopupOpen(false);
    }
  };
  const initiatePayment = async (
    paymentMethod: string,
    invoiceId: string,
    key?: string,
    urlDirect?: string,
    urlIpn?: string
  ) => {
    try {
      let paymentResponse;

      switch (paymentMethod.toLowerCase()) {
        case "momo":
          paymentResponse = await paymentService.momo({
            invoiceId,
            key,
            urlDirect,
            urlIpn,
          });
          break;
        case "vnpay":
          paymentResponse = await paymentService.vnpay({
            invoiceId,
            key,
            urlDirect,
            urlIpn,
          });
          break;
        case "payos":
          paymentResponse = await paymentService.payos({
            invoiceId,
            key,
            urlDirect,
            urlIpn,
          });
          break;
        case "zalopay":
          paymentResponse = await paymentService.zalopay({
            invoiceId,
            key,
            urlDirect,
            urlIpn,
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

  const handleConfirmPayment = async () => {
    if (!pendingInvoiceId) {
      toast({
        title: "Error",
        description: "No pending invoice ID found. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    setIsConfirming(true);
    try {
      const confirmData = {
        invoiceId: pendingInvoiceId,
        transactionChargeId: localStorage.getItem("transactionChargeId") || "",
      };
      const result = await confirmOrderForChargeVCard(confirmData);
      if (result.statusCode === 200 || result.statusCode === "200") {
        toast({
          title: "Payment Confirmed",
          description: "Payment confirmed successfully",
        });
        setShouldShowAlertDialog(false);
        setIsProcessingPopupOpen(false);
        setPendingInvoiceId(null);
        setIsConfirmPayment(true);
        // setTimeout(() => {
        //   window.location.reload();
        // }, 4000);
      } else {
        throw new Error(result.messageResponse || "Failed to confirm payment");
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      let errorMessage = "An unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null) {
        errorMessage = JSON.stringify(error);
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
    }
  };
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cusName: "",
      phoneNumber: "",
      cusCccdpassport: "",
      startDate: "",
      endDate: "",
      cusEmail: "",
      status: 0,
      imageUrl: "",
      isAdult: true,
      vcardId: "",
      customer: {
        fullName: "",
      },
      wallets: [
        {
          balance: 0,
          balanceHistory: 0,
        },
      ],
    },
  });
  const formCharge = useForm({
    defaultValues: {
      promoCode: "",
      chargeAmount: 0,
      cccdPassport: "",
      paymentType: "Cash",
      packageOrderId: params.id,
    },
  });

  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };
  const formatDateTimeForInput = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    date.setHours(date.getHours() + 7);
    return date.toISOString().slice(0, 16);
  };
  const formatDateTimeForDisplay = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    date.setHours(date.getHours());
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
  };
  useEffect(() => {
    const fetchEtag = async () => {
      if (!params?.id) {
        setError("No ID provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        let idToUse = params.id;

        // Try to decrypt if it's an encrypted ID
        try {
          const decryptedId = decryptId(params.id);
          if (decryptedId && decryptedId.match(/^[0-9a-f-]{36}$/)) {
            idToUse = decryptedId;
          }
        } catch (decryptError) {
          console.warn("Using original ID as decryption failed:", decryptError);
        }

        // Gọi API với ID đã xử lý
        const response = await PackageItemServices.getPackageItemById({
          id: idToUse,
        });

        if (response.data?.data) {
          // Mã hóa ID và cập nhật URL
          const encryptedId = encryptId(idToUse);
          // Kiểm tra nếu URL hiện tại chưa được mã hóa
          if (params.id !== encryptedId) {
            // Thay thế URL hiện tại bằng URL với ID đã mã hóa mà không reload trang
            const newPath = pathname.replace(params.id, encryptedId);
            window.history.replaceState(null, "", newPath);
          }

          const packageitemData = response.data?.data;
          const qrCodeData = response.data?.qrCode;

          setPackageItem(packageitemData);
          setQrCode(qrCodeData);

          // Lưu các thông tin cần thiết vào localStorage
          localStorage.setItem("packageItemId", packageitemData.id);
          localStorage.setItem("packageIdCurrent", packageitemData.packageId);
          localStorage.setItem("startDateCustomer", packageitemData.startDate);
          localStorage.setItem("endDateCustomer", packageitemData.endDate);
          localStorage.setItem("packageId", packageitemData.packageId);

          // Reset form với dữ liệu mới
          form.reset({
            cusName: packageitemData.cusName || "",
            phoneNumber: packageitemData.phoneNumber || "",
            cusCccdpassport: packageitemData.cusCccdpassport || "",
            birthday: formatDateForInput(packageitemData.birthday) || "",
            startDate: formatDateTimeForInput(packageitemData.startDate) || "",
            endDate: formatDateTimeForInput(packageitemData.endDate) || "",
            vcardId: packageitemData.vcardId || "",
            status: packageitemData.status || 0,
            imageUrl: packageitemData.imageUrl || "",
            cusEmail: packageitemData.cusEmail || "",
            isAdult: packageitemData.isAdult,
            customer: {
              fullName: packageitemData.customer?.fullName || "",
            },
            wallets: [
              {
                balance: packageitemData.wallets[0]?.balance || 0,
                balanceHistory: packageitemData.wallets[0]?.balanceHistory || 0,
              },
            ],
          });

          localStorage.setItem(
            "walletBalance",
            packageitemData.wallet?.balance || 0
          );

          // Reset charge form
          formCharge.reset({
            chargeAmount: 0,
            cccdPassport: packageitemData.cusCccdpassport || "",
            paymentType: "Cash",
            packageOrderId: params.id,
          });
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        toast({
          title: "Error",
          description: "Failed to load package item details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEtag();
  }, [
    params?.id,
    form,
    formCharge,
    pathname,
    toast,
    isDoneUpsRFID,
    isConfirmPayment,
    isDone,
  ]);
  const getEncryptedId = (originalId: string) => {
    try {
      return encryptId(originalId);
    } catch (error) {
      console.error("Error encrypting ID:", error);
      return originalId;
    }
  };

  if (isLoading)
    return (
      <div>
        <Loader isLoading={isLoading} />
      </div>
    );
  if (error) return <div>Error: {error}</div>;
  const handleActivateEtag = async () => {
    if (!packageItem) return;

    if (isEditing) {
      setIsConfirming(true);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleConfirmActivation = async () => {
    if (!packageItem) return;

    setIsLoading(true);
    try {
      const formData = form.getValues();

      const activationData = {
        email: formData.cusEmail,
        fullName: formData.cusName,
        phoneNumber: formData.phoneNumber,
        cccdPassport: formData.cusCccdpassport,
      };

      await PackageItemServices.activatePackageItem(
        packageItem.id,
        activationData
      );

      toast({
        title: "VCard Activated",
        description: "The VCard has been successfully activated.",
      });
      setIsDone(true);
      // window.location.reload();
    } catch (err: any) {
      // Kiểm tra nếu response có cấu trúc mong muốn
      if (err.response?.data) {
        const errorData = err.response.data;
        toast({
          title: `Error `,
          description: `${errorData.Error}`,
          variant: "destructive",
        });
      } else {
        // Fallback cho các lỗi khác
        toast({
          title: "Activation Failed",
          description:
            err instanceof Error ? err.message : "An unknown error occurred",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelActivation = () => {
    setIsEditing(false);
    setIsConfirming(false);
    form.reset();
  };
  const getInputClassName = (isActive: boolean) => {
    return isActive
      ? "bg-slate-100 border border-gray-300 text-black rounded-md focus:border-black focus:ring focus:ring-black/50 dark:bg-slate-500 dark:text-white"
      : "bg-white border border-gray-300 text-black rounded-md focus:border-black focus:ring focus:ring-black/50 dark:bg-slate-500 dark:text-white";
  };

  const shouldShowRFIDUpdate = () => {
    return (
      !packageItem ||
      !packageItem.vcard ||
      !packageItem.vcard.id ||
      packageItem.vcard.id.trim() === ""
    );
  };
  return (
    <>
      <BackButton text="Back To VCard" link="/user/package-items" />

      <Form {...form}>
        <form className="space-y-4">
          <div className="flex flex-col items-center space-y-4 w-full"></div>

          <Card className="w-full max-w-5xl mx-auto">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center p-4 bg-white">
                <CardTitle className="text-xl font-semibold text-gray-800">
                  VCard Detail
                </CardTitle>
                <div className="flex items-center space-x-3">
                  <QRCodeDialog qrCode={qrCode ?? undefined} />
                  {packageItem?.status === "Active" &&
                    packageItem.isAdult === true && (
                      <Button
                        type="button"
                        onClick={handleGenerateChildrenVCard}
                        variant="outline"
                        className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-100 transition-all"
                      >
                        Generate Children VCard
                      </Button>
                    )}
                  {shouldShowRFIDUpdate() && (
                    <Button
                      type="button"
                      onClick={() => setIsUpdateRFIDDialogOpen(true)}
                      variant="outline"
                      className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-100 transition-all"
                    >
                      Update RFID
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-w-4xl mx-auto pl-20 space-y-12">
                {/* Personal Details */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold mb-2 mt-10">
                    Customer Information
                  </h4>
                  <div className="space-y-4 mr-14">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormItem className="flex flex-col gap-1 md:w-10/12">
                        <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                          FullName
                        </FormLabel>
                        <FormControl>
                          <Input
                            className={getInputClassName(
                              packageItem?.status === "Active"
                            )}
                            {...form.register("cusName")}
                            readOnly={
                              !isEditing || packageItem?.status === "Active"
                            }
                          />
                        </FormControl>
                      </FormItem>

                      <FormItem className="flex flex-col gap-1 md:w-10/12">
                        <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            className={getInputClassName(
                              packageItem?.status === "Active"
                            )}
                            {...form.register("cusEmail")}
                            readOnly={
                              !isEditing || packageItem?.status === "Active"
                            }
                          />
                        </FormControl>
                      </FormItem>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormItem className="flex flex-col gap-1 md:w-10/12">
                        <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            className={getInputClassName(
                              packageItem?.status === "Active"
                            )}
                            {...form.register("phoneNumber")}
                            readOnly={
                              !isEditing || packageItem?.status === "Active"
                            }
                          />
                        </FormControl>
                      </FormItem>

                      <FormItem className="flex flex-col gap-1 md:w-10/12">
                        <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                          CCCD/Passport
                        </FormLabel>
                        <FormControl>
                          <Input
                            className={getInputClassName(
                              packageItem?.status === "Active"
                            )}
                            {...form.register("cusCccdpassport")}
                            readOnly={
                              !isEditing || packageItem?.status === "Active"
                            }
                          />
                        </FormControl>
                      </FormItem>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormItem className="flex flex-col gap-1 md:w-10/12">
                        <CustomerStatusField
                          isAdult={form.getValues("isAdult")}
                        />
                      </FormItem>

                      <FormItem className="flex flex-col gap-1 md:w-10/12">
                        <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                          VCard ID
                        </FormLabel>
                        <FormControl>
                          <Input
                            className={getInputClassName(
                              !!form.getValues("vcardId")
                            )}
                            {...form.register("vcardId")}
                            readOnly
                          />
                        </FormControl>
                      </FormItem>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormItem className="flex flex-col gap-1 md:w-10/12">
                        <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                          Buyer
                        </FormLabel>
                        <FormControl>
                          <Input
                            className={getInputClassName(
                              packageItem?.status === "Active"
                            )}
                            {...form.register("cusName")}
                            readOnly={
                              !isEditing || packageItem?.status === "Active"
                            }
                          />
                        </FormControl>
                      </FormItem>
                    </div>
                  </div>
                </div>

                {/* Duration Information */}
                <div className="space-y-4 mr-14">
                  <h4 className="text-lg font-semibold mb-2 mt-10">
                    Duration Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormItem className="flex flex-col gap-1 md:w-10/12">
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                        Start Date
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-slate-100 border border-gray-300 text-black rounded-md focus:border-black focus:ring focus:ring-black/50 dark:bg-slate-500 dark:text-white"
                          value={formatDateTimeForDisplay(
                            form.getValues("startDate")
                          )}
                          readOnly
                        />
                      </FormControl>
                    </FormItem>

                    <FormItem className="flex flex-col gap-1 md:w-10/12">
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                        End Date
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-slate-100 border border-gray-300 text-black rounded-md focus:border-black focus:ring focus:ring-black/50 dark:bg-slate-500 dark:text-white"
                          value={formatDateTimeForDisplay(
                            form.getValues("endDate")
                          )}
                          readOnly
                        />
                      </FormControl>
                    </FormItem>

                    <FormItem className="flex flex-col gap-1 md:w-10/12">
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                        Status
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-slate-100 border border-gray-300 text-black rounded-md focus:border-black focus:ring focus:ring-black/50 dark:bg-slate-500 dark:text-white"
                          {...form.register("status")}
                          readOnly
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </div>
                </div>

                {/* Wallet Information */}
                <div className="space-y-4 mr-14">
                  <h4 className="text-lg font-semibold mb-2">
                    Wallet Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormItem className="flex flex-col gap-1 md:w-10/12">
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                        Balance
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-slate-100 border border-gray-300 text-black rounded-md focus:border-black focus:ring focus:ring-black/50 dark:bg-slate-500 dark:text-white"
                          // {...form.register("wallets.0.balance")}
                          value={formatVNDCurrencyValue(
                            form.getValues("wallets.0.balance")
                          )}
                          readOnly
                        />
                      </FormControl>
                    </FormItem>

                    <FormItem className="flex flex-col gap-1 md:w-10/12">
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                        History
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-slate-100 border border-gray-300 text-black rounded-md focus:border-black focus:ring focus:ring-black/50 dark:bg-slate-500 dark:text-white"
                          // {...form.register("wallets.0.balanceHistory")}
                          value={formatVNDCurrencyValue(
                            form.getValues("wallets.0.balanceHistory")
                          )}
                          readOnly
                        />
                      </FormControl>
                    </FormItem>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <UpdateRFIDAlertDialog
            isOpen={isUpdateRFIDDialogOpen}
            onOpenChange={setIsUpdateRFIDDialogOpen}
            onConfirm={handleUpdateRFID}
            isLoading={isLoading}
            packageItem={packageItem}
          />

          <div className="flex justify-end mt-4">
            {packageItem &&
              packageItem.status === "Active" &&
              packageItem.wallets[0].walletType.name === "ServiceWallet" && (
                <Button type="button" onClick={() => setIsPopupOpen(true)}>
                  Charge Money
                </Button>
              )}
          </div>

          <ChargeMoneyDialog
            isOpen={isPopupOpen}
            onOpenChange={setIsPopupOpen}
            form={formCharge}
            onSubmit={handleChargeMoney}
            amount={amount}
            onAmountChange={handleAmountChange}
            formatAmount={formatAmount}
          />

          <ProcessingDialog
            isOpen={isProcessingPopupOpen && shouldShowAlertDialog}
            onOpenChange={(open) => {
              setIsProcessingPopupOpen(open);
              if (!open) {
                setShouldShowAlertDialog(false);
                setIsProcessingPopupOpen(false);
                setPendingInvoiceId(null);
                formCharge.reset();
                setIsPopupOpen(false);
              }
            }}
            onConfirm={handleConfirmPayment}
            isConfirming={isConfirming}
          />
        </form>
      </Form>

      <div className="flex justify-end mt-6 pr-4 pb-4 space-x-4">
        {packageItem && packageItem.status === "InActive" && (
          <>
            {!isConfirming ? (
              <Button
                className="mt-12 px-6 py-2"
                onClick={handleActivateEtag}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader isLoading={isLoading} />
                ) : isEditing ? (
                  "Confirm"
                ) : (
                  "Activate"
                )}
              </Button>
            ) : (
              !isDone && (
                <>
                  <Button
                    className="mt-12 px-6 py-2"
                    onClick={handleConfirmActivation}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader isLoading={isLoading} />
                    ) : (
                      "Confirm Activation"
                    )}
                  </Button>
                  <Button
                    className="mt-12 px-6 py-2"
                    onClick={handleCancelActivation}
                    disabled={isLoading}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </>
              )
            )}
          </>
        )}
      </div>
    </>
  );
};

export default PackageItemDetailPage;
