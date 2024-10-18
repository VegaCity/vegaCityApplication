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

const EtagDetailPage = ({ params }: EtagDetailPageProps) => {
  const { toast } = useToast();
  const [etag, setEtag] = useState<ETag | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isProcessingPopupOpen, setIsProcessingPopupOpen] = useState(false);
  const [pendingInvoiceId, setPendingInvoiceId] = useState<string | null>(null);
  const handleChargeMoney = async (data: {
    etagCode: any;
    chargeAmount: number;
    cccd: any;
    paymentType: string;
  }) => {
    try {
      if (
        !data.etagCode ||
        data.chargeAmount <= 0 ||
        !data.cccd ||
        !data.paymentType
      ) {
        toast({
          title: "Error",
          description:
            "Please provide all required fields and a valid charge amount.",
          variant: "destructive",
        });
        return;
      }

      const response = await ETagServices.chargeMoney({
        etagCode: data.etagCode,
        chargeAmount: data.chargeAmount,
        cccd: data.cccd,
        paymentType: data.paymentType,
      });

      if (response.status === 200) {
        const responseData = response.data;
        if (responseData && responseData.data) {
          const { urlDirect, key, invoiceId } = responseData.data;
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
            setIsProcessingPopupOpen(true);
          } else {
            await initiatePayment(data.paymentType, invoiceId);
          }
        } else {
          toast({
            title: "Error",
            description:
              "Invalid response structure from chargeMoney API. Please try again later.",
            variant: "destructive",
          });
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

  const initiatePayment = async (
    paymentMethod: string,
    invoiceId: string
    // key?: string
  ) => {
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
        setIsProcessingPopupOpen(false);
        setPendingInvoiceId(null);
        setTimeout(() => {
          window.location.reload();
        }, 3000);
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
      cccd: "",
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
      marketZone: {
        name: "",
        shortName: "",
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
      cccd: form.getValues("cccd"),
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
    return date.toISOString().slice(0, 16); // Format: "YYYY-MM-DDTHH:mm"
  };

  const formatDateTimeForDisplay = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString(); // Format: "M/D/YYYY, h:mm:ss AM/PM"
  };

  useEffect(() => {
    const fetchEtag = async () => {
      setIsLoading(true);
      try {
        const response = await ETagServices.getETagById(params.id);
        const etagData = response.data.data.etag;
        setEtag(etagData);
        form.reset({
          fullName: etagData.fullName.trim(),
          etagCode: etagData.etagCode.trim(),
          phoneNumber: etagData.phoneNumber.trim(),
          cccd: etagData.cccd.trim(),
          birthday: formatDateForInput(etagData.birthday),
          startDate: formatDateTimeForInput(etagData.startDate),
          endDate: formatDateTimeForInput(etagData.endDate),
          gender: etagData.gender.toString(),
          status: etagData.status,
          imageUrl: etagData.imageUrl,
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
        formCharge.reset({
          etagCode: etagData.etagCode,
          chargeAmount: 0,
          cccd: etagData.cccd.trim(),
          paymentType: "Cash",
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchEtag();
  }, [params.id, form]);

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
        cccd: formData.cccd,
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
              alt={etag.fullName || "Image"}
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>

          {/* Customer Information */}
          <h4 className="text-xl font-semibold mt-6 mb-4">
            Customer Information
          </h4>
          <div className="md:flex md:space-x-4 space-y-4 md:space-y-0">
            <FormItem className="md:w-1/2">
              <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                Full Name
              </FormLabel>
              <FormControl>
                <Input
                  className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                  {...form.register("fullName")}
                  readOnly={!isEditing}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem className="md:w-1/2">
              <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                Etag Code
              </FormLabel>
              <FormControl>
                <Input
                  className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                  {...form.register("etagCode")}
                  readOnly
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </div>

          <div className="md:flex md:space-x-4 space-y-4 md:space-y-0">
            <FormItem className="md:w-1/2">
              <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                Phone Number
              </FormLabel>
              <FormControl>
                <Input
                  className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                  {...form.register("phoneNumber")}
                  readOnly={!isEditing}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem className="md:w-1/2">
              <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                CCCD
              </FormLabel>
              <FormControl>
                <Input
                  className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                  {...form.register("cccd")}
                  readOnly={!isEditing}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </div>

          <div className="md:flex md:space-x-4 space-y-4 md:space-y-0 mb-11">
            <FormItem className="md:w-1/2">
              <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                Birthday
              </FormLabel>
              <FormControl>
                <Input
                  type="date"
                  className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                  {...form.register("birthday")}
                  readOnly={!isEditing}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem className="md:w-1/2">
                  <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
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
                      <SelectItem value="0">Female</SelectItem>
                      <SelectItem value="1">Male</SelectItem>
                      <SelectItem value="2">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* ETag Information */}
          <div className="mt-10">
            <h4 className="text-xl font-semibold mt-24 mb-4">
              ETag Information
            </h4>
            <div className="md:flex md:space-x-4 space-y-4 md:space-y-0 mt-6">
              <FormItem className="md:w-1/2">
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Start Date and Time
                </FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    {...form.register("startDate")}
                    readOnly={!isEditing}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>

              <FormItem className="md:w-1/2">
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  End Date and Time
                </FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    {...form.register("endDate")}
                    readOnly={!isEditing}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </div>

            <FormItem className="md:w-1/3">
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

          {/* ETag Type Information */}
          <h4 className="text-xl font-semibold mt-6 mb-4">
            ETag Type Information
          </h4>
          <div className="md:flex md:space-x-4 space-y-4 md:space-y-0">
            <FormItem className="md:w-1/2">
              <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                ETag Type Name
              </FormLabel>
              <FormControl>
                <Input
                  className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                  {...form.register("etagType.name")}
                  readOnly
                />
              </FormControl>
            </FormItem>

            <FormItem className="md:w-1/2">
              <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                Amount
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
          {/* Wallet Information */}
          <h4 className="text-xl font-semibold mt-16 mb-4">
            Wallet Information
          </h4>
          <div className="md:flex md:space-x-4 space-y-4 md:space-y-0">
            <FormItem className="md:w-1/2">
              <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
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
            <FormItem className="md:w-1/2">
              <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                Balance History
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
          <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
            <DialogTrigger asChild>
              <Button>Charge Money</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Charge Money</DialogTitle>
                <DialogDescription>
                  Enter the necessary details to charge money.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={formCharge.handleSubmit(handleChargeMoney)}>
                <div className="space-y-4">
                  <label>Etag Code</label>
                  <Input
                    type="text"
                    {...formCharge.register("etagCode")}
                    readOnly
                  />

                  <label>Amount</label>
                  <Input
                    type="number"
                    {...formCharge.register("chargeAmount")}
                    placeholder="Enter amount"
                    required
                  />

                  <label>CCCD</label>
                  <Input
                    type="text"
                    {...formCharge.register("cccd")}
                    readOnly
                  />

                  <label>Payment Type</label>
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
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Momo">MoMo</SelectItem>
                      <SelectItem value="VnPay">VnPay</SelectItem>
                      <SelectItem value="PayOS">PayOs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end mt-4 space-x-2">
                  <Button type="submit">Submit</Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsPopupOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <AlertDialog
            open={isProcessingPopupOpen}
            onOpenChange={(open) => {
              if (!open) {
                setPendingInvoiceId(null);
              }
              setIsProcessingPopupOpen(open);
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
          {/* Popup charge money */}
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
