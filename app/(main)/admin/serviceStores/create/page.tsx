"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { StoreServiceServices } from "@/components/services/storeServiceServices";
import { StoreServices } from "@/components/services/storeServices";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(1, { message: "Service Store Name is required" }),
  storeId: z.string().min(1, { message: "Store ID is required" }),
});

type FormValues = z.infer<typeof formSchema>;

interface Store {
  id: string;
  name: string;
}

const CreateServiceStore = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      storeId: "",
    },
  });

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await StoreServices.getStores({});
        setStores(response.data.data);
      } catch (error) {
        console.error("Failed to fetch stores:", error);
        toast({
          title: "Error",
          description: "Failed to load stores. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchStores();
  }, [toast]);

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      await StoreServiceServices.createStore(data);
      toast({
        title: "Service Store created successfully",
        description: `New service store ${data.name} has been created`,
      });
      router.push("/admin/serviceStores"); // Redirect to store list page
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create service store. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <BackButton text="Back to Service Stores" link="/admin/serviceStores" />
        <h1 className="text-2xl font-bold">Create New Service Store</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Store Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter service store name" {...field} />
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
                <FormLabel>Select Store</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a store" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Service Store"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CreateServiceStore;
