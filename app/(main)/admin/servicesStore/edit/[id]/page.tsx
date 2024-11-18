"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import BackButton from "@/components/BackButton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PostServicesStore } from "@/types/store/serviceStore";
import { ServiceStoreServices } from "@/components/services/Store/servicesStoreServices";
import { useRouter } from "next/navigation";
import {
  EditServiceStoreFormValues,
  editServiceStoreFormSchema,
} from "@/lib/validation";

interface StoreEditPageProps {
  params: {
    id: string;
  };
}

const ServiceStoreEditPage = ({ params }: StoreEditPageProps) => {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isForbidden, setIsForbidden] = useState(false);
  const router = useRouter();

  const form = useForm<EditServiceStoreFormValues>({
    resolver: zodResolver(editServiceStoreFormSchema),
    defaultValues: {
      name: "",
      price: 0,
    },
  });

  useEffect(() => {
    setIsLoading(true);
    const fetchStore = async () => {
      try {
        const response = await ServiceStoreServices.getServicesStoreById(
          params.id
        );
        const storeData: PostServicesStore = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        if (storeData) {
          form.reset({
            name: storeData.name,
            price: storeData.price,
          });
        }
      } catch (err) {
        // if (err.response && err.response.status === 403) {
        //   setIsForbidden(true);
        //   setError("You do not have permission to access this store.");
        // } else {
        //   setError(
        //     err instanceof Error ? err.message : "An unknown error occurred"
        //   );
        // }
      } finally {
        setIsLoading(false);
      }
    };

    fetchStore();
  }, [params.id, form]);

  const handleSubmit = async (data: EditServiceStoreFormValues) => {
    try {
      const updatedStore = data;

      await ServiceStoreServices.editServiceStore(params.id, updatedStore);

      toast({
        title: "Store has been updated successfully",
        description: `Store ${data.name} was updated`,
      });
      router.push("/admin/servicesStore");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(message);
    }
  };

  // Helper function to check if the error is from Axios
  function isAxiosError(
    error: unknown
  ): error is { response: { status: number } } {
    return typeof error === "object" && error !== null && "response" in error;
  }

  if (isLoading) return <div>Loading...</div>;

  if (isForbidden) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <BackButton text="Back To Stores" link="/admin/servicesStore" />
      <h3 className="text-2xl mb-4">Edit Service Store</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Service Name
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter Service Name"
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
                <FormLabel>Price(VND)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Enter Service Price"
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

          <Button className="w-full dark:bg-slate-800 dark:text-white">
            Update Store
          </Button>
        </form>
      </Form>
    </>
  );
};

export default ServiceStoreEditPage;
