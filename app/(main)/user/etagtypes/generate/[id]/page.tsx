"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ETagTypeServices } from "@/components/services/etagtypeServices";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  customerFormSchema,
  etagFormSchema,
  CustomerFormValues,
  EtagFormValues,
  GenerateEtagProps,
} from "@/lib/validation";
import { useEtagHandlers } from "@/handlers/etag/useEtagHandlersForEtagType";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(value);
};
const saveEtagTypeId = (etagTypeId: string) => {
  localStorage.setItem("etagTypeId", etagTypeId);
};
const GenerateEtagById = ({ params }: GenerateEtagProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [endDate, setEndDate] = useState("");
  const [etagInfo, setEtagInfo] = useState({
    id: "",
    name: "",
    bonusRate: 0,
    amount: 0,
    imageUrl: "",
  });

  const customerForm = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      customerName: "",
      phoneNumber: "",
      address: "",
      cccdPassport: "",
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

  const {
    isCustomerInfoConfirmed,
    isEtagInfoConfirmed,
    isOrderConfirmed,
    handleCancelEtag,
    handleCancelOrder,
    handleCustomerInfoSubmit,
    handleEtagSubmit,
    handleConfirmEtag,
    handleConfirmOrder,
  } = useEtagHandlers({
    customerForm,
    etagForm,
    etagInfo,
  });

  useEffect(() => {
    const validateForm = async () => {
      await etagForm.trigger();
    };
    validateForm();
  }, [endDate, etagForm]);

  useEffect(() => {
    const fetchEtagData = async () => {
      try {
        const response = await ETagTypeServices.getETagTypeById(params.id);
        const etagData = response.data.data.etagType;
        if (etagData) {
          setEtagInfo({
            id: etagData.id,
            name: etagData.name,
            bonusRate: etagData.bonusRate,
            amount: etagData.amount,
            imageUrl: etagData.imageUrl || "/path/to/placeholder-image.jpg",
          });
          saveEtagTypeId(etagData.id);
        } else {
          setError("No E-Tag data found");
        }
      } catch (err) {
        console.error("Error fetching E-Tag data:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchEtagData();
  }, [params.id]);

  if (isLoading) return <div className="text-center p-4">Loading...</div>;
  if (error)
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <BackButton text="Back To E-Tag Types" link="/user/etagtypes" />
      <h3 className="text-2xl font-bold mb-6">
        Generate E-Tag for {etagInfo.name}
      </h3>
      <div className="mb-8 flex justify-center">
        <Card className="overflow-hidden w-full px-4 max-w-4xl">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2">
              <img
                src={etagInfo.imageUrl}
                alt={etagInfo.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:w-1/2 p-8 flex flex-col justify-center">
              <h2 className="text-2xl font-semibold mb-2">{etagInfo.name}</h2>
              <p className="text-xl font-bold text-green-600 mb-2">
                {formatCurrency(etagInfo.amount)}
              </p>
              <p className="text-sm text-gray-600">
                Bonus Rate:
                <span className="font-semibold text-red-500">
                  {etagInfo.bonusRate}%
                </span>
              </p>
            </div>
          </div>
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
                    <Button type="button" onClick={handleCancelEtag}>
                      Cancel
                    </Button>
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
