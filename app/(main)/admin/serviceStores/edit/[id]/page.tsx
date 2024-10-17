"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { StoreServiceServices } from "@/components/services/storeServiceServices";
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
import { UpdateStoreServiceRequest } from "@/types/serviceStore";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
});

type FormValues = z.infer<typeof formSchema>;

interface StoreEditPageProps {
  params: {
    id: string;
  };
}

const StoreEditPage = ({ params }: StoreEditPageProps) => {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isForbidden, setIsForbidden] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    setIsLoading(true);
    const fetchStore = async () => {
      try {
        const response = await StoreServiceServices.getStoreById(params.id);
        const storeData = response.data;
        if (storeData) {
          form.reset({
            name: storeData.name,
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

  const handleSubmit = async (data: { name: string }) => {
    try {
      const updatedStore: UpdateStoreServiceRequest = {
        name: data.name,
      };

      await StoreServiceServices.editStore(params.id, updatedStore);

      toast({
        title: "Store has been updated successfully",
        description: `Store ${data.name} was updated`,
      });
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
      <BackButton text="Back To Stores" link="/admin/serviceStores" />
      <h3 className="text-2xl mb-4">Edit Store</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Store Name
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter Store Name"
                    {...field}
                  />
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

export default StoreEditPage;
