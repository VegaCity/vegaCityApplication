"use client";

import BackButton from "@/components/BackButton";
import { PackageServices } from "@/components/services/Package/packageServices";
import { WalletTypesServices } from "@/components/services/User/walletTypesServices";
import { ZoneServices } from "@/components/services/zoneServices";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import handleImageFileChange from "@/components/uploadImageToFirebaseStorage/UploadImage";
import {
  CreatePackageFormValues,
  createPackageFormSchema,
} from "@/lib/validation";
import { PackageTypesEnum } from "@/types/packageType/package";
import { GetWalletType } from "@/types/walletType/walletType";
import { Zone } from "@/types/zone/zone";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { Camera, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const PackageCreatePage = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [walletTypes, setWalletTypes] = useState<GetWalletType[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZones, setSelectedZones] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedWalletType, setSelectedWalletType] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  //handleImage from local
  const [imageUploaded, setImageUploaded] = useState<string | null>("");

  const form = useForm<CreatePackageFormValues>({
    resolver: zodResolver(createPackageFormSchema),
    defaultValues: {
      type: "",
      imageUrl: null,
      name: "",
      description: "",
      price: 0,
      duration: 0,
      zoneId: "",
      walletTypeId: "",
      moneyStart: 0,
    },
  });

  //Package Type
  interface PackageType {
    name: string;
    value: string;
  }

  const packageTypes: PackageType[] = [
    {
      name: "Specific Package",
      value: PackageTypesEnum[0],
    },
    {
      name: "Service Package",
      value: PackageTypesEnum[1],
    },
  ];
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching Package types...");
        const [walletTypeRes, zoneRes] = await Promise.all([
          WalletTypesServices.getWalletTypes({ page: 1, size: 10 }),
          ZoneServices.getZones({ page: 1, size: 10 }),
        ]);

        // Check isArray and set
        const walletTypes: GetWalletType[] = Array.isArray(
          walletTypeRes.data.data
        )
          ? walletTypeRes.data.data
          : [];

        const zones = Array.isArray(zoneRes.data.data) ? zoneRes.data.data : [];

        const filterWalletTypes = walletTypes.filter(
          ({ name }) => name === "ServiceWallet" || name === "SpecificWallet"
        );
        console.log(filterWalletTypes, "filterWalletTypes");
        setZones(zones);
        setWalletTypes(filterWalletTypes); // Lưu danh sách

        console.log("walletTypes set:", walletTypes);
      } catch (err) {
        console.error("Error fetching Package types", err);
        if (err instanceof Error) {
          console.error("Error message:", err.message);
          console.error("Error stack:", err.stack);
        }
        // toast({
        //   title: "Error",
        //   description: "Failed to fetch Package types. Please try again.",
        //   variant: "destructive",
        // });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTypes();
  }, [toast]);

  const handleTypeChange = async (type: "zone" | "walletType", id: string) => {
    console.log(id, "onchange");
    try {
      if (type === "zone") {
        const res = await ZoneServices.getZoneById(id);
        setSelectedZones(res.data.data);
        console.log(res.data, "res zone");
        form.setValue("zoneId", res.data.data.id);
      } else if (type === "walletType") {
        const res = await WalletTypesServices.getWalletTypeById(id);
        setSelectedWalletType(res.data.data);
        form.setValue("walletTypeId", res.data.data.id);
      }
    } catch (err) {
      console.error("Error fetching Package type details", err);
      toast({
        title: "Error",
        description: "Failed to fetch Package type details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePackageTypeAndGetValueToWalletType = (pkgType: string) => {
    if (pkgType === PackageTypesEnum[0]) {
    }
  };

  const handleSubmit = async (data: CreatePackageFormValues) => {
    const { type, walletTypeId, ...rest } = data;
    setIsSubmitting(true);
    try {
      // Tạo package và lấy packageId
      const packageResponse = await PackageServices.uploadPackage({
        ...data,
        imageUrl: imageUploaded,
      });
      console.log("Package response:", packageResponse);
      // const packageId = packageResponse?.data?.data?.packageId;
      // try {
      //   const etagTypeResponse = await ETagTypeServices.addEtagTypeToPackage({
      //     etagTypeId: data.etagTypeId,
      //     packageId: packageId,
      //     quantityEtagType: data.quantityEtagType,
      //   });
      // } catch (error) {
      //   console.error("Error adding ETag Type to package:", error);
      // }

      toast({
        variant: "success",
        title: "Success",
        description: `Package "${data.name}" created successfully!`,
      });

      router.back();
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({
          title: "Error",
          description:
            error.response?.data?.Error || "Failed to create package!",
          variant: "destructive",
        });
        console.error("Error:", error.message);
      } else {
        toast({
          title: "Error",
          description: "Something went wrong!",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <BackButton text="Back To Packages" link="/admin/packages" />
      {/* Title */}
      {/* Body Container */}
      <div className="max-w-7xl px-10">
        <div className="mb-2">
          <h4 className="text-2xl font-semibold text-zinc-700 dark:text-white">
            Package Information
          </h4>
          <p className="text-md text-zinc-500 dark:text-zinc-400">
            Provide details about package.
          </p>
        </div>
        {isLoading ? (
          <p>Loading Package Types...</p>
        ) : (
          <Card className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-lg border-2">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-6 max-w-full mx-auto"
              >
                {/* Div Container */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md space-y-4">
                    {/* Package Name */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter package name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Package Type */}
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                if (value === PackageTypesEnum[0]) {
                                  // Specific Package
                                  form.setValue(
                                    "walletTypeId",
                                    "2b346fba-8dac-44ff-98d8-9950777355cb"
                                  );
                                } else if (value === PackageTypesEnum[1]) {
                                  form.setValue(
                                    "walletTypeId",
                                    "21790e2a-85dd-48ba-acec-e9b70ef1fc90"
                                  );
                                }
                              }}
                              value={field.value}
                              disabled={isLoading}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select an package type" />
                              </SelectTrigger>
                              <SelectContent>
                                {isLoading ? (
                                  <SelectItem value="loading" disabled>
                                    Loading Package Types...
                                  </SelectItem>
                                ) : packageTypes.length > 0 ? (
                                  packageTypes.map((pkgType) => (
                                    <SelectItem
                                      key={pkgType.value}
                                      value={pkgType.value}
                                    >
                                      {pkgType.name}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="no-pkgs" disabled>
                                    No Package Types available
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Zone */}
                    <FormField
                      control={form.control}
                      name="zoneId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Zone</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                handleTypeChange("zone", value);
                              }}
                              value={field.value}
                              disabled={isLoading}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Zone" />
                              </SelectTrigger>
                              <SelectContent>
                                {isLoading ? (
                                  <SelectItem value="loading" disabled>
                                    Loading zones...
                                  </SelectItem>
                                ) : zones.length > 0 ? (
                                  zones.map((zone) => (
                                    <SelectItem key={zone.id} value={zone.id}>
                                      {zone.name}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="no-zones" disabled>
                                    No Zone Types available
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Image URL */}
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                            Image URL
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/*"
                              className=" w-30 bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                              placeholder="Enter Image URL"
                              onChange={(event) =>
                                handleImageFileChange({
                                  event: event,
                                  setImageUploaded: setImageUploaded,
                                })
                              } // Convert empty string back to null if needed
                            />
                          </FormControl>
                          {imageUploaded ? (
                            <div className="relative">
                              <Image
                                className="relative"
                                src={imageUploaded || field.value || ""}
                                alt={field.value || "image"}
                                width={350}
                                height={250}
                                // onLoadingComplete={() => setIsLoadingImageUpload(false)} // Set loading to false when loading completes
                              />
                              {/* Delete image */}
                              <div className="absolute top-1 left-1">
                                <X
                                  size={30}
                                  className="text-red-600 bg-red-400 p-2 cursor-pointer"
                                  onClick={() => {
                                    setImageUploaded("");
                                    field.onChange(null);
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center w-2/3  p-6 border-2 border-dashed border-slate-300 text-slate-300">
                              <Camera size={30} />
                              Image unavailable
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Description */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter package description"
                              onChange={(event) => field.onChange(event)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Card>
                  <Card className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md space-y-4">
                    {/* Price */}
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price(VND)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="text"
                                placeholder="Enter Price"
                                value={
                                  field.value?.toLocaleString("vi-VN") ?? 0
                                }
                                onChange={(e) => {
                                  //convert string to number
                                  const input = e.target.value;
                                  const numericValue = parseFloat(
                                    input.replace(/[.]/g, "")
                                  );
                                  console.log(numericValue, "numericValue");
                                  field.onChange(numericValue || 0);

                                  let moneyStartValue = 0;
                                  //numericValue become null when erase to the last value
                                  if (Number.isNaN(numericValue)) {
                                    form.setValue("moneyStart", 0);
                                  } else {
                                    moneyStartValue = numericValue * 0.2;
                                    //Bonus 20% from Price to Money Start
                                    form.setValue(
                                      "moneyStart",
                                      numericValue + moneyStartValue
                                    );
                                  }
                                }}
                              />
                              <span className="absolute inset-y-0 right-2 flex items-center text-gray-400 pointer-events-none">
                                VND
                              </span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Duration */}
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration(day)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="number"
                                placeholder="Enter duration"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e.target.valueAsNumber);
                                }}
                              />
                              <span className="absolute inset-y-0 right-2 flex items-center text-gray-400 pointer-events-none">
                                day
                              </span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Wallet Type */}
                    <FormField
                      control={form.control}
                      name="walletTypeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Wallet Type</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                // handleTypeChange("walletType", value);
                              }}
                              value={field.value}
                              disabled={true}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select an Wallet Type" />
                              </SelectTrigger>
                              <SelectContent>
                                {isLoading ? (
                                  <SelectItem value="loading" disabled>
                                    Loading Wallet Types...
                                  </SelectItem>
                                ) : walletTypes.length > 0 ? (
                                  walletTypes.map((wallet) => (
                                    <SelectItem
                                      key={wallet.id}
                                      value={wallet.id}
                                    >
                                      {wallet.name}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="no-wallets" disabled>
                                    No Wallet Types available
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Money Start */}
                    <FormField
                      control={form.control}
                      name="moneyStart"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Money Start(VND)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="text"
                                placeholder="Enter Money Start"
                                value={
                                  field.value?.toLocaleString("vi-VN") ?? 0
                                }
                                onChange={(e) => {
                                  //convert string to number
                                  const input = e.target.value;
                                  const numericValue = parseFloat(
                                    input.replace(/[.]/g, "")
                                  );
                                  field.onChange(numericValue || 0);
                                }}
                              />
                              <span className="absolute inset-y-0 right-2 flex items-center text-gray-400 pointer-events-none">
                                VND
                              </span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Card>
                </div>
                <div className="mt-4 grid justify-items-end">
                  <Button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Creating..."
                    ) : (
                      <>
                        <Upload /> <p>Create</p>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </Card>
        )}
      </div>
    </>
  );
};

export default PackageCreatePage;
