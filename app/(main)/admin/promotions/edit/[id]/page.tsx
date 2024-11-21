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
import { isObject } from "@/lib/isObject";
import { Edit } from "lucide-react";
import { handlePlusOneDayFromBe } from "@/lib/utils/convertDatePlusOne";

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
  //Promotion Status
  const [isAutomationEnabled, setIsAutomationEnabled] = useState(false);

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
      status: "",
    },
  });

  const convertDiscountPercent = (discountPercent: number) => {
    return parseFloat(discountPercent.toFixed(2)) * 100;
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
        variant: "success",
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setIsAutomationEnabled(isChecked);
    if (isChecked) {
      // Set Automation
      form.setValue("status", "Automation");
    } else {
      form.setValue("status", null);
    }
  };

  useEffect(() => {
    const fetchPromotionData = async () => {
      setIsLoading(true);
      try {
        const response = await PromotionServices.getPromotionById(params.id);
        const promoData: PromotionPatch =
          isObject(response.data.data.promotion) &&
          response.data.data.promotion;

        setPromotionData(promoData);
        const { discountPercent, startDate, endDate } = promoData;

        const roundDiscountPercent: number = convertDiscountPercent(
          discountPercent || 0
        );

        if (promoData) {
          form.reset({
            ...promoData,
            discountPercent: roundDiscountPercent,
            startDate: startDate || "",
            endDate: endDate || "",
          });
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
            name="requireAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Require Amount(VND)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Enter require amount"
                      value={field.value?.toLocaleString("vi-VN") ?? 0}
                      onChange={(e) => {
                        //convert string to number
                        const input = e.target.value;
                        const numericValue = parseFloat(
                          input.replace(/[.]/g, "")
                        );
                        field.onChange(numericValue || 0);
                      }}
                    />
                    <span className="absolute inset-y-0 right-2 flex items-center text-gray-400 pointer-events-none">
                      VND
                    </span>
                  </div>
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
                <FormLabel>Discount Percent(%)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="Enter discount percent"
                      value={field.value ?? 0}
                      onChange={(e) => {
                        // Ensure only positive values
                        let value = e.target.valueAsNumber;
                        if (value < 0) value = 0;
                        if (value > 100) value = 100;

                        field.onChange(value);
                      }}
                    />
                    <span className="absolute inset-y-0 right-2 flex items-center text-gray-400 pointer-events-none">
                      %
                    </span>
                  </div>
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
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter quantity"
                    value={field.value ?? 0}
                    onChange={(e) => {
                      field.onChange(e.target.valueAsNumber);
                    }}
                    // {...field}
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
                <FormLabel>Max Discount(VND)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Enter max discount"
                      className="pr-8" // Padding for unit suffix
                      value={field.value?.toLocaleString("vi-VN") || 0}
                      onChange={(e) => {
                        //convert string to number
                        const input = e.target.value;
                        const numericValue = parseFloat(
                          input.replace(/[.]/g, "")
                        );
                        field.onChange(numericValue || 0);
                      }}
                    />
                    <span className="absolute inset-y-0 right-2 flex items-center text-gray-400 pointer-events-none">
                      VND
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Auto Promotion</FormLabel>
                <FormControl>
                  <Input
                    type="checkbox"
                    // checked={field.value || ""} // Ensure `checked` reflects the form state
                    onChange={handleCheckboxChange} // Set the field value to true/false
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
                    type="datetime-local"
                    className="bg-slate-100 dark:bg-slate-500 border-0 text-black dark:text-white"
                    value={field.value ? field.value : ""}
                    onChange={(event) => {
                      field.onChange(event.target.value);
                    }}
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
                    type="datetime-local"
                    className="bg-slate-100 dark:bg-slate-500 border-0 text-black dark:text-white"
                    value={field.value ? field.value : ""}
                    onChange={(event) => field.onChange(event.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end items-end w-full mt-4">
            <Button type="submit" className="bg-blue-500 hover:bg-blue-700">
              <Edit />
              Update
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default PromotionEditPage;
