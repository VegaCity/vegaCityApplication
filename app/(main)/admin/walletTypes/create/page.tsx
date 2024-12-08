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
import { Upload } from "lucide-react";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const handleSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
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
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <BackButton text="Back To Wallets" link="/admin/walletTypes" />
      {/* Body Container */}
      <div className="max-w-7xl px-10">
        <h3 className="text-2xl mb-4">Create New Wallet</h3>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
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
      </div>
    </>
  );
};

export default WalletCreatePage;
