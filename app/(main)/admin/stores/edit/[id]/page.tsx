"use client";

import BackButton from "@/components/BackButton";
import { Loader } from "@/components/loader/Loader";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { StoreFormValues, storeFormSchema } from "@/lib/validation";
import {
  StoreOwnerDetail,
  storeStatusTypes,
  storeTypes,
} from "@/types/store/storeOwner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface StoreEditPageProps {
  params: {
    id: string;
  };
}

const StoreEditPage = ({ params }: StoreEditPageProps) => {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: {
      name: "",
      address: "",
      phoneNumber: "",
      shortName: "",
      email: "",
      description: "",
      storeType: 0,
      status: 0,
    },
  });

  useEffect(() => {
    setIsLoading(true);
    const fetchStore = async () => {
      try {
        const response = await StoreServices.getStoreById(params.id);
        const storeData: StoreOwnerDetail = response.data.data;
        console.log(storeData, "Get store by Id"); // Log the response for debugging
        if (storeData) {
          form.reset({
            name: storeData.store.name,
            address: storeData.store.address,
            phoneNumber: storeData.store.phoneNumber,
            shortName: storeData.store.shortName,
            email: storeData.store.email,
            description: storeData.store.description,
            storeType: storeData.store.storeType,
            status: storeData.store.status,
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

    fetchStore();
  }, [params.id, form]);

  const handleSubmit = async (data: StoreFormValues) => {
    try {
      await StoreServices.editStore(params.id, data);
      toast({
        variant: "success",
        title: "Store has been updated successfully",
        description: `Store ${data.name} was updated with address ${data.address}`,
      });
      router.back();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    }
  };

  if (isLoading) return <Loader isLoading={isLoading} />;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <BackButton text="Back To Stores" link="/admin/stores" />
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
                  <Textarea
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter Store Name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Address
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter Store Address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Phone Number
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter Phone Number"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shortName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Short Name
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter Short Name"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter Email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Store Type */}
          <FormField
            control={form.control}
            name="storeType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Store's Type</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(Number(value));
                      // handleTypeChange("zone", value);
                    }}
                    value={field.value.toString()}
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
                      ) : storeTypes.length > 0 ? (
                        storeTypes.map((storeType) => (
                          <SelectItem
                            key={storeType.value}
                            value={storeType.value.toString()}
                          >
                            {storeType.name}
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

          {/* Store Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Store's status</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(Number(value));
                      // handleTypeChange("zone", value);
                    }}
                    value={field.value.toString()}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading store status...
                        </SelectItem>
                      ) : storeStatusTypes.length > 0 ? (
                        storeStatusTypes.map((status) => (
                          <SelectItem
                            key={status.value}
                            value={status.value.toString()}
                          >
                            {status.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-zones" disabled>
                          No status available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
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
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end items-end w-full mt-4">
            <Button type="submit" className="bg-blue-500 hover:bg-blue-700">
              <Edit />
              Update
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default StoreEditPage;
