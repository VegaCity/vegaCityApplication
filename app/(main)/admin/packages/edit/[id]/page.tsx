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
import { PackageServices } from "@/components/services/Package/packageServices";
import { register } from "module";
import { Package } from "@/types/packageType/package";
import Image from "next/image";

//firebase
import getConfig from "next/config";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { EditPackageFormValues, editPackageFormSchema } from "@/lib/validation";
import { useRouter } from "next/navigation";
import handleImageFileChange from "@/components/uploadImageToFirebaseStorage/UploadImage";
import { validImageUrl } from "@/lib/utils/checkValidImageUrl";
import { Upload } from "lucide-react";

interface PackageEditPageProps {
  params: {
    id: string;
  };
}

const PackageEditPage = ({ params }: PackageEditPageProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [imageUploaded, setImageUploaded] = useState<string | null>("");

  // const pkg = packageList.find((pkg) => pkg.id === params.id);
  const form = useForm<EditPackageFormValues>({
    resolver: zodResolver(editPackageFormSchema),
    defaultValues: {
      name: "",
      imageUrl: null,
      description: "",
      price: 1,
      duration: 1,
    },
  });

  const uploadImage = async (file: File) => {
    const storage = getStorage();
    const storageRef = ref(storage, `images/${file.name}`);

    try {
      // Upload the file
      await uploadBytes(storageRef, file);
      // Get the download URL after upload on firebase storage
      const imageUrl = await getDownloadURL(storageRef);
      setImageUploaded(imageUrl); //set image to display on UI
      return imageUrl; // Return the URL for use
    } catch (error) {
      console.error("Upload failed:", error);
      return null;
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      const imageUrl = await uploadImage(file); // Upload and get the URL
      // You can then use this URL to display the image
      console.log("Image uploaded:", imageUrl);
    }

    // setIsLoadingImageUpload(false);

    // setSelectedFile(file);
    console.log(file, "handleFileChangeee");
  };

  const handleSubmit = async (data: EditPackageFormValues) => {
    try {
      // Assuming you have an update method in PackageServices
      console.log(data, "dataaaaaa");
      await PackageServices.editPackage(params.id, {
        ...data,
        imageUrl: imageUploaded,
      });
      toast({
        variant: "success",
        title: "Package has been updated successfully",
        description: `Package ${data.name} was updated with price ${data.price} VND`,
      });
      router.back();
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
        console.log(response.data.data, "Get package details");
        const pkgData: Package = response.data.data;
        setPackageData(pkgData);
        if (pkgData) {
          form.reset({
            name: pkgData.name,
            imageUrl: pkgData.imageUrl,
            description: pkgData.description,
            price: pkgData.price,
            duration: pkgData.duration,
          });
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
  //   const firebaseConfig = {
  //     apiKey: process.env.FIREBASE_API_KEY,
  //     authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  //     projectId: process.env.FIREBASE_PROJECT_ID,
  //     storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  //     messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  //     appId: process.env.FIREBASE_APP_ID,
  //     measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  //   };

  //   const app = initializeApp(firebaseConfig);
  //   const analytics = getAnalytics(app);
  //   // Use app and analytics here
  //   console.log(app, "appppppp");
  //   console.log(analytics, "analyticssss");
  // }, []);

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

          {/* sửa ở đây Form React.children.only */}
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
                    placeholder="Upload Image"
                    onChange={(event) =>
                      handleImageFileChange({
                        event: event,
                        setImageUploaded: setImageUploaded,
                      })
                    } // Convert empty string back to null if needed
                  />
                </FormControl>
                <Image
                  src={imageUploaded || validImageUrl(field.value)}
                  alt={field.value || "image"}
                  width={300}
                  height={250}
                />
                <FormMessage />
              </FormItem>
            )}
          />

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
                    value={field.value ?? ""}
                    onChange={(event) => field.onChange(event)}
                    // {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                      value={field.value?.toLocaleString("vi-VN") ?? 0}
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

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Duration
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter Date"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end items-end w-full mt-4">
            <Button type="submit" className="bg-blue-500 hover:bg-blue-700">
              <Upload />
              Update
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default PackageEditPage;
