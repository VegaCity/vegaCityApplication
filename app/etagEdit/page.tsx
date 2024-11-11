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
  PackageItemEditPageProps,
  formSchema,
  FormValues,

  PackageItemDetailPageProps,
} from "@/lib/validation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PackageItemEditPage = ({ params }: PackageItemEditPageProps) => {
  const { toast } = useToast();
  const [packageItem, setPackageItem] = useState<PackageItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  ;
  const DEV_CONFIG = {
    DEMO_ETAG_ID: "3fc971d3-5404-4a7b-af92-c28dc472512a",
    IS_DEVELOPMENT: true,
  };


  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
      gender: "" as "Male" | "Female" | "Other" | undefined,
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
      const etagId = DEV_CONFIG.IS_DEVELOPMENT
        ? DEV_CONFIG.DEMO_ETAG_ID
        : params?.id;
      if (!etagId) {
        setError("No ID provided");
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const response = await PackageItemServices.getPackageItemById(
          etagId
        );
        const packageitemData = response.data?.data;
        console.log(packageitemData, "packageitemData");
        setPackageItem(packageitemData);
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
  }, [params?.id, form, toast]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      await PackageItemServices.editInfoPackageItem(packageItem?.id!, {
        name: values.name,
        gender: values.gender,
        imageUrl: values.imageUrl || null,
      });
      setIsEditing(false);
      toast({
        title: 'Package Item Updated',
        description: 'The package item has been updated successfully.',
        variant: 'default',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update the package item.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <BackButton text="Back To Etag List" link="/user/package-items" />
      <h3 className="text-2xl mb-4">Vcard Detail</h3>

      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
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
                            readOnly
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
                          readOnly
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
                                <SelectItem value="Femal">Female</SelectItem>
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
          <div className="flex justify-end space-x-2">
            {isEditing ? (
              <>
                <Button type="button" onClick={form.handleSubmit(handleSubmit)} disabled={isLoading}>
                  Save
                </Button>
                <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isLoading}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)} disabled={isLoading}>
                Edit
              </Button>
            )}
          </div>

        </form>
      </Form>

    </>
  );
};

export default PackageItemEditPage;
