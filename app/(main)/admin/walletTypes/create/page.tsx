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
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { WalletTypesServices } from "@/components/services/User/walletTypesServices";

interface Wallet {
  name: string;
}

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
});

type FormValues = z.infer<typeof formSchema>;

const WalletCreatePage = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const handleSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      const walletResponse = await WalletTypesServices.createWalletType(data);
      toast({
        variant: "success",
        title: "Success",
        description: `Wallet "${data.name}" created successfully.`,
      });
      router.back();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to create wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <BackButton text="Back To Wallets" link="/admin/wallets" />
      <h3 className="text-2xl mb-4">Create New Wallet</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter wallet name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end items-end w-full mt-4">
            <Button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Wallet"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default WalletCreatePage;
