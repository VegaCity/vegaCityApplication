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
import { useEffect, useState } from "react";
import {
  GetWalletTypeById,
  WalletTypePostPatch,
} from "@/types/walletType/walletType";
import { WalletTypesServices } from "@/components/services/User/walletTypesServices";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required",
  }),
});

interface WalletTypeEditPageProps {
  params: {
    id: string;
  };
}

type FormValues = z.infer<typeof formSchema>;

const WalletTypeEditPage = ({ params }: WalletTypeEditPageProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const handleSubmit = async (data: FormValues) => {
    try {
      await WalletTypesServices.updateWalletTypeById(params.id, data);
      toast({
        variant: "success",
        title: "Wallet Type updated successfully!",
        description: `Wallet type "${data.name}" was updated.`,
      });
      router.back();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    }
  };

  useEffect(() => {
    const fetchWalletTypeData = async () => {
      setIsLoading(true);
      try {
        const response = await WalletTypesServices.getWalletTypeById(params.id);
        const walletTypeData: GetWalletTypeById = response.data.data;
        if (walletTypeData) {
          form.reset(walletTypeData);
        } else {
          throw new Error("Wallet type data is missing in the response");
        }
      } catch (err) {
        console.error("Error fetching wallet type data:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An unknown error occurred while fetching wallet type data"
        );
        toast({
          title: "Error",
          description: "Failed to load wallet type data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchWalletTypeData();
  }, [params.id, form]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <BackButton text="Back To Wallet Types" link="/admin/walletTypes" />
      <h3 className="text-2xl mb-4">Edit Wallet Type</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Wallet Type Name
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter Wallet Type Name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="w-full dark:bg-slate-800 dark:text-white">
            Update Wallet Type
          </Button>
        </form>
      </Form>
    </>
  );
};

export default WalletTypeEditPage;
