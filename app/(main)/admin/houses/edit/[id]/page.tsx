"use client";

import BackButton from "@/components/BackButton";
import { HouseServices } from "@/components/services/houseServices";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const houseSchema = z.object({
  houseName: z.string().min(1, {
    message: "House Name is required",
  }),
  location: z.string().min(1, {
    message: "Location is required",
  }),
  address: z.string().min(1, {
    message: "Address is required",
  }),
});

interface HouseEditPageProps {
  params: {
    id: string;
  };
}

type FormValues = z.infer<typeof houseSchema>;

const HouseEditPage = ({ params }: HouseEditPageProps) => {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(houseSchema),
    defaultValues: {
      houseName: "",
      location: "",
      address: "",
    },
  });

  useEffect(() => {
    setIsLoading(true);
    const fetchHouse = async () => {
      try {
        setIsLoading(true);
        const response = await HouseServices.getHouseById(params.id);
        const houseData = response.data.data.house;
        console.log(houseData, "Get house by Id"); // Log the response for debugging
        if (houseData) {
          form.reset({
            houseName: houseData.houseName,
            location: houseData.location,
            address: houseData.address,
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

    fetchHouse();
  }, [params.id, form]);

  const handleSubmit = async (data: FormValues) => {
    try {
      await HouseServices.editHouse(params.id, data);
      toast({
        title: "House has been updated successfully",
        description: `House ${data.houseName} was updated`,
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
      <BackButton text="Back To Houses" link="/admin/houses" />
      <h3 className="text-2xl mb-4">Edit House</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="houseName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  House Name
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter House Name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Location
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter Location"
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
                  <Textarea
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter Address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="w-full dark:bg-slate-800 dark:text-white">
            Update House
          </Button>
        </form>
      </Form>
    </>
  );
};

export default HouseEditPage;
