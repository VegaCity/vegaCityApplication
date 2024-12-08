"use client";

import BackButton from "@/components/BackButton";
import * as z from "zod";
import { useForm, useWatch } from "react-hook-form";
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
import { PromotionServices } from "@/components/services/Promotion/promotionServices";
import {
  CreatePromotionFormValues,
  createPromotionFormSchema,
} from "@/lib/validation";
import { useEffect, useState } from "react";

const PromotionCreatePage = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [isAutomationEnabled, setIsAutomationEnabled] = useState(false);

  const form = useForm<CreatePromotionFormValues>({
    resolver: zodResolver(createPromotionFormSchema),
    defaultValues: {
      promotionCode: "",
      name: "",
      description: "",
      maxDiscount: 0,
      quantity: 0,
      discountPercent: 0,
      requireAmount: 0,
      startDate: "",
      endDate: "",
      status: "",
    },
  });

  const VNDcurrencyValue = (numberValue: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(numberValue);

  const handleSubmit = (data: CreatePromotionFormValues) => {
    console.log("New promotion data:", data);
    console.log("Max discount:", data.maxDiscount);

    const { status, ...restPromoData } = data;
    console.log(status, "status ne");

    const converDiscountPercentToBe = Number(
      (data?.discountPercent ?? 0) / 100
    );

    const promotionData = {
      ...data,
      discountPercent: converDiscountPercentToBe,
    };

    PromotionServices.uploadPromotion(promotionData)
      .then((res) => {
        console.log(res.data, "Create Promotion");
        toast({
          title: "Promotion has been created successfully",
          description: `Created promotion: ${promotionData.name}`,
        });
        router.push("/admin/promotions");
      })
      .catch((err) => {
        if (err.response.status === 400) {
          toast({
            title: "Error when creating!",
            description: `Error: ${err.response.data.messageResponse}`,
          });
        }
        console.error(err, "Error creating promotion");
      });
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

  // // Watch for changes in requireAmount and discountPercent
  // const requireAmount = useWatch({
  //   control: form.control,
  //   name: "requireAmount",
  // });
  // const discountPercent = useWatch({
  //   control: form.control,
  //   name: "discountPercent",
  // });

  // // Update maxDiscount when requireAmount or discountPercent changes
  // useEffect(() => {
  //   const calculatedMaxDiscount =
  //     (requireAmount || 0) * ((discountPercent || 0) / 100);
  //   form.setValue("maxDiscount", calculatedMaxDiscount);
  // }, [requireAmount, discountPercent, form]);

  return (
    <>
      <BackButton text="Back To Promotions" link="/admin/promotions" />
      <h3 className="text-2xl mb-4">Create New Promotion</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="promotionCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Promotion Code</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter promotion code"
                    defaultValue={"PROMO123"}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          <div className="flex items-center justify-start gap-44">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input className="w-min" type="datetime-local" {...field} />
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
                    <Input className="w-min" type="datetime-local" {...field} />
                  </FormControl>
                  {/* Ensure the message has a minimum height to prevent layout shifts */}
                  <div className="absolute bottom w-full">
                    <FormMessage className="min-h-[1rem]" />
                  </div>
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end items-end w-full mt-4">
            <Button className="bg-blue-500 hover:bg-blue-700">
              Create Promotion
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default PromotionCreatePage;
