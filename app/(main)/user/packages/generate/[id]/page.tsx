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
  createOrder,
  deleteOrder,
  confirmOrder,
} from "@/components/services/orderuserServices";
import { GenerateEtag } from "@/components/services/etagService";
import { ETagServices } from "@/components/services/etagService";
import paymentService from "@/components/services/paymentService";
import {
  customerFormSchema,
  etagFormSchema,
  CustomerFormValues,
  EtagFormValues,
  GenerateEtagProps,
} from "@/lib/validation";
import { Card } from "@/components/ui/card";
import { useEtagHandlers } from "@/handlers/etag/useEtagHandlesForPackage";
const GenerateEtagById = ({ params }: GenerateEtagProps) => {
  const [endDate, setEndDate] = useState("");
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [packageData, setPackageData] = useState<any>(null);

  const [cachedEtagFormData, setCachedEtagFormData] = useState({});

  const customerForm = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      customerName: "",
      phoneNumber: "",
      address: "",
      cccd: "",
      paymentMethod: "Cash",
      gender: "male",
      quantity: 1,
      price: 0,
    },
  });
  const etagForm = useForm<EtagFormValues>({
    resolver: zodResolver(etagFormSchema),
    defaultValues: {
      etagStartDate: new Date().toISOString().split("T")[0],
      etagEndDate: new Date().toISOString().split("T")[0],
    },
    mode: "all",
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
    isEtagInfoConfirmed,
    isCashPaymentConfirmed,
    isOrderConfirmed,
    orderId,
    etagData,
    handleCustomerInfoSubmit,
    handleEtagSubmit,
    handleConfirmEtag,
    handleCancelOrder,
    handleConfirmOrder,
  } = useEtagHandlers({
    customerForm,
    etagForm,
    packageData,
  });
  useEffect(() => {
    const validateForm = async () => {
      await etagForm.trigger();
    };
    validateForm();
  }, [endDate, etagForm]);
  useEffect(() => {
    const fetchPackageData = async () => {
      setIsLoading(true);
      try {
        const response = await PackageServices.getPackageById(params.id);
        const pkgData = response.data.data.package;
        if (pkgData) {
          setPackageData(pkgData);
          if (
            pkgData.packageETagTypeMappings &&
            pkgData.packageETagTypeMappings.length > 0
          ) {
            const etagTypeMapping = pkgData.packageETagTypeMappings[0];
            if (
              etagTypeMapping &&
              etagTypeMapping.etagType &&
              etagTypeMapping.etagType.id
            ) {
              const etagId = etagTypeMapping.etagType.id;
              localStorage.setItem("etagTypeId", etagId);
              console.log("EtagTypeId stored in localStorage:", etagId);
            } else {
              console.warn("EtagType or its ID is missing in the package data");
              setError(
                "EtagType information is incomplete. Please check the package configuration."
              );
            }
          } else {
            console.warn(
              "No packageETagTypeMappings found in the package data"
            );
            setError(
              "No E-Tag type information found for this package. Please check the package configuration."
            );
          }
        } else {
          throw new Error("Package data is missing in the response");
        }
      } catch (err) {
        console.error("Error fetching package data:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An unknown error occurred while fetching package data"
        );
        toast({
          title: "Error",
          description: "Failed to load package data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPackageData();
  }, [params.id, toast]);

  // const handleCancelEtag = () => {
  //   setIsEtagInfoConfirmed(false);
  //   setIsCustomerInfoConfirmed(false);
  //   Object.entries(cachedEtagFormData).forEach(([key, value]) => {
  //     if (typeof value === 'string' || typeof value === 'number') {
  //       etagForm.setValue(key as keyof EtagFormValues, value);
  //     }
  //   });
  //   toast({
  //     title: 'Information Editing Enabled',
  //     description: 'You can now edit both customer and E-tag information.',
  //   });
  // };

  useEffect(() => {
    const { etagStartDate, etagEndDate } = etagForm.watch();
    if (etagStartDate && etagEndDate) {
      const start = new Date(etagStartDate);
      const end = new Date(etagEndDate);
    }
  }, [etagForm.watch("etagStartDate"), etagForm.watch("etagEndDate")]);

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
                  <p className="text-xl font-semibold text-green-600 dark:text-green-400 mt-6">
                    {formatCurrency(packageData.price)}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2 mt-4">
                    Description
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {packageData.description}
                  </p>
                </div>
                {packageData?.packageETagTypeMappings?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2 mt-4">
                      Bao gồm E-Tag Type
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {packageData?.packageETagTypeMappings[0]?.etagType?.name}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mt-4">
                      {formatCurrency(
                        packageData?.packageETagTypeMappings[0]?.etagType
                          ?.amount
                      )}
                    </p>
                  </div>
                )}
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
                  name="cccd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        CCCD:
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
                          <SelectItem value="male">Nam</SelectItem>
                          <SelectItem value="female">Nữ</SelectItem>
                          <SelectItem value="other">Khác</SelectItem>
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
              </div>
            </div>
            <div className="flex justify-end">
              {!isCustomerInfoConfirmed && (
                <Button type="submit">Confirm Information</Button>
              )}
            </div>
          </form>
        </Form>
      </div>
      {isCustomerInfoConfirmed && (
        <div className="container mx-auto px-4 w-full max-w-5xl">
          <Form {...etagForm}>
            <form
              onSubmit={(e) => {
                etagForm.handleSubmit(handleEtagSubmit)(e);
              }}
              className="space-y-6 mt-8"
            >
              <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-12 text-center">
                  Thông Tin ETag
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={etagForm.control}
                    name="etagStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Ngày Bắt Đầu
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={etagForm.control}
                    name="etagEndDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Ngày Kết Thúc
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                            value={endDate || field.value || ""}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              setEndDate(newValue);
                              field.onChange(newValue);
                            }}
                            onBlur={() => {
                              field.onBlur();
                              etagForm.trigger("etagEndDate");
                            }}
                            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                {!isEtagInfoConfirmed ? (
                  <>
                    {/* <Button type="button" onClick={handleCancelEtag}>
                    Cancel
                  </Button> */}
                    <Button type="button" onClick={handleConfirmEtag}>
                      Confirm E-tag Information
                    </Button>
                  </>
                ) : !isOrderConfirmed ? (
                  <>
                    <Button type="button" onClick={handleCancelOrder}>
                      Cancel Order
                    </Button>
                    <Button type="button" onClick={handleConfirmOrder}>
                      Confirm Order
                    </Button>
                  </>
                ) : (
                  <>
                    <Button type="submit">Generate E-Tag</Button>
                  </>
                )}
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
};
export default GenerateEtagById;
