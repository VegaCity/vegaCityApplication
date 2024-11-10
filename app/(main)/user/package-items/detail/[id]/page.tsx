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
  const [isChildrenVCardDialogOpen, setIsChildrenVCardDialogOpen] =
    useState(false);
  const childrenVCardForm = useForm({
    defaultValues: {
      quantity: 1,
      packageItemId: "",
    },
  });

  // Cập nhật form khi component mount
  useEffect(() => {
    if (packageItem) {
      childrenVCardForm.reset({
        quantity: 1,
        packageItemId: localStorage.getItem("packageItemId") || "",
      });
    }
  }, [packageItem, childrenVCardForm]);
  const handleGenerateChildrenVCard = async (data: any) => {
    try {
      setIsLoading(true);

      const generateData = {
        packageItemId: data.packageItemId,
        quantity: data.quantity,
      };

      // Gọi API để generate children VCards
      const response = await PackageItemServices.generatePackageItemForChild(
        generateData.quantity
      );

      if (response.status === 201) {
        toast({
          title: "Success",
          description: `Successfully generated ${data.quantity} children VCards`,
        });
        setIsChildrenVCardDialogOpen(false);
        childrenVCardForm.reset();

        // Tùy chọn: refresh page hoặc cập nhật UI
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error("Error generating children VCards:", error);
      toast({
        title: "Error",
        description: "Failed to generate children VCards",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleChargeMoney = async (data: {
    packageItemId: string;
    chargeAmount: number;
    cccdpassport: any;
    paymentType: string;
  }) => {
    try {
      setIsLoading(true);
      const response = await PackageItemServices.chargeMoney({
        packageItemId: params.id,
        chargeAmount: data.chargeAmount,
        cccdPassport: data.cccdpassport,
        paymentType: data.paymentType,
        promoCode: "",
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
        const response = await PackageItemServices.getPackageItemById(
          params.id
        );
        const packageitemData = response.data?.data;
        console.log(packageitemData, "packageitemData");
        setPackageItem(packageitemData);
        localStorage.setItem("packageItemId", packageitemData.id);
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
      <h3 className="text-2xl mb-4">Etag Detail</h3>

      <Form {...form}>
        <form className="space-y-4">
          <div className="relative w-full h-48">
            <Image
              src={packageItem?.imageUrl ?? ""}
              alt={"Image"}
              layout="fill"
              objectFit="cover"
              className="rounded-lg justify-center items-center"
            />
          </div>

          <Card className="w-full max-w-5xl mx-auto">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>VCard Detail</CardTitle>
                {packageItem &&
                  packageItem.status === "Active" &&
                  packageItem.isAdult === true && (
                    <Button
                      type="button"
                      onClick={() => setIsChildrenVCardDialogOpen(true)}
                      variant="outline"
                    >
                      Generate Children VCard
                    </Button>
                  )}
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
                      {/* <FormItem className="grid grid-cols-[100px_1fr] items-center gap-1 md:w-10/12">
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
                      </FormItem> */}

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
                    <FormItem className="grid grid-cols-[120px_1fr] items-center gap-1 md:w-9/12">
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
                    <FormItem className="grid grid-cols-[120px_1fr] items-center gap-1 md:w-9/12">
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
                    <FormItem className="grid grid-cols-[120px_1fr] items-center gap-1 md:w-8/12">
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

          <Dialog
            open={isChildrenVCardDialogOpen}
            onOpenChange={(open) => {
              setIsChildrenVCardDialogOpen(open);
              if (!open) {
                childrenVCardForm.reset({
                  quantity: 1,
                  packageItemId: localStorage.getItem("packageItemId") || "",
                });
              }
            }}
          >
            <DialogContent className="w-[500px] max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-bold text-center">
                  Generate Children VCards
                </DialogTitle>
                <DialogDescription className="text-center">
                  Specify how many children VCards you want to generate
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={childrenVCardForm.handleSubmit(
                  handleGenerateChildrenVCard
                )}
              >
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Quantity</FormLabel>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      {...childrenVCardForm.register("quantity")}
                      className="col-span-3"
                      placeholder="Number of children VCards"
                    />
                  </div>

                  {/* Hidden inputs for required data */}

                  <Input
                    type="hidden"
                    {...childrenVCardForm.register("packageItemId")}
                  />
                </div>

                <DialogFooter className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsChildrenVCardDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Generating..." : "Generate"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
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
              {packageItem &&
                packageItem.status === "Active" &&
                packageItem.wallet.walletType.name === "ServiceWallet" && (
                  <div className="flex justify-end mt-4">
                    <Button type="button" onClick={() => setIsPopupOpen(true)}>
                      Charge Money
                    </Button>
                  </div>
                )}
            </DialogTrigger>
            <DialogContent className="w-[600px] h-[400px] max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-bold text-center">
                  Charge Money
                </DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  formCharge.handleSubmit(handleChargeMoney)(e);
                }}
              >
                <div className="grid grid-cols-2 gap-x-4 gap-y-6 p-6 items-center">
                  <label className="font-medium">Amount (đ)</label>
                  <Input
                    type="number"
                    {...formCharge.register("chargeAmount")}
                    placeholder="Enter amount"
                    required
                  />

                  <label className="font-medium">CCCD/Passport</label>
                  <Input
                    type="text"
                    {...formCharge.register("cccdpassport")}
                    readOnly
                  />

                  <label className="font-medium">Payment Type</label>
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

                  <label className="font-medium">Promo Code (Optional)</label>
                  <Input
                    type="text"
                    {...formCharge.register("promoCode")}
                    placeholder="Enter promo code"
                  />
                </div>

                <div className="flex justify-end gap-2 mt-4 pr-6">
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
                <AlertDialogTitle>Order Processing</AlertDialogTitle>
                <AlertDialogDescription>
                  Please wait for the order to be processed
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => {
                    setIsProcessingPopupOpen(false);
                    setPendingInvoiceId(null);
                  }}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmPayment}
                  disabled={isConfirming || !pendingInvoiceId}
                >
                  {isConfirming ? "Confirming..." : "Confirm Payment"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
