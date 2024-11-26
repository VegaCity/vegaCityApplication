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
import { Card } from "@/components/ui/card";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
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
      {/* Body Container */}
      <div className="max-w-7xl px-10">
        <div className="mb-2">
          <h4 className="text-2xl font-semibold text-zinc-700 dark:text-white">
            Edit Promotion
          </h4>
          <p className="text-md text-zinc-500 dark:text-zinc-400">
            Provide details about Promotion.
          </p>
        </div>
        <Card className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-lg border-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-8"
            >
              {/* Div Container */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Enter promotion name"
                            onChange={(event) => field.onChange(event)}
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
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter description"
                            value={field.value ?? ""}
                            onChange={(event) => field.onChange(event)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>

                <Card className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md space-y-4">
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
                              let value = e.target.valueAsNumber;
                              if (value < 0) value = 0;
                              field.onChange(value);
                            }}
                            // {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>

                <Card className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md space-y-4 col-span-2">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Auto Promotion
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="checkbox"
                              id="auto-promotion"
                              className="h-5 w-5 border-gray-300 rounded-md text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:focus:ring-offset-gray-900 dark:bg-gray-700"
                              onChange={(e) => field.onChange(e.target.checked)} // Reflect the form state
                            />
                            <label
                              htmlFor="auto-promotion"
                              className="text-sm text-gray-700 dark:text-gray-300"
                            >
                              Enable auto promotion
                            </label>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-start gap-44">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input
                              className="w-min"
                              type="datetime-local"
                              {...field}
                            />
                          </FormControl>
                          <div className="absolute bottom w-full">
                            <FormMessage className="min-h-min" />
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input
                              className="w-min"
                              type="datetime-local"
                              {...field}
                            />
                          </FormControl>
                          {/* Ensure the message has a minimum height to prevent layout shifts */}
                          <div className="absolute bottom w-full">
                            <FormMessage className="min-h-[1rem]" />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>
              </div>
              <div className="flex justify-end items-end w-full mt-4">
                <Button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Updating..."
                  ) : (
                    <>
                      <Edit /> <p>Update</p>
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

export default PromotionEditPage;
