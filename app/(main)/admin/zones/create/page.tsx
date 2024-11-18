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
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";

const zoneSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  location: z.string().min(1, { message: "Location is required" }),
});

const ZoneCreatePage = () => {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof zoneSchema>>({
    resolver: zodResolver(zoneSchema),
    defaultValues: {
      name: "",
      location: "",
    },
  });

  type FormValues = z.infer<typeof zoneSchema>;

  const handleSubmit = (data: FormValues) => {
    // Here you would typically send this data to your API
    console.log("New Zone data:", data);
    if (data) {
      ZoneServices.uploadZone(data).then((res) => {
        console.log(res.data, "Upload Zone");
        toast({
          title: "Zone has been created successfully",
          description: `Created Zone: ${data.name}`,
        });
        router.push("/admin/zones");
      });
    }
  };

  return (
    <>
      <BackButton text="Back To Zones" link="/admin/zones" />
      <h3 className="text-2xl mb-4">Create New Zone</h3>
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
                    placeholder="Enter Zone name"
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
                  <Textarea
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter zone location"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end items-end w-full mt-4">
            <Button type="submit" className="bg-blue-500 hover:bg-blue-700">
              Create Zone
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default ZoneCreatePage;
