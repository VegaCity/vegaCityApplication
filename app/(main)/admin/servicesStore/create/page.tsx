"use client";

import BackButton from "@/components/BackButton";
import { ServiceStoreServices } from "@/components/services/Store/servicesStoreServices";
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
import { PostServicesStore } from "@/types/serviceStore/serviceStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

const ServiceStoreCreatePage = () => {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<ServiceStoreFormValues>({
    resolver: zodResolver(serviceStoreFormSchema),
    defaultValues: {
      name: "",
      storeId: "",
    },
  });

  const handleSubmit = (data: ServiceStoreFormValues) => {
    // Create a new object that includes the apiKey
    const serviceStoreData: PostServicesStore = data;

    console.log("New user data:", serviceStoreData);
    if (serviceStoreData) {
      ServiceStoreServices.createServicesStore(serviceStoreData).then((res) => {
        console.log(res.data, "Create Service Store");
        toast({
          title: "User has been created successfully",
          description: `Created user: ${serviceStoreData.name}`,
        });
        router.push("/admin/servicesStore");
      });
    }
  };

  return (
    <>
      <BackButton text="Back To Services Store" link="/admin/servicesStore" />
      <h3 className="text-2xl mb-4">Create New Services Store</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Name
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter service name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="w-full dark:bg-slate-800 dark:text-white">
            Create Store's service
          </Button>
        </form>
      </Form>
    </>
  );
};

export default ServiceStoreCreatePage;
