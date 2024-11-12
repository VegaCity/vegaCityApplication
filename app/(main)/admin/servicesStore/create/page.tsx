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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  serviceStoreFormSchema,
  ServiceStoreFormValues,
} from "@/lib/validation";
import { PostServicesStore } from "@/types/store/serviceStore";
import { StoreOwner } from "@/types/store/storeOwner";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const ServiceStoreCreatePage = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [storeList, setStoreList] = useState<StoreOwner[] | []>([]);
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

  useEffect(() => {
    setIsLoading(true);
    const fetchStoreData = async () => {
      try {
        console.log("b");
        const storeRes = await StoreServices.getStores({ page: 1, size: 10 });
        setStoreList(storeRes.data.data);
        console.log(storeRes.data.data, "store resss");
        setIsLoading(false);
      } catch (error) {
        if (error instanceof AxiosError) {
          setError(error?.message);
          setIsLoading(false);
        }
      }
    };

    fetchStoreData();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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

          <FormField
            control={form.control}
            name="storeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Store name
                </FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => field.onChange(value)}
                    {...field}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select store's name" />
                    </SelectTrigger>
                    <SelectContent>
                      {storeList.map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end items-end w-full mt-4">
            <Button className="bg-blue-500 hover:bg-blue-700">
              Create Store's service
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default ServiceStoreCreatePage;
