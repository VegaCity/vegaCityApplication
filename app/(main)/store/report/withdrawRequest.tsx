"use client";
import React, { useEffect, useState } from "react";
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
import { StoreServices } from "@/components/services/Store/storeServices";
import { ReportServices } from "@/components/services/reportServices";
import { toast } from "@/components/ui/use-toast";
import { formatVNDCurrencyValue } from "@/lib/utils/formatVNDCurrency";
import { useRouter } from "next/navigation";

type WithdrawFormValues = {
  amount: number;
};

interface StoreRquestWithdraw {
  name: string;
  email: string;
}

interface RequestWithdrawPageProps {
  onCompleteChange: () => void;
}

const RequestWithdrawPage = ({
  onCompleteChange,
}: RequestWithdrawPageProps) => {
  const router = useRouter();
  const form = useForm<WithdrawFormValues>({
    resolver: zodResolver(requestWithdrawMoneyFormSchema),
    defaultValues: {
      amount: 0,
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [store, setStore] = useState<StoreRquestWithdraw | null>({
    name: "",
    email: "",
  });

  const onSubmit: SubmitHandler<WithdrawFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      const storeId = localStorage.getItem("storeId");
      if (!storeId) {
        toast({
          title: "Error",
          description: "Store ID not found",
          variant: "destructive",
        });
        return;
      }

      const descMessage = `Store ${store?.name} - ${
        store?.email
      } request withdraw ${formatVNDCurrencyValue(data.amount)}`;

      // d84b6049-70a7-4795-a05a-876e7f84f2ff request withdraw issue type money
      const reportData = {
        issueTypeId: "d84b6049-70a7-4795-a05a-876e7f84f2ff",
        description: descMessage,
        creatorStoreId: storeId,
      };
      // console.log(reportData, "reportData");
      const response = await ReportServices.createReportByStore(reportData);

      toast({
        variant: "success",
        title: "Success",
        description: "Report created successfully",
      });
      // Navigate to tab list report
      // setTimeout(() => {
      onCompleteChange();
      // }, 1000);
    } catch (error) {
      console.error("Error requesting withdrawal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const storeId = localStorage.getItem("storeId");
        if (storeId) {
          const storeRes = await StoreServices.getStoreById(storeId);
          const storeData = storeRes.data.data;
          setStore({
            name: storeData.store.name,
            email: storeData.store.email,
          });
          console.log(storeData, "storeData");
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchStoreData();
  }, []);
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
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Request withdraw money</h1>
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
                <FormLabel className="block text-sm font-medium text-gray-700">
                  Amount withdraw (VND)
                </FormLabel>
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
          <div className="flex justify-end items-center w-full">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="p-4 bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isSubmitting ? "Processing..." : "Request Withdraw"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default RequestWithdrawPage;
