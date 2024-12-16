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
  PackageItemEditPageProps,
  formSchema,
  FormValues,
} from "@/lib/validation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SearchPackageItem from "@/components/search/searchPackageItem";
import { FileText, CircleHelp } from "lucide-react";
import ReportDialog from "@/lib/dialog/ReportDialog";
import { PromotionAlert } from "@/components/Promotion/PromotionAlert";
import TransactionWithdrawList from "@/components/transactions/TransactionWithdrawList";
const PackageItemEditPage = ({ params }: PackageItemEditPageProps) => {
  const { toast } = useToast();
  const [packageItem, setPackageItem] = useState<PackageItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cusName: "",
      cusEmail: "",
      cusCccdpassport: "",
      phoneNumber: "",
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
      const etagId = params?.id || localStorage.getItem("packageItemId");

      // Kiểm tra xem có etagId không
      if (!etagId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await PackageItemServices.getPackageItemById({
          id: etagId,
        });
        const packageitemData = response.data?.data;

        // Cập nhật dữ liệu khi có kết quả
        setPackageItem(packageitemData);

        if (!packageitemData) {
          throw new Error("No etag data received");
        }

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
          wallets: [
            {
              balance: packageitemData.wallets[0]?.balance || 0,
              balanceHistory: packageitemData.wallets[0]?.balanceHistory || 0,
            },
          ],
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
  }, [params?.id, form, toast]); // Lắng nghe sự thay đổi của params?.id

  const handleUpdate = async () => {
    if (!packageItem) return;

    try {
      setIsLoading(true);
      let updatedData = form.getValues();

      const response = await PackageItemServices.editInfoPackageItem(
        packageItem.id,
        updatedData
      );

      const messageResponse = response.data.messageResponse;
      toast({
        title: "Success",
        description: messageResponse,
      });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      setIsEditing(false);
      setIsUpdated(true);
      setPackageItem((prev) => (prev ? { ...prev, ...updatedData } : null));
    } catch (err) {
      if (err instanceof Error) {
        const errorMessage = (err as any).response?.data?.Error;
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        console.error("Unexpected error:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) {
    return (
      <div>
        <SearchPackageItem />
        <div className="text-center mt-4 text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!packageItem) {
    return <SearchPackageItem />;
  }

  return (
    <>
      <Form {...form}>
        <form className={`space-y-4`}>
          <Card className="w-full max-w-5xl mx-auto p-4 md:p-6">
            <PromotionAlert />
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="text-xl md:text-2xl">
                  VCard Detail
                </CardTitle>

                <Button
                  type="button"
                  onClick={() => {
                    setIsEditing(!isEditing);
                  }}
                  className="w-full sm:w-auto"
                >
                  {isEditing ? "Cancel Edit" : "Edit"}
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-8 md:space-y-12">
                {/* Promotion Information */}

                {/* Customer Information */}
                <section className="space-y-4">
                  <h4 className="text-lg font-semibold mb-4">
                    Customer Information
                  </h4>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <FormItem className="space-y-2">
                        <FormLabel className="block uppercase text-xs font-bold text-zinc-500 dark:text-white">
                          FullName
                        </FormLabel>
                        <FormControl>
                          <Input
                            className={`w-full border border-gray-300 text-black rounded-md focus:border-black focus:ring focus:ring-black/50 dark:bg-slate-500 dark:text-white 
              ${packageItem?.isChangedInfo ? "bg-slate-100" : "bg-white"}`}
                            {...form.register("cusName")}
                            readOnly={!isEditing}
                          />
                        </FormControl>
                      </FormItem>

                      <FormItem className="space-y-2">
                        <FormLabel className="block uppercase text-xs font-bold text-zinc-500 dark:text-white">
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            className={`w-full border border-gray-300 text-black rounded-md focus:border-black focus:ring focus:ring-black/50 dark:bg-slate-500 dark:text-white 
              ${packageItem?.isChangedInfo ? "bg-slate-100" : "bg-white"}`}
                            {...form.register("cusEmail")}
                            readOnly={!isEditing}
                          />
                        </FormControl>
                      </FormItem>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <FormItem className="space-y-2">
                        <FormLabel className="block uppercase text-xs font-bold text-zinc-500 dark:text-white">
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            className={`w-full border border-gray-300 text-black rounded-md focus:border-black focus:ring focus:ring-black/50 dark:bg-slate-500 dark:text-white 
              ${packageItem?.isChangedInfo ? "bg-slate-100" : "bg-white"}`}
                            {...form.register("phoneNumber")}
                            readOnly={!isEditing}
                          />
                        </FormControl>
                      </FormItem>

                      <FormItem className="space-y-2">
                        <FormLabel className="block uppercase text-xs font-bold text-zinc-500 dark:text-white">
                          CCCD/Passport
                        </FormLabel>
                        <FormControl>
                          <Input
                            className={`w-full border border-gray-300 text-black rounded-md focus:border-black focus:ring focus:ring-black/50 dark:bg-slate-500 dark:text-white 
              ${packageItem?.isChangedInfo ? "bg-slate-100" : "bg-white"}`}
                            {...form.register("cusCccdpassport")}
                            readOnly={!isEditing}
                          />
                        </FormControl>
                      </FormItem>
                    </div>
                  </div>
                </section>

                {/* Duration Information */}
                <section className="space-y-4">
                  <h4 className="text-lg font-semibold mb-4">
                    Duration Information
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <FormItem className="space-y-2">
                      <FormLabel className="block uppercase text-xs font-bold text-zinc-500 dark:text-white">
                        Start Date
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="w-full bg-slate-100 border border-gray-300 text-black rounded-md focus:border-black focus:ring focus:ring-black/50 dark:bg-slate-500 dark:text-white"
                          value={formatDateTimeForDisplay(
                            form.getValues("startDate")
                          )}
                          readOnly
                        />
                      </FormControl>
                    </FormItem>

                    <FormItem className="space-y-2">
                      <FormLabel className="block uppercase text-xs font-bold text-zinc-500 dark:text-white">
                        End Date
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="w-full bg-slate-100 border border-gray-300 text-black rounded-md focus:border-black focus:ring focus:ring-black/50 dark:bg-slate-500 dark:text-white"
                          value={formatDateTimeForDisplay(
                            form.getValues("endDate")
                          )}
                          readOnly
                        />
                      </FormControl>
                    </FormItem>
                  </div>
                </section>

                {/* Wallet Information */}
                <section className="space-y-4">
                  <h4 className="text-lg font-semibold mb-4">
                    Wallet Information
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <FormItem className="space-y-2">
                      <FormLabel className="block uppercase text-xs font-bold text-zinc-500 dark:text-white">
                        Balance
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="w-full bg-slate-100 border border-gray-300 text-black rounded-md focus:border-black focus:ring focus:ring-black/50 dark:bg-slate-500 dark:text-white"
                          {...form.register("wallets.0.balance")}
                          readOnly
                        />
                      </FormControl>
                    </FormItem>

                    <FormItem className="space-y-2">
                      <FormLabel className="block uppercase text-xs font-bold text-zinc-500 dark:text-white">
                        Balance History
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="w-full bg-slate-100 border border-gray-300 text-black rounded-md focus:border-black focus:ring focus:ring-black/50 dark:bg-slate-500 dark:text-white"
                          {...form.register("wallets.0.balanceHistory")}
                          readOnly
                        />
                      </FormControl>
                    </FormItem>
                  </div>
                </section>

                {isEditing && (
                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={() => {
                        handleUpdate();
                      }}
                      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                    >
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <ReportDialog
            isOpen={isReportDialogOpen}
            onClose={() => setIsReportDialogOpen(false)}
            packageId={params?.id}
          />
          <div className="fixed bottom-6 sm:bottom-8 md:bottom-16 right-6 sm:right-8 md:right-16">
            <Button
              onClick={() => setIsReportDialogOpen(true)}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg flex items-center justify-center group transition-all duration-300 hover:scale-110"
            >
              <CircleHelp className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              <span className="absolute right-20 sm:right-24 bg-gray-800 text-white px-2 py-1 rounded text-sm sm:text-base opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                Report
              </span>
            </Button>
          </div>
        </form>
      </Form>

      <TransactionWithdrawList packageItemId={params.id} />
    </>
  );
};

export default PackageItemEditPage;
