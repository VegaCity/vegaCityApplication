"use client";

import BackButton from "@/components/BackButton";
import { ZoneServices } from "@/components/services/zoneServices";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const zoneSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Full name must include at least 2 characters" })
    .max(100, { message: "Full name does not exceed 100 characters" })
    .regex(/^[\p{L}\s]+$/u, {
      message: "Name have not special character and space!",
    }),
  location: z.string().min(1, { message: "Location is required" }),
});

const ZoneCreatePage = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof zoneSchema>>({
    resolver: zodResolver(zoneSchema),
    defaultValues: {
      name: "",
      location: "",
    },
  });

  type FormValues = z.infer<typeof zoneSchema>;

  const handleSubmit = async (data: FormValues) => {
    // Here you would typically send this data to your API
    console.log("New Zone data:", data);
    setIsSubmitting(true);
    try {
      const res = await ZoneServices.uploadZone(data);
      toast({
        variant: "success",
        title: "Zone created successfully",
        description: `Created Zone: ${data.name}`,
      });
      router.push("/admin/zones");
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Error creating zone!",
          description:
            error.response?.data.Error ||
            error.response?.data.messageResponse ||
            "Please try again later!",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <BackButton text="Back To Zones" link="/admin/zones" />
      {/* Body Container */}
      <div className="max-w-7xl px-10">
        <h4 className="text-2xl font-semibold text-zinc-700 dark:text-white">
          Zone Information
        </h4>
        <p className="text-md text-zinc-500 dark:text-zinc-400">
          Provide details about the zone.
        </p>
        <Card className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6 max-w-md mx-auto"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <Tooltip>
                      <TooltipTrigger>
                        <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                          Name
                        </FormLabel>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Provide a unique name for the zone.</p>
                      </TooltipContent>
                    </Tooltip>
                    <FormControl>
                      <Input
                        className={cn(
                          "bg-slate-100 dark:bg-slate-500 focus-visible:ring-0 border text-black dark:text-white focus-visible:ring-offset-0 ",
                          fieldState.error ? "border-red-500" : ""
                        )}
                        placeholder="Enter a unique name for the zone"
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
                <Button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Creating..."
                  ) : (
                    <>
                      <Upload /> <p>Create</p>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </>
  );
};

export default ZoneCreatePage;
