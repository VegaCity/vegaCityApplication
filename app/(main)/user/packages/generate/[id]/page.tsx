"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PackageServices } from "@/components/services/Package/packageServices";
import BackButton from "@/components/BackButton";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  customerFormSchema,
  CustomerFormValues,
  FormValues,
  GenerateEtagProps,
} from "@/lib/validation";
import { Card, CardContent } from "@/components/ui/card";
import { useEtagHandlers } from "@/handlers/etag/useEtagHandlesForPackage";
import CountdownTimer from "@/components/countdown/countdown";
import { Clock, Package, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter, useSearchParams } from "next/navigation";

const GenerateEtagById = ({ params }: GenerateEtagProps) => {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [packageData, setPackageData] = useState<any>(null);
  const [showTimer, setShowTimer] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerName = searchParams.get("customerName");
  const phoneNumber = searchParams.get("phoneNumber");
  const email = searchParams.get("email");
  const cccdPassport = searchParams.get("cccdPassport");
  const isAdultParam = searchParams.get("isAdult");

  const customerForm = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      customerName: customerName || "",
      phoneNumber: phoneNumber || "",
      cccdPassport: cccdPassport || "",
      paymentMethod: "Cash",
      email: email || "",
      quantity: 1,
      price: 0,
      isAdult: isAdultParam === "true",
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const {
    isCustomerInfoConfirmed,
    isOrderConfirmed,
    handleCustomerInfoSubmit,
    handleCancelOrder,
    handleConfirmOrder,
  } = useEtagHandlers({
    customerForm,
    packageData,
    setShowTimer,
  });

  useEffect(() => {
    if (packageData?.price) {
      customerForm.setValue("price", packageData.price);
      customerForm.setValue("quantity", 1);
    }
  }, [packageData, customerForm]);

  useEffect(() => {
    const fetchPackageData = async () => {
      setIsLoading(true);
      try {
        const {
          data: { data: packageData, messageResponse },
        } = await PackageServices.getPackageById(params.id);

        localStorage.setItem("packageId", params.id);

        if (!packageData) {
          setError(messageResponse || "Failed to fetch package data");
          return;
        }

        setPackageData(packageData);
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.messageResponse ||
          error.response?.data?.message ||
          error.message ||
          "An unexpected error occurred";

        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPackageData();
  }, [params.id, toast]);

  const handleTimeout = useCallback(() => {
    if (!isOrderConfirmed) {
      handleCancelOrder();
      toast({
        title: "Order Cancelled",
        description:
          "Order has been automatically cancelled due to payment timeout.",
        variant: "destructive",
      });
      window.location.reload();
    }
  }, [isOrderConfirmed, handleCancelOrder, toast]);

  if (isLoading) return <div>Loading...</div>;
  if (error)
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div className="text-red-500 text-lg font-medium mb-2">Error</div>
        <div className="text-gray-700 dark:text-gray-300">{error}</div>
        <Button className="mt-4" onClick={() => router.push("/user/packages")}>
          Return to Packages
        </Button>
      </div>
    );
  return (
    <div className="container mx-auto p-4">
      <BackButton text="Back To Packages" link="/user/packages" />
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold">Generate VCard</h3>
      </div>
      <div className="mb-8 flex justify-center">
        <Card className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-md">
          <CardContent className="p-0">
            <div className="flex flex-col lg:flex-row">
              {/* Image Section */}
              <div className="lg:w-2/5 relative">
                <div className="aspect-square relative overflow-hidden rounded ">
                  <img
                    src={packageData?.imageUrl || "/default-image.png"}
                    alt={packageData?.name}
                    className="object-cover w-full h-full transform transition-transform duration-300 hover:scale-105 "
                  />
                  <Badge
                    className={`absolute top-4 right-4 text-xl   ${
                      packageData?.deflag
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    {packageData?.deflag ? "Inactive" : "Active"}
                  </Badge>
                </div>
              </div>

              {/* Content Section */}
              <div className="lg:w-3/5 p-6 lg:p-8">
                <div className="space-y-6">
                  {/* Header */}
                  <div>
                    <h2 className="text-1xl font-bold text-gray-900 dark:text-white">
                      {packageData?.name}
                    </h2>
                    <p className="text-2xl font-semibold text-red-600 dark:text-red-400 mt-2">
                      {formatCurrency(packageData?.price)}
                    </p>
                  </div>

                  {/* Package Type */}
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      {packageData?.packageType?.name}
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {packageData?.duration} Days
                    </span>
                  </div>

                  {/* Description */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Description
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {packageData?.description}
                    </p>
                  </div>

                  {/* Wallet Type */}
                  <div className="flex items-center space-x-2">
                    <Wallet className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {packageData?.packageDetails[0].walletType?.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {showTimer && !isOrderConfirmed && (
        <div className="w-1/3">
          <CountdownTimer
            duration={300}
            onTimeout={handleTimeout}
            isActive={isCustomerInfoConfirmed && !isOrderConfirmed}
          />
        </div>
      )}
      <div className="container mx-auto px-4 w-full max-w-5xl mt-8">
        <Form {...customerForm}>
          <form
            onSubmit={customerForm.handleSubmit(handleCustomerInfoSubmit)}
            className="space-y-6"
          >
            <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-14 text-center">
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={customerForm.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium dark:text-gray-300">
                        FullName
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white"
                          placeholder="Please enter full name"
                          {...field}
                          disabled={isCustomerInfoConfirmed}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={customerForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white"
                          placeholder="Please enter phone number"
                          {...field}
                          disabled={isCustomerInfoConfirmed}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={customerForm.control}
                  name="cccdPassport"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        CCCD/PassPort:
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white"
                          placeholder="Please enter CCCD/PassPort"
                          {...field}
                          disabled={isCustomerInfoConfirmed}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={customerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white"
                          placeholder="Please enter email"
                          {...field}
                          disabled={isCustomerInfoConfirmed}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={customerForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Quantity
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white"
                          disabled={isCustomerInfoConfirmed}
                          onChange={(e) => {
                            const inputValue = e.target.value;

                            // Nếu input trống
                            if (inputValue === "") {
                              field.onChange(0);
                              customerForm.setValue("price", 0);
                              return;
                            }

                            // Xử lý khi có giá trị nhập vào
                            let newQuantity = Math.max(
                              0,
                              Math.floor(e.target.valueAsNumber || 0)
                            );
                            if (isNaN(newQuantity)) newQuantity = 0;

                            field.onChange(newQuantity);

                            if (packageData?.price) {
                              customerForm.setValue(
                                "price",
                                packageData.price * newQuantity
                              );
                            }
                          }}
                          onBlur={(e) => {
                            const value = e.target.value;
                            if (value === "" || value === "0") {
                              field.onChange(0);
                              customerForm.setValue("price", 0);
                            }
                            field.onBlur();
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "-" || e.key === "+") {
                              e.preventDefault();
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={customerForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Price
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          {...field}
                          className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white"
                          disabled={true}
                          value={formatCurrency(field.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={customerForm.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Payment Method
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isCustomerInfoConfirmed}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="Momo">Momo</SelectItem>
                          <SelectItem value="VnPay">VNPay</SelectItem>
                          <SelectItem value="PayOS">PayOs</SelectItem>
                          <SelectItem value="ZaloPay">ZaloPay</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              {!isCustomerInfoConfirmed && (
                <Button
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  type="submit"
                >
                  Confirm Information
                </Button>
              )}
              {isCustomerInfoConfirmed && !isOrderConfirmed && (
                <>
                  <Button
                    variant={"outline"}
                    type="button"
                    onClick={handleCancelOrder}
                  >
                    Cancel Order
                  </Button>
                  <Button
                    className="bg-green-500 hover:bg-green-600 text-white"
                    type="button"
                    onClick={handleConfirmOrder}
                  >
                    Confirm Order
                  </Button>
                </>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default GenerateEtagById;
