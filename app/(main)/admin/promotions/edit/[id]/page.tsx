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
import { useEffect, useState } from "react";
import { PromotionServices } from "@/components/services/Promotion/promotionServices";
import { Promotion, PromotionPatch } from "@/types/promotion/Promotion";
import { useRouter } from "next/navigation";
import {
  EditPromotionFormValues,
  editPromotionFormSchema,
} from "@/lib/validation";

interface PromotionEditPageProps {
  params: {
    id: string;
  };
}

const PromotionEditPage = ({ params }: PromotionEditPageProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [promotionData, setPromotionData] = useState<PromotionPatch | null>(
    null
  );

  const form = useForm<EditPromotionFormValues>({
    resolver: zodResolver(editPromotionFormSchema),
    defaultValues: {
      name: "",
      description: "",
      maxDiscount: 0,
      requireAmount: 0,
      quantity: 0,
      discountPercent: 0,
      startDate: "",
      endDate: "",
    },
  });

  const convertDiscountPercent = (discountPercent: number) => {
    return discountPercent.toFixed(2) * 100;
  };

  const roundToOneDecimal = (number: number) => {
    return parseFloat((number / 100).toFixed(2));
  };
  // console.log(checkDiscountPercent(0.124444), "check discount 1");
  // console.log(roundToOneDecimal(0.8), "check discount 2");

  const handleSubmit = async (data: PromotionPatch) => {
    const startDate = data.startDate;
    const endDate = data.endDate;
    const discountPercent = data.discountPercent ?? 0;
    console.log(startDate, " - ", endDate);
    const roundDiscount = roundToOneDecimal(discountPercent);
    const promotionData: PromotionPatch = {
      ...data,
      discountPercent: roundDiscount,
    };
    try {
      await PromotionServices.editPromotion(params.id, promotionData);
      toast({
        title: "Promotion has been updated successfully",
        description: `Promotion ${data.name} was updated.`,
      });
      // router.back();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    }
  };

  useEffect(() => {
    const fetchPromotionData = async () => {
      setIsLoading(true);
      try {
        const response = await PromotionServices.getPromotionById(params.id);
        const promoData: Promotion = response.data.data.promotion;
        setPromotionData(promoData);
        const roundDiscountPercent = convertDiscountPercent(
          promoData.discountPercent || 0
        );
        if (promoData) {
          form.reset({ ...promoData, discountPercent: roundDiscountPercent });
        }
      } catch (err) {
        console.error("Error fetching promotion data:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An unknown error occurred while fetching promotion data"
        );
        toast({
          title: "Error",
          description: "Failed to load promotion data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPromotionData();
  }, [params.id]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <BackButton text="Back To Promotions" link="/admin/promotions" />
      <h3 className="text-2xl mb-4">Edit Promotion</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Promotion Name
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-slate-100 dark:bg-slate-500 border-0 text-black dark:text-white"
                    placeholder="Enter Promotion Name"
                    {...field}
                  />
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
                  <Textarea
                    className="bg-slate-100 dark:bg-slate-500 border-0 text-black dark:text-white"
                    placeholder="Enter Description"
                    value={field.value ?? ""}
                    onChange={(event) => {
                      field.onChange(event);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxDiscount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Max Discount
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="bg-slate-100 dark:bg-slate-500 border-0 text-black dark:text-white"
                    placeholder="Enter Max Discount"
                    value={field.value ?? 0}
                    onChange={(event) => {
                      field.onChange(event.target.valueAsNumber);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requireAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Required Amount
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="bg-slate-100 dark:bg-slate-500 border-0 text-black dark:text-white"
                    placeholder="Enter Required Amount"
                    value={field.value ?? 0}
                    onChange={(event) => {
                      field.onChange(event.target.valueAsNumber);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Quantity
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="bg-slate-100 dark:bg-slate-500 border-0 text-black dark:text-white"
                    placeholder="Enter Quantity"
                    value={field.value ?? 0}
                    onChange={(event) => {
                      field.onChange(event.target.valueAsNumber);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discountPercent"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Discount Percent
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="bg-slate-100 dark:bg-slate-500 border-0 text-black dark:text-white"
                    placeholder="Enter Discount Percent"
                    value={field.value ?? 0}
                    onChange={(event) => {
                      field.onChange(event.target.valueAsNumber);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Start Date
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    className="bg-slate-100 dark:bg-slate-500 border-0 text-black dark:text-white"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  End Date
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    className="bg-slate-100 dark:bg-slate-500 border-0 text-black dark:text-white"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="w-full dark:bg-slate-800 dark:text-white">
            Update Promotion
          </Button>
        </form>
      </Form>
    </>
  );
};

export default PromotionEditPage;
