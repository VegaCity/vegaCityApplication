"use client";

import BackButton from "@/components/BackButton";
import { ZoneServices } from "@/components/services/zoneServices";
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

const zoneSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  location: z.string().min(1, { message: "Location is required" }),
});

interface ZoneEditPageProps {
  params: {
    id: string;
  };
}

type FormValues = z.infer<typeof zoneSchema>;

const ZoneEditPage = ({ params }: ZoneEditPageProps) => {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // const pkg = packageList.find((pkg) => pkg.id === params.id);
  const form = useForm<FormValues>({
    resolver: zodResolver(zoneSchema),
    defaultValues: {
      name: "",
      location: "",
    },
  });

  useEffect(() => {
    setIsLoading(true);
    const fetchZones = async () => {
      try {
        setIsLoading(true);
        const response = await ZoneServices.getZoneById(params.id);
        const zoneData = response.data.data.zone;
        console.log(zoneData, "Get package by Id"); // Log the response for debugging
        if (zoneData) {
          form.reset({
            name: zoneData.name,
            location: zoneData.location,
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

    fetchZones();
  }, [params.id, form]);

  const handleSubmit = async (data: FormValues) => {
    try {
      // Assuming you have an update method in ZoneServices
      await ZoneServices.editZone(params.id, data);
      toast({
        title: "Zone has been updated successfully",
        description: `Zone ${data.name} was updated!`,
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
      <BackButton text="Back To Zones" link="/admin/zones" />
      <h3 className="text-2xl mb-4">Edit Zone</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            disabled
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Zone Name
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Id"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            disabled
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Zone Location
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="MarketZone Id"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="w-full dark:bg-slate-800 dark:text-white">
            Update Zone
          </Button>
        </form>
      </Form>
    </>
  );
};

export default ZoneEditPage;
