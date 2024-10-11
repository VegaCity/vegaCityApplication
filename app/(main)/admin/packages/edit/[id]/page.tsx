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
import { Package } from "@/types/package";
import { register } from "module";

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

  useEffect(() => {
    setIsLoading(true);
    const fetchPackages = async () => {
      try {
        setIsLoading(true);
        const response = await PackageServices.getPackageById(params.id);
        const pkgData = response.data.data.package;
        console.log(pkgData, "Get package by Id"); // Log the response for debugging
        if (pkgData) {
          form.reset({
            name: pkgData.name,
            imageUrl: pkgData.imageUrl,
            description: pkgData.description,
            price: pkgData.price,
            startDate: pkgData.startDate,
            endDate: pkgData.endDate,
          });
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackages();
  }, [params.id, form]);

  const handleSubmit = async (data: FormValues) => {
    try {
      // Assuming you have an update method in PackageServices
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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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
                    type="file" // Change the input type to file
                    accept="image/*" // Accept only image files
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Uploade image"
                    {...field}
                    onChange={(e) => {
                      const file = e.target.files?.[0]; // Get the uploaded file
                      if (file) {
                        // Handle the file upload here (you could use a service or API to upload the file)
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          // Once the file is read, update the form field with the image URL or base64 string
                          field.onChange(reader.result); // Update the form with the uploaded image (can be a URL or base64)
                        };
                        reader.readAsDataURL(file); // Read the file as a data URL (base64)
                      }
                    }}
                  />
                </FormControl>
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
