"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PackageServices } from "@/components/services/packageServices";
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
  GenerateEtagProps,
} from "@/lib/validation";
import { Card } from "@/components/ui/card";
import { useEtagHandlers } from "@/handlers/etag/useEtagHandlesForPackage";

const GenerateEtagById = ({ params }: GenerateEtagProps) => {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [packageData, setPackageData] = useState<any>(null);

  const customerForm = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      customerName: "",
      phoneNumber: "",
      address: "",
      cccdPassport: "",
      paymentMethod: "Cash",
      gender: "0",
      email: "",
      quantity: 1,
      price: 0,
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
  });

  useEffect(() => {
    const fetchPackageData = async () => {
      setIsLoading(true);
      try {
        const {
          data: { data: packageData },
        } = await PackageServices.getPackageById(params.id);
        localStorage.setItem("packageId", params.id);
        if (!packageData) {
          throw new Error("No package data received from the server");
        }
        if (!packageData.packageType?.id) {
          console.warn("Package type information is missing or incomplete");
        }
        setPackageData(packageData);
      } catch (error) {
        console.error("Error fetching package data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPackageData();
  }, [params.id, toast]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <BackButton text="Back To Packages" link="/user/packages" />
      <h3 className="text-2xl mb-4">Generate E-Tag</h3>
      <div className="mb-8 flex justify-center">
        <Card className="overflow-hidden w-full max-w-4xl">
          {packageData && (
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2">
                <img
                  src={packageData.imageUrl}
                  alt={packageData.name}
                  className="w-80 h-100 rounded-lg shadow-lg"
                />
              </div>
              <div className="md:w-1/2 p-8 flex flex-col justify-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                    {packageData.name}
                  </h2>
                  <p className="text-xl text-red-600 dark:text-red-400 mt-6">
                    {formatCurrency(packageData.price)}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2 mt-4">
                    Type
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {packageData.packageType?.name}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="container mx-auto px-4 w-full max-w-5xl">
        <Form {...customerForm}>
          <form
            onSubmit={customerForm.handleSubmit(handleCustomerInfoSubmit)}
            className="space-y-6"
          >
            <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-14 text-center">
                Thông Tin Khách Hàng
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={customerForm.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium dark:text-gray-300">
                        Họ và Tên
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white"
                          placeholder="Nhập họ và tên"
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
                        Số điện thoại
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white"
                          placeholder="Nhập số điện thoại"
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
                          placeholder="Nhập CCCD"
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
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Giới tính
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isCustomerInfoConfirmed}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn giới tính" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Nam</SelectItem>
                          <SelectItem value="1">Nữ</SelectItem>
                          <SelectItem value="2">Khác</SelectItem>
                        </SelectContent>
                      </Select>
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
                        Số lượng
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white"
                          disabled={isCustomerInfoConfirmed}
                          onChange={(e) => {
                            field.onChange(e.target.valueAsNumber);
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
                        Giá tiền
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          {...field}
                          className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white"
                          disabled={isCustomerInfoConfirmed}
                          value={field.value?.toLocaleString("en-US")}
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(/,/g, "");
                            const numericValue = parseFloat(rawValue) || 0;
                            field.onChange(numericValue);
                          }}
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
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Địa chỉ
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white"
                          placeholder="Nhập địa chỉ"
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
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phương thức Thanh Toán
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
                          <SelectItem value="Cash">Tiền mặt</SelectItem>
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
                          placeholder="Nhập email"
                          {...field}
                          disabled={isCustomerInfoConfirmed}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              {!isCustomerInfoConfirmed && (
                <Button type="submit">Confirm Information</Button>
              )}
              {isCustomerInfoConfirmed && !isOrderConfirmed && (
                <>
                  <Button type="button" onClick={handleCancelOrder}>
                    Cancel Order
                  </Button>
                  <Button type="button" onClick={handleConfirmOrder}>
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
