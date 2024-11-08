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
import { PromotionServices } from "@/components/services/Promotion/promotionServices";
import {
  CreatePromotionFormValues,
  createPromotionFormSchema,
} from "@/lib/validation";

const PromotionCreatePage = () => {
  const { toast } = useToast();
  const router = useRouter();

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
    },
  });

  const handleSubmit = (data: CreatePromotionFormValues) => {
    console.log("New promotion data:", data);

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
            name="maxDiscount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Discount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter max discount"
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
            name="discountPercent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Percent</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter discount percent"
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
            name="requireAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Require Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter require amount"
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
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
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
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="w-full">Create Promotion</Button>
        </form>
      </Form>
    </>
  );
};

export default PromotionCreatePage;
