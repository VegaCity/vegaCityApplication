"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestWithdrawMoneyFormSchema } from "@/lib/validation";

type WithdrawFormValues = {
  amount: number;
};

const RequestWithdrawPage = () => {
  const form = useForm<WithdrawFormValues>({
    resolver: zodResolver(requestWithdrawMoneyFormSchema),
    defaultValues: {
      amount: 0,
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit: SubmitHandler<WithdrawFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      console.log("Requesting withdrawal with amount:", data.amount);
      alert("Withdrawal requested successfully!");
    } catch (error) {
      console.error("Error requesting withdrawal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
    //   <div>
    //     <h1 className="text-xl font-bold mb-4">Withdraw Request</h1>

    //     <label htmlFor="amount" className="block text-md font-medium mb-2">
    //       Amount withdraw
    //     </label>
    //     <Input
    //       type="text"
    //       placeholder="Enter amount"
    //       value={getValues("amount").toLocaleString("vi-VN", {
    //         style: "currency",
    //         currency: "VND",
    //       })}
    //       onChange={(e) => {
    //         //convert string to number
    //         const input = e.target.value;
    //         const numericValue = parseFloat(input.replace(/[.]/g, ""));
    //         return numericValue;
    //       }}
    //       //   {...register("amount", { required: "Amount is required", min: 1 })}
    //     />
    //     {errors.amount && (
    //       <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
    //     )}
    //   </div>

    //   <Button type="submit" disabled={isSubmitting} className="w-full">
    //     {isSubmitting ? "Processing..." : "Request Withdraw"}
    //   </Button>
    // </form>
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-full mx-auto"
      >
        {/* Package Name */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount withdraw(VND)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Withdraw amount"
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
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Processing..." : "Request Withdraw"}
        </Button>
      </form>
    </Form>
  );
};

export default RequestWithdrawPage;
