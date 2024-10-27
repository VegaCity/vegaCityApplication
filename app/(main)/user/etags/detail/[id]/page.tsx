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
import { ETagServices } from "@/components/services/etagService";
import { ETag } from "@/types/etag";
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
} from "@/components/ui/dialog";
import paymentService from "@/components/services/paymentService";
import { formSchema, FormValues, EtagDetailPageProps } from "@/lib/validation";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { confirmOrder } from "@/components/services/orderuserServices";
import { AlertDialogAction } from "@radix-ui/react-alert-dialog";
import { ConfirmOrderData } from "@/types/orderUser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
const EtagDetailPage = ({ params }: EtagDetailPageProps) => {
  const { toast } = useToast();
  const [etag, setEtag] = useState<ETag | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isProcessingPopupOpen, setIsProcessingPopupOpen] = useState(false);
  const [shouldShowAlertDialog, setShouldShowAlertDialog] = useState(false);
  const [pendingInvoiceId, setPendingInvoiceId] = useState<string | null>(null);
  const handleChargeMoney = async (data: {
    etagCode: any;
    chargeAmount: number;
    cccdPassport: any;
    paymentType: string;
  }) => {
    try {
      setIsLoading(true);
      const response = await ETagServices.chargeMoney({
        etagCode: data.etagCode,
        chargeAmount: data.chargeAmount,
        cccdPassport: data.cccdPassport,
        paymentType: data.paymentType,
      });

      if (response.status === 200) {
        const responseData = response.data;
        if (responseData && responseData.data) {
          const { urlDirect, invoiceId } = responseData.data;
          localStorage.setItem("pendingInvoiceId", invoiceId);

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
        title: "Lỗi",
        description: "Không có hóa đơn chờ xác nhận",
        variant: "destructive",
      });
      return;
    }

    setIsConfirming(true);
    try {
      const confirmData = {
        invoiceId: pendingInvoiceId,
      };

      console.log("Đang xác nhận đơn hàng với dữ liệu:", confirmData);
      const result = await confirmOrder(confirmData);
      console.log("Kết quả xác nhận:", result);

      if (result.statusCode === 200 || result.statusCode === "200") {
        toast({
          title: "Thanh toán thành công",
          description: "Đơn hàng đã được xác nhận",
        });
        setShouldShowAlertDialog(false);
        setIsProcessingPopupOpen(false);
        setPendingInvoiceId(null);
        setTimeout(() => {
          window.location.reload();
        }, 4000);
      } else {
        throw new Error(
          result.messageResponse || "Không thể xác nhận đơn hàng"
        );
      }
    } catch (error) {
      console.error("Lỗi khi xác nhận đơn hàng:", error);
      let errorMessage = "Có lỗi xảy ra khi xác nhận đơn hàng";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null) {
        errorMessage = JSON.stringify(error);
      }
      toast({
        title: "Lỗi xác nhận",
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
      fullName: "",
      etagCode: "",
      phoneNumber: "",
      cccdPassport: "",
      birthday: "",
      gender: "0",
      startDate: "",
      endDate: "",
      status: 0,
      imageUrl: "",
      etagType: {
        name: "",
        bonusRate: 0,
        amount: 0,
      },
      wallet: {
        balance: 0,
        balanceHistory: 0,
      },
    },
  });
  const formCharge = useForm({
    defaultValues: {
      etagCode: form.getValues("etagCode"),
      chargeAmount: 0,
      cccdPassport: form.getValues("cccdPassport"),
      paymentType: "Cash",
      startDate: form.getValues("startDate"),
      endDate: form.getValues("endDate"),
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
    date.setHours(date.getHours()); // Adjust for timezone if needed

    // Get date components
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    // Get time components
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    // Convert hours to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // If hours is 0, set to 12

    // Combine all components
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
        const response = await ETagServices.getETagById(params.id);
        const etagData = response.data?.data?.etag;

        if (!etagData) {
          throw new Error("No etag data received");
        }

        const etagDetails = etagData.etagDetails?.[0] || {};
        setEtag(etagData);

        // Reset form with fetched data
        form.reset({
          fullName: etagDetails.fullName || "",
          etagCode: etagData.etagCode || "",
          phoneNumber: etagDetails.phoneNumber || "",
          cccdPassport: etagDetails.cccdPassport || "",
          birthday: formatDateForInput(etagDetails.birthday) || "",
          startDate: formatDateTimeForInput(etagData.startDate) || "",
          endDate: formatDateTimeForInput(etagData.endDate) || "",
          gender: (etagDetails.gender || 0).toString(),
          status: etagData.status || 0,
          imageUrl: etagData.imageUrl || "",
          etagType: {
            name: etagData.etagType?.name || "N/A",
            bonusRate: etagData.etagType?.bonusRate || 0,
            amount: etagData.etagType?.amount || 0,
          },
          wallet: {
            balance: etagData.wallet?.balance || 0,
            balanceHistory: etagData.wallet?.balanceHistory || 0,
          },
        });

        // Reset charge form
        formCharge.reset({
          etagCode: etagData.etagCode || "",
          chargeAmount: 0,
          cccdPassport: (etagDetails.cccdPassport || "").trim(),
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
  if (!etag) return <div>Loading ...</div>;

  const getStatusString = (status: number) => {
    switch (status) {
      case 0:
        return "Inactive";
      case 1:
        return "Active";
      default:
        return "Block";
    }
  };

  const getGenderString = (gender: number) => {
    switch (gender) {
      case 0:
        return "Male";
      case 1:
        return "Female";
      case 2:
        return "Other";
      default:
        return "Unknown";
    }
  };
  const handleActivateEtag = async () => {
    if (!etag) return;

    if (isEditing) {
      setIsConfirming(true);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleConfirmActivation = async () => {
    if (!etag) return;

    setIsLoading(true);
    try {
      const formData = form.getValues();
      const activateData = {
        cccdPassport: formData.cccdPassport,
        name: formData.fullName,
        phone: formData.phoneNumber,
        gender: formData.gender,
        birthday: formData.birthday || new Date().toISOString(),
        startDate: formData.startDate || new Date().toISOString(),
        endDate:
          formData.endDate ||
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      };

      await ETagServices.activateEtag(etag.id, activateData);
      toast({
        title: "ETag Activated",
        description: "The ETag has been successfully activated.",
      });
      window.location.reload();
      // Optionally refresh ETag data here
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

  const validImageUrl =
    etag.imageUrl && etag.imageUrl.startsWith("http")
      ? etag.imageUrl
      : "/default-image.png";
  return (
    <>
      <BackButton text="Back To Etag List" link="/user/etags" />
      <h3 className="text-2xl mb-4">Etag Detail</h3>

      <Form {...form}>
        <form className="space-y-4">
          <div className="relative w-full h-48">
            <Image
              src={validImageUrl}
              alt={"Image"}
              layout="fill"
              objectFit="cover"
              className="rounded-lg justify-center items-center"
            />
          </div>

          <Card className="w-full max-w-5xl mx-auto">
            <CardHeader className="pb-2">
              <CardTitle>Thông tin ETag</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-4xl mx-auto pl-20 space-y-12">
                {/* Personal Details */}
                <div className="space-y-4 ">
                  <h4 className="text-lg font-semibold mb-2 mt-10">
                    Thông tin cá nhân
                  </h4>
                  <div className="space-y-2 mr-14">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 justify-center items-center ">
                      <FormItem className="grid grid-cols-[100px_1fr] items-center gap-1 md:w-10/12 ">
                        <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white whitespace-nowrap">
                          Họ tên :
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                            {...form.register("fullName")}
                            readOnly={!isEditing}
                          />
                        </FormControl>
                      </FormItem>

                      <FormItem className="grid grid-cols-[100px_1fr] items-center gap-1 md:w-10/12">
                        <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white whitespace-nowrap">
                          Etag Code :
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                            {...form.register("etagCode")}
                            readOnly
                          />
                        </FormControl>
                      </FormItem>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <FormItem className="grid grid-cols-[120px_1fr] items-center gap-1 md:w-10/12">
                        <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white whitespace-nowrap">
                          Số điện thoại :
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
                            {...form.register("cccdPassport")}
                            readOnly={!isEditing}
                          />
                        </FormControl>
                      </FormItem>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <FormItem className="grid grid-cols-[100px_1fr] items-center gap-1 md:w-10/12">
                        <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white whitespace-nowrap">
                          Ngày sinh:
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                            {...form.register("birthday")}
                            readOnly={!isEditing}
                          />
                        </FormControl>
                      </FormItem>

                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem className="grid grid-cols-[100px_1fr] items-center gap-1  md:w-10/12">
                            <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white whitespace-nowrap">
                              Giới tính:
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
                                <SelectItem value="0">Nam</SelectItem>
                                <SelectItem value="1">Nữ</SelectItem>
                                <SelectItem value="2">Khác</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2">Thời hạn thẻ</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <FormItem className="grid grid-cols-[120px_1fr] items-center gap-1 md:w-9/12">
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white whitespace-nowrap">
                        Ngày bắt đầu:
                      </FormLabel>
                      {isEditing ? (
                        <FormControl>
                          <Input
                            type="datetime-local"
                            className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                            {...form.register("startDate")}
                          />
                        </FormControl>
                      ) : (
                        <FormControl>
                          <Input
                            className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                            value={formatDateTimeForDisplay(
                              form.getValues("startDate")
                            )}
                            readOnly
                          />
                        </FormControl>
                      )}
                    </FormItem>
                    <FormItem className="grid grid-cols-[120px_1fr] items-center gap-1 md:w-9/12">
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white whitespace-nowrap">
                        Ngày kết thúc:
                      </FormLabel>
                      {isEditing ? (
                        <FormControl>
                          <Input
                            type="datetime-local"
                            className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                            {...form.register("endDate")}
                          />
                        </FormControl>
                      ) : (
                        <FormControl>
                          <Input
                            className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                            value={formatDateTimeForDisplay(
                              form.getValues("endDate")
                            )}
                            readOnly
                          />
                        </FormControl>
                      )}
                    </FormItem>
                    <FormItem className="grid grid-cols-[120px_1fr] items-center gap-1 md:w-8/12">
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                        Status
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                          value={getStatusString(etag.status)}
                          readOnly
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </div>
                </div>
                {/* ETag Type Information */}
                <div>
                  <h4 className="text-lg font-semibold mb-2">
                    Thông tin ETag Type
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <FormItem className="grid grid-cols-[100px_1fr] items-center gap-1 md:w-8/12">
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white whitespace-nowrap">
                        ETag Type:
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                          {...form.register("etagType.name")}
                          readOnly
                        />
                      </FormControl>
                    </FormItem>

                    <FormItem className="grid grid-cols-[100px_1fr] items-center gap-1 md:w-8/12">
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white whitespace-nowrap">
                        Giá trị:
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                          {...form.register("etagType.amount")}
                          readOnly
                        />
                      </FormControl>
                    </FormItem>
                  </div>
                </div>

                {/* Wallet Information */}
                <div>
                  <h4 className="text-lg font-semibold mb-2">Thông tin Ví</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <FormItem className="grid grid-cols-[100px_1fr] items-center gap-1 md:w-8/12">
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white whitespace-nowrap">
                        Số dư:
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                          {...form.register("wallet.balance")}
                          readOnly
                        />
                      </FormControl>
                    </FormItem>

                    <FormItem className="grid grid-cols-[100px_1fr] items-center gap-1 md:w-8/12 ">
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white whitespace-nowrap">
                        Lịch sử số dư:
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
          <Dialog
            open={isPopupOpen}
            onOpenChange={(open) => {
              setIsPopupOpen(open);
              if (!open) {
                setShouldShowAlertDialog(false);
                formCharge.reset();
              }
            }}
          >
            <DialogTrigger asChild>
              {etag && etag.status === 1 && (
                <div className="flex justify-end mt-4">
                  <Button type="button" onClick={() => setIsPopupOpen(true)}>
                    Nạp Tiền
                  </Button>
                </div>
              )}
            </DialogTrigger>
            <DialogContent className="w-[600px] h-[500px] max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-bold text-center">
                  Nạp Tiền
                </DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  formCharge.handleSubmit(handleChargeMoney)(e);
                }}
              >
                {/* Grid layout with labels aligned to the left */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-6 p-6 items-center">
                  <label className="font-medium">Etag Code</label>
                  <Input
                    type="text"
                    {...formCharge.register("etagCode")}
                    readOnly
                  />

                  <label className="font-medium">Số Tiền (đ)</label>
                  <Input
                    type="number"
                    {...formCharge.register("chargeAmount")}
                    placeholder="Enter amount"
                    required
                  />

                  <label className="font-medium">CCCD</label>
                  <Input
                    type="text"
                    {...formCharge.register("cccdPassport")}
                    readOnly
                  />

                  <label className="font-medium">Phương thức thanh toán</label>
                  <Select
                    defaultValue={formCharge.getValues("paymentType")}
                    onValueChange={(value) =>
                      formCharge.setValue("paymentType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Payment Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Tiền mặt</SelectItem>
                      <SelectItem value="Momo">MoMo</SelectItem>
                      <SelectItem value="VnPay">VnPay</SelectItem>
                      <SelectItem value="PayOS">PayOs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Submit button aligned to the right */}
                <div className="flex justify-end mt-4 pr-6">
                  <Button type="submit">Submit</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsPopupOpen(false);
                      formCharge.reset();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>

              {/* Cancel button aligned with Submit button */}
              <div className="flex justify-end mt-2 pr-6 space-x-2"></div>
            </DialogContent>
          </Dialog>

          <AlertDialog
            open={isProcessingPopupOpen && shouldShowAlertDialog}
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
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Đơn hàng đang chờ xác nhận</AlertDialogTitle>
                <AlertDialogDescription>
                  Vui lòng xác nhận khi đã nhận được tiền mặt.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => {
                    setIsProcessingPopupOpen(false);
                    setPendingInvoiceId(null);
                  }}
                >
                  Hủy
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmPayment}
                  disabled={isConfirming || !pendingInvoiceId}
                >
                  {isConfirming ? "Đang xác nhận..." : "Xác nhận đã thanh toán"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </form>
      </Form>
      <div className="flex justify-end mt-6 pr-4 pb-4 space-x-4">
        {etag && etag.status === 0 && !isConfirming && (
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

export default EtagDetailPage;
