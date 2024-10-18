"use client";

import BackButton from "@/components/BackButton";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { ETagTypeServices } from "@/components/services/etagtypeServices";

const etagTypeSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  imageUrl: z.string().min(1, { message: "Image URL is required" }),
  bonusRate: z
    .number()
    .min(0, { message: "Bonus rate must be a non-negative number" }),
  amount: z
    .number()
    .min(1, { message: "Amount must be a non-negative number" }),
  walletTypeId: z.string().min(1, { message: "Wallet Type Id is required" }),
});

type FormValues = z.infer<typeof etagTypeSchema>;

const EtagTypeCreatePage = () => {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(etagTypeSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
      bonusRate: 0,
      amount: 1,
      walletTypeId: "33cc7de6-80f6-4448-8e33-9a0b61ab2c8f",
    },
  });

  const handleSubmit = (data: FormValues) => {
    console.log("New etag type data:", data);
    if (data) {
      ETagTypeServices.uploadEtagType(data)
        .then((res) => {
          console.log(res.data, "Upload etag type");
          toast({
            title: "Etag type has been created successfully",
            description: `Created etag type: ${data.name}`,
          });
          router.push("/admin/etagtypes");
        })
        .catch((error) => {
          console.error("Error creating etag type: ", error);
          toast({
            title: "Error creating etag type",
            description:
              "An error occurred while creating the etag type. Please try again!",
            variant: "destructive",
          });
        });
    }
  };

  return (
    <>
      <BackButton text="Back To Etag Types" link="/admin/etagtypes" />
      <h3 className="text-2xl mb-4">Create New Etag Type</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Etag Type Name
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter Etag type name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Image URL
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter image URL"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bonusRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Bonus Rate
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter bonus rate"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Amount
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter amount"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="w-full dark:bg-slate-800 dark:text-white">
            Create Etag Type
          </Button>
        </form>
      </Form>
    </>
  );
};

export default EtagTypeCreatePage;
