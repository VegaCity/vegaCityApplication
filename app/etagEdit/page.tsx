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
import { ETagServices } from "@/components/services/packageItemService";
import { ETag } from "@/types/packageitem";
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
import {
  formSchema,
  FormValues,
  EtagDetailPageProps,
  EtagEditPageProps,
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
import { confirmOrder } from "@/components/services/orderuserServices";
import { AlertDialogAction } from "@radix-ui/react-alert-dialog";
import { ConfirmOrderData } from "@/types/paymentFlow/orderUser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
const EtagEditPage = ({ params }: EtagEditPageProps) => {
  const { toast } = useToast();
  const [etag, setEtag] = useState<ETag | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const DEV_CONFIG = {
    DEMO_ETAG_ID: "1d8f7fc6-0634-486a-9238-ec56b7aaa50e",
    IS_DEVELOPMENT: true,
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
      const etagId = DEV_CONFIG.IS_DEVELOPMENT
        ? DEV_CONFIG.DEMO_ETAG_ID
        : params?.id;

      if (!etagId) {
        throw new Error("No ETag ID available");
      }

      try {
        setIsLoading(true);
        const response = await ETagServices.getETagById(etagId);
        const etagData = response.data?.data?.etag;

        if (!etagData) {
          throw new Error("No etag data received");
        }

        const etagDetails = etagData.etagDetail;
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
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const validImageUrl =
    etag.imageUrl && etag.imageUrl.startsWith("http")
      ? etag.imageUrl
      : "/default-image.png";
  return (
    <>
      {/* <BackButton text="Back To Etag List" link="/user/etags" /> */}
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
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleActivateEtag}
            >
              {isEditing ? "Save" : "Edit"}
            </Button>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default EtagEditPage;
