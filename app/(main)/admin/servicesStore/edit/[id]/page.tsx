"use client";

import BackButton from "@/components/BackButton";
import { ServiceStoreServices } from "@/components/services/Store/servicesStoreServices";
import { StoreServices } from "@/components/services/Store/storeServices";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  serviceStoreFormSchema,
  ServiceStoreFormValues,
} from "@/lib/validation";
import {
  PatchServicesStore,
  PostServicesStore,
} from "@/types/serviceStore/serviceStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface ServiceStoreEditPageProps {
  params: {
    id: string;
  };
}

const ServiceStoreEditPage = ({ params }: ServiceStoreEditPageProps) => {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [serviceStoreData, setServiceStoreData] =
    useState<PostServicesStore | null>(null);
  const [storeId, setStoreId] = useState<string | null>("");
  const router = useRouter();

  const form = useForm<ServiceStoreFormValues>({
    resolver: zodResolver(serviceStoreFormSchema),
    defaultValues: {
      name: "",
      storeId: "",
    },
  });

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await ServiceStoreServices.getServicesStoreById(
          params.id
        );
        const serviceStore = response.data.data;
        console.log(serviceStore, "Service Store fetchhhh");
        if (serviceStore) {
          setServiceStoreData(serviceStore);
          setStoreId(serviceStore.storeId);
          const storeResponse = await StoreServices.getStoreById(
            serviceStore.storeId
          );
          form.reset({
            name: serviceStore.name,
            storeId: serviceStore.storeId,
          });
        } else {
          throw new Error("Service store is missing in the response");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        toast({
          title: "Error",
          description: "Failed to load user data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [params.id, toast]);

  const handleSubmit = async (data: PatchServicesStore) => {
    const { name } = data;

    try {
      const serviceStoreUpdated = await ServiceStoreServices.editServiceStore(
        params.id,
        data
      );
      toast({
        title: "User has been updated successfully",
        description: `User ${name} was updated.`,
      });
      if (serviceStoreUpdated) {
        router.push("/admin/servicesStore");
      }
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
      <BackButton text="Back to services store" link="/admin/servicesStore" />
      <h3 className="text-2xl mb-4">Edit Service Store</h3>
      {<p>StoreId: {form.getValues("storeId")}</p>}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Full Name
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter Full Name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="w-full dark:bg-slate-800 dark:text-white">
            Update Store's service name
          </Button>
        </form>
      </Form>
    </>
  );
};

export default ServiceStoreEditPage;
