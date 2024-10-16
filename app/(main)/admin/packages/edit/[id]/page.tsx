"use client";

import BackButton from "@/components/BackButton";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import posts from "@/data/posts";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { PackageServices } from "@/components/services/packageServices";
import { register } from "module";
import { Package } from "@/types/package";
import Image from "next/image";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required",
  }),
  imageUrl: z.string().min(1, {
    message: "Image Url is required",
  }),
  description: z.string().min(1, {
    message: "Description is required",
  }),
  price: z.coerce
    .number({
      required_error: "Price is required!",
      invalid_type_error: "Price must be a number!",
    })
    .refine((value) => value > 0 && value <= 10000000, {
      message: "Price must be above zero and less than 10.000.000VND!",
    }),
  startDate: z.string().min(1, {
    message: "Date is required",
  }),
  endDate: z.string().min(1, {
    message: "Date is required",
  }),
});

interface PackageEditPageProps {
  params: {
    id: string;
  };
}

type FormValues = z.infer<typeof formSchema>;

const PackageEditPage = ({ params }: PackageEditPageProps) => {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [uploadImage, setUploadImage] = useState<string | null>("");

  // const pkg = packageList.find((pkg) => pkg.id === params.id);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
      description: "",
      price: 1,
      startDate: "",
      endDate: "",
    },
  });

  const handleSubmit = async (data: FormValues) => {
    try {
      // Assuming you have an update method in PackageServices
      console.log(data, "dataaaaaa");
      await PackageServices.editPackage(params.id, data);
      toast({
        title: "Package has been updated successfully",
        description: `Package ${data.name} was updated with price ${data.price} VND`,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    }
  };

  useEffect(() => {
    const fetchPackageData = async () => {
      setIsLoading(true);
      try {
        const response = await PackageServices.getPackageById(params.id);
        const pkgData: Package = response.data.data.package;
        if (pkgData) {
          setPackageData(pkgData);
          if (
            pkgData?.packageETagTypeMappings &&
            pkgData?.packageETagTypeMappings.length > 0
          ) {
            const etagTypeMapping =
              pkgData?.packageETagTypeMappings?.length > 0
                ? pkgData.packageETagTypeMappings[0]
                : undefined;
            console.log(etagTypeMapping, "etagTypeMappingggg");

            if (
              etagTypeMapping &&
              etagTypeMapping.etagType &&
              etagTypeMapping?.etagTypeId
            ) {
              const etagId = etagTypeMapping?.etagType.id;
              localStorage.setItem("etagTypeId", etagId);
              console.log("EtagTypeId stored in localStorage:", etagId);
            } else {
              console.warn("EtagType or its ID is missing in the package data");
              setError(
                "EtagType information is incomplete. Please check the package configuration."
              );
            }
          } else {
            console.warn(
              "No packageETagTypeMappings found in the package data"
            );
            setError(
              "No E-Tag type information found for this package. Please check the package configuration."
            );
          }
        } else {
          throw new Error("Package data is missing in the response");
        }
      } catch (err) {
        console.error("Error fetching package data:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An unknown error occurred while fetching package data"
        );
        toast({
          title: "Error",
          description: "Failed to load package data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPackageData();
  }, [params.id]);
  // useEffect(() => {
  //   setIsLoading(true);
  //   const fetchPackages = async () => {
  //     try {
  //       setIsLoading(true);
  //       const response = await PackageServices.getPackageById(params.id);
  //       const pkgData = response.data.data.package;
  //       console.log(pkgData, "Get package by Id"); // Log the response for debugging
  //       if (pkgData) {
  //         form.reset({
  //           name: pkgData.name,
  //           imageUrl: pkgData.imageUrl,
  //           description: pkgData.description,
  //           price: pkgData.price,
  //           startDate: pkgData.startDate,
  //           endDate: pkgData.endDate,
  //         });
  //       }
  //     } catch (err) {
  //       setError(
  //         err instanceof Error ? err.message : "An unknown error occurred"
  //       );
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchPackages();
  // }, [params.id, form]);

  // Only then check for loading or error state | return must be below useEffect
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  console.log(packageData, "package Dataaa");
  return (
    <>
      <BackButton text="Back To Packages" link="/admin/packages" />
      <h3 className="text-2xl mb-4">Edit Package</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Package Name
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter Package Name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Uploade Image
                </FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Upload image"
                    {...field}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        const fileName = file.name;

                        reader.onloadend = () => {
                          // const imageDataUrl: ArrayBuffer | string | null = reader.result;
                          setUploadImage(reader.result as string); // Save the image data to state
                          field.onChange(""); // Update the form field with the file name
                        };

                        reader.readAsDataURL(file); // Read the file as a data URL (base64)
                        console.log(`File name: ${fileName}`);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Image Preview */}
          {uploadImage && (
            <div className="image-preview">
              <Image
                src={uploadImage}
                alt="Image Preview"
                width={450}
                height={350}
              />
            </div>
          )}

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Description
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter Description"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Price
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter Price"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Start Date
                </FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter Date"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  End Date
                </FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter Date"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="w-full dark:bg-slate-800 dark:text-white">
            Update Package
          </Button>
        </form>
      </Form>
    </>
  );
};

export default PackageEditPage;
