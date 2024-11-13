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
import { PackageItemServices } from "@/components/services/packageItemService";
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
import { useRouter } from "next/navigation";
const PackageItemDetailPage = ({ params }: PackageItemDetailPageProps) => {
  const { toast } = useToast();
  const [packageItem, setPackageItem] = useState<PackageItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
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
  const [isChildrenVCardDialogOpen, setIsChildrenVCardDialogOpen] =
    useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const childrenVCardForm = useForm({
    defaultValues: {
      quantity: 1,
      packageItemId: "",
    },
  });
  const customerForm = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      customerName: "",
      phoneNumber: "",
      address: "",
      cccdpassport: "",
      paymentMethod: "Cash",
      gender: "Male",
      email: "",
      quantity: 1,
      price: 0,
    },
  });
  const handleUpdateRFID = async (rfid: string) => {
    try {
      // Call API to update RFID
      await PackageItemServices.updateRFID(packageItem!.id, rfid);
      toast({
        title: "RFID Updated",
        description: "RFID has been updated successfully",
      });
      setIsUpdateRFIDDialogOpen(false);
    } catch (error) {
      console.error("Error updating RFID:", error);
      toast({
        title: "Error",
        description: "Failed to update RFID",
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
  useEffect(() => {
    const fetchPromotions = async () => {
      setIsLoadingPromotions(true);
      setPromotionError(null);
      try {
        const response = await PromotionServices.getPromotions({
          page: 1,
          size: 10,
        });

        // Ensure we're handling the response data structure correctly
        if (response.data?.data) {
          // Check if data is an array
          const promotionsData = Array.isArray(response.data.data)
            ? response.data.data
            : Array.isArray(response.data.data[0])
            ? response.data.data[0]
            : [];

          setPromotions(promotionsData);
        } else {
          setPromotions([]);
        }
      } catch (error) {
        console.error("Error fetching promotions:", error);
        setPromotionError("Failed to load promotions");
        toast({
          title: "Error",
          description: "Failed to load promotions",
          variant: "destructive",
        });
      } finally {
        setIsLoadingPromotions(false);
      }
    };

    fetchPromotions();
  }, [toast]);

  const handleGenerateChildrenVCard = () => {
    const { name, gender, phoneNumber, email, cccdpassport } = form.getValues();
    const packageId = localStorage.getItem("packageIdCurrent");

    router.push(
      `/user/packages/generate/${packageId}?customerName=${name}&gender=${gender}&phoneNumber=${phoneNumber}&email=${email}&cccdpassport=${cccdpassport}`
    );
  };
  const handleChargeMoney = async (data: {
    packageItemId: string;
    chargeAmount: number;
    cccdpassport: any;
    paymentType: string;
  }) => {
    try {
      setIsLoading(true);
      // Đảm bảo chargeAmount là số từ giá trị amount đã nhập
      const chargeAmount = parseInt(amount) || 0;

      // Kiểm tra số tiền hợp lệ
      if (chargeAmount <= 0) {
        toast({
          title: "Error",
          description: "Please enter a valid amount",
          variant: "destructive",
        });
        return;
      }
      const response = await PackageItemServices.chargeMoney({
        packageItemId: params.id,
        chargeAmount: data.chargeAmount,
        cccdPassport: data.cccdpassport,
        paymentType: data.paymentType,
        promoCode: "no_promotion",
      });

      if (response.status === 200) {
        const responseData = response.data;
        if (responseData && responseData.data) {
          const { urlDirect, invoiceId, transactionChargeId } =
            responseData.data;
          localStorage.setItem("pendingInvoiceId", invoiceId);
          localStorage.setItem("transactionChargeId", transactionChargeId);
          localStorage.setItem("transactionId", responseData.transactionId);

          if (!urlDirect || !invoiceId) {
            toast({
              title: "Error",
              description:
                "Critical data missing from response. Please try again later.",
              variant: "destructive",
            });
            return;
          }

          if (data.paymentType === "Cash") {
            setPendingInvoiceId(invoiceId);
            setShouldShowAlertDialog(true);
            setIsProcessingPopupOpen(true);
          } else {
            await initiatePayment(data.paymentType, invoiceId);
          }
        }
      } else {
        toast({
          title: "Error",
          description: `Failed to charge money. Status code: ${response.status}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error charging money:", error);
      toast({
        title: "Error",
        description: "Failed to charge money. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsPopupOpen(false);
    }
  };
  useEffect(() => {
    console.log("isProcessingPopupOpen:", isProcessingPopupOpen);
    console.log("shouldShowAlertDialog:", shouldShowAlertDialog);
  }, [isProcessingPopupOpen, shouldShowAlertDialog]);
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
        transactionId: localStorage.getItem("transactionId") || "",
      };
      const result = await confirmOrderForCharge(confirmData);
      if (result.statusCode === 200 || result.statusCode === "200") {
        toast({
          title: "Payment Confirmed",
          description: "Payment confirmed successfully",
        });
        setShouldShowAlertDialog(false);
        setIsProcessingPopupOpen(false);
        setPendingInvoiceId(null);
        setTimeout(() => {
          window.location.reload();
        }, 4000);
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
      name: "",
      phoneNumber: "",
      cccdpassport: "",
      birthday: "",
      gender: "" as "Male" | "Female" | "Other" | undefined,
      startDate: "",
      endDate: "",
      email: "",
      status: 0,
      imageUrl: "",
      isAdult: true,

      wallet: {
        balance: 0,
        balanceHistory: 0,
      },
    },
  });
  const formCharge = useForm({
    defaultValues: {
      promoCode: "",
      chargeAmount: 0,
      cccdpassport: form.getValues("cccdpassport"),
      paymentType: "Cash",
      packageItemId: params.id,
      // startDate: form.getValues("startDate"),
      // endDate: form.getValues("endDate"),
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
        const response = await PackageItemServices.getPackageItemById({
          id: params.id,
        });
        const packageitemData = response.data?.data;
        console.log(packageitemData, "packageitemData");
        const qrCodeData = response.data?.qrCode;
        console.log(response.data.qrCode, "QRcode");
        setPackageItem(packageitemData);
        setQrCode(qrCodeData);
        if (packageitemData.isAdult === false) {
          // Remove packageItemId from localStorage
          localStorage.removeItem("packageItemId");
        } else {
          localStorage.setItem("packageItemId", packageitemData.id);
        }
        localStorage.setItem("packageIdCurrent", packageitemData.packageId);
        localStorage.setItem("startDateCustomer", packageitemData.startDate);
        localStorage.setItem("endDateCustomer", packageitemData.endDate);
        if (!packageitemData) {
          throw new Error("No etag data received");
        }

        form.reset({
          name: packageitemData.name || "",
          phoneNumber: packageitemData.phoneNumber || "",
          cccdpassport: packageitemData.cccdpassport || "",
          birthday: formatDateForInput(packageitemData.birthday) || "",
          startDate: formatDateTimeForInput(packageitemData.startDate) || "",
          endDate: formatDateTimeForInput(packageitemData.endDate) || "",
          gender: packageitemData.gender,
          status: packageitemData.status || 0,
          imageUrl: packageitemData.imageUrl || "",
          email: packageitemData.email || "",
          wallet: {
            balance: packageitemData.wallet?.balance || 0,
            balanceHistory: packageitemData.wallet?.balanceHistory || 0,
          },
        });
        localStorage.setItem(
          "walletBalance",
          packageitemData.wallet?.balance || 0
        );
        // Reset charge form
        formCharge.reset({
          // promoCode: "",
          chargeAmount: 0,
          cccdpassport: (packageitemData.cccdpassport || "").trim(),
          paymentType: "Cash",
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        toast({
          title: "Error",
          description: "Failed to load ETag details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEtag();
  }, [params?.id, form, formCharge, toast]);

  if (isLoading) return <div>Loading...</div>;
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
      const activateData = {
        cccdPassport: formData.cccdpassport,
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        birthday: formData.birthday || new Date().toISOString(),
        isAdult: true,
        email: formData.email,
      };

      await PackageItemServices.activatePackageItem(
        packageItem.id,
        activateData
      );
      toast({
        title: "ETag Activated",
        description: "The ETag has been successfully activated.",
      });
      window.location.reload();
    } catch (err) {
      toast({
        title: "Activation Failed",
        description:
          err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelActivation = () => {
    setIsEditing(false);
    setIsConfirming(false);
    form.reset();
  };

  return (
    <>
      <BackButton text="Back To Etag List" link="/user/package-items" />
      <h3 className="text-2xl mb-4">VCard Detail</h3>

      <Form {...form}>
        <form className="space-y-4">
          <div className="flex flex-col items-center space-y-4 w-full">
            <div className="relative w-64 h-64 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600">
              {packageItem?.imageUrl ? (
                <Image
                  src={packageItem?.imageUrl || ""}
                  alt="Profile Image"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gray-400">No image uploaded</span>
                </div>
              )}
            </div>
          </div>

          <Card className="w-full max-w-5xl mx-auto">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center p-4 bg-white ">
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
                  {packageItem?.status === "Active" && (
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
                <div className="space-y-4 ">
                  <h4 className="text-lg font-semibold mb-2 mt-10">
                    Customer Information
                  </h4>
                  <div className="space-y-2 mr-14">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 justify-center items-center ">
                      <FormItem className="grid grid-cols-[100px_1fr] items-center gap-1 md:w-10/12 ">
                        <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white whitespace-nowrap">
                          FullName
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                            {...form.register("name")}
                            readOnly={!isEditing}
                          />
                        </FormControl>
                      </FormItem>

                      <FormItem className="grid grid-cols-[100px_1fr] items-center gap-1 md:w-10/12">
                        <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white whitespace-nowrap">
                          Email:
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                            {...form.register("email")}
                            readOnly={!isEditing}
                          />
                        </FormControl>
                      </FormItem>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <FormItem className="grid grid-cols-[120px_1fr] items-center gap-1 md:w-10/12">
                        <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white whitespace-nowrap">
                          Phone Number:
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                            {...form.register("phoneNumber")}
                            readOnly={!isEditing}
                          />
                        </FormControl>
                      </FormItem>

                      <FormItem className="grid grid-cols-[100px_1fr] items-center gap-1 md:w-10/12">
                        <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white whitespace-nowrap">
                          CCCD/Passport :
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                            {...form.register("cccdpassport")}
                            readOnly={!isEditing}
                          />
                        </FormControl>
                      </FormItem>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem className="grid grid-cols-[100px_1fr] items-center gap-1  md:w-10/12">
                            <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white whitespace-nowrap">
                              Gender
                            </FormLabel>
                            <Select
                              onValueChange={(value) => field.onChange(value)}
                              defaultValue={field.value}
                              disabled={!isEditing}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2">
                    Duration Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <FormItem className="grid grid-cols-[100px_1fr] items-center gap-1 md:w-9/12">
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white whitespace-nowrap">
                        Start Date:
                      </FormLabel>

                      <FormControl>
                        <Input
                          className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                          value={formatDateTimeForDisplay(
                            form.getValues("startDate")
                          )}
                          readOnly
                        />
                      </FormControl>
                    </FormItem>
                    <FormItem className="grid grid-cols-[100px_1fr] items-center gap-1 md:w-9/12">
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white whitespace-nowrap">
                        End Date:
                      </FormLabel>

                      <FormControl>
                        <Input
                          className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                          value={formatDateTimeForDisplay(
                            form.getValues("endDate")
                          )}
                          readOnly
                        />
                      </FormControl>
                    </FormItem>
                    <FormItem className="grid grid-cols-[100px_1fr] items-center gap-1 md:w-8/12">
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                        Status
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                          {...form.register("status")}
                          readOnly={!isEditing}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </div>
                </div>
                {/* Wallet Information */}
                <div>
                  <h4 className="text-lg font-semibold mb-2">
                    Wallet Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <FormItem className="grid grid-cols-[100px_1fr] items-center gap-1 md:w-8/12">
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white whitespace-nowrap">
                        Balance
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                          {...form.register("wallet.balance")}
                          readOnly
                        />
                      </FormControl>
                    </FormItem>

                    <FormItem className="grid grid-cols-[150px_1fr] items-center gap-1 md:w-8/12 ">
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white whitespace-nowrap">
                        Balance History:
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                          {...form.register("wallet.balanceHistory")}
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
          {/* <GenerateChildrenVCardDialog
            isOpen={isChildrenVCardDialogOpen}
            onOpenChange={setIsChildrenVCardDialogOpen}
            form={childrenVCardForm}
            onSubmit={handleGenerateChildrenVCard}
            isLoading={isLoading}
          /> */}
          <div className="flex justify-end mt-4">
            {packageItem &&
              packageItem.status === "Active" &&
              packageItem.wallet.walletType.name === "ServiceWallet" && (
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
            promotions={promotions}
            isLoadingPromotions={isLoadingPromotions}
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
            pendingInvoiceId={pendingInvoiceId}
          />
        </form>
      </Form>
      <div className="flex justify-end mt-6 pr-4 pb-4 space-x-4">
        {packageItem && packageItem.status === "Inactive" && !isConfirming && (
          <Button
            className="mt-12 px-6 py-2"
            onClick={handleActivateEtag}
            disabled={isLoading}
          >
            {isLoading
              ? "Processing..."
              : isEditing
              ? "Confirm"
              : "Activate ETag"}
          </Button>
        )}
        {isConfirming && (
          <>
            <Button
              className="mt-12 px-6 py-2"
              onClick={handleConfirmActivation}
              disabled={isLoading}
            >
              {isLoading ? "Activating..." : "Confirm Activation"}
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
        )}
      </div>
    </>
  );
};

export default PackageItemDetailPage;
