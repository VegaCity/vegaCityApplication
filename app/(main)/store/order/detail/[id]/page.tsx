"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { OrderDetailResponse } from "@/types/paymentFlow/orderUser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Package,
  Receipt,
  AlertCircle,
  Mail,
  Phone,
  CreditCard as PaymentIcon,
  User,
  FileText,
} from "lucide-react";
import {
  detailOrder,
  GetOrdersById,
  GetOrderDetailById,
} from "@/components/services/orderuserServices";
import { ProductServices } from "@/components/services/productServices";

const OrderDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<
    OrderDetailResponse["data"]["orderExist"] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productDetails, setProductDetails] = useState<any[]>([]);
  const [storeType, setStoreType] = useState<number>(0);

  useEffect(() => {
    const fetchOrderAndProductDetails = async () => {
      try {
        setLoading(true);
        const response = await detailOrder(params.id as string);
        const orderDetailResponse = await GetOrderDetailById(
          params.id as string
        );

        if (response.data.orderExist) {
          setOrder({
            ...response.data.orderExist,
            ...orderDetailResponse.data,
          });

          if (response.data.orderExist.orderDetails) {
            const productPromises = response.data.orderExist.orderDetails.map(
              async (detail: any) => {
                if (detail.productId) {
                  const productResponse = await ProductServices.getProductById(
                    detail.productId
                  );
                  return {
                    ...productResponse.data,
                    quantity: detail.quantity,
                  };
                }
                return null;
              }
            );

            const products = await Promise.all(productPromises);
            setProductDetails(products.filter((p) => p !== null));
          }
        } else {
          setError("Could not find order details");
        }
      } catch (err) {
        setError("Error loading order details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchOrderAndProductDetails();
    }
  }, [params.id]);

  useEffect(() => {
    const storedType = localStorage.getItem("storeType");
    setStoreType(storedType ? parseInt(storedType) : 0);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-lg mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                {error}
              </h3>
              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="inline-flex items-center"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Orders
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return "bg-green-50 text-green-700 ring-1 ring-green-600/20";
      case "PENDING":
        return "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20";
      case "CANCELED":
        return "bg-red-50 text-red-700 ring-1 ring-red-600/20";
      case "RENTING":
        return "bg-green-50 text-green-700 ring-1 ring-green-600/20";
      default:
        return "bg-gray-50 text-gray-700 ring-1 ring-gray-600/20";
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>

        <Card className="mb-6">
          <CardHeader className="border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl">Order Details</CardTitle>
                <p className="text-gray-500 mt-1">#{order.invoiceId}</p>
              </div>
              <span
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="flex items-start">
                <Receipt className="h-5 w-5 text-gray-400 mt-1" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Order Name
                  </p>
                  <p className="mt-1 text-base text-gray-900">{order.name}</p>
                </div>
              </div>

              <div className="flex items-start">
                <CreditCard className="h-5 w-5 text-gray-400 mt-1" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Payment Type
                  </p>
                  <p className="mt-1 text-base text-gray-900">
                    {order.payments?.[0]?.name || ""}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-400 mt-1" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Create Date
                  </p>
                  <p className="mt-1 text-base text-gray-900">
                    {formatDate(order.crDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Package className="h-5 w-5 text-gray-400 mt-1" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Sale Type</p>
                  <p className="mt-1 text-base text-gray-900">
                    {order.saleType || ""}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CreditCard className="h-5 w-5 text-gray-400 mt-1" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">VCard Id</p>
                  <p className="mt-1 text-base text-gray-900">
                    {order.packageOrder?.vcardId || ""}
                  </p>
                </div>
              </div>

              <div className="col-span-2 space-y-4 border-t border-gray-200 pt-4 mt-4">
                <p className="text-sm font-medium text-gray-500">Products</p>
                {productDetails.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
                  >
                    <div className="flex items-start space-x-4">
                      <Package className="h-5 w-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-base font-medium text-gray-900">
                          {product?.data?.name || ""}
                        </p>
                        {storeType === 2 &&
                          order.orderDetails?.[index]?.startRent && (
                            <div className="mt-2">
                              <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                <span className="font-medium">Start</span>
                                <span className="mx-2 text-gray-400">
                                  (
                                  {formatDate(
                                    order.orderDetails[index].startRent
                                  )}
                                  )
                                </span>
                                <span className="mx-4 text-gray-400">to</span>
                                <span className="font-medium">End</span>
                                <span className="mx-2 text-gray-400">
                                  (
                                  {formatDate(
                                    order.orderDetails[index].endRent
                                  )}
                                  )
                                </span>
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="text-base font-medium text-gray-900">
                        {formatAmount(
                          order.orderDetails?.[index]?.finalAmount || 0
                        )}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        × {product?.quantity || 0}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Seller Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start">
                  <User className="h-5 w-5 text-gray-400 mt-1" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Seller Name
                    </p>
                    <p className="mt-1 text-base text-gray-900">
                      {order.user?.fullName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-gray-400 mt-1" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Seller Email
                    </p>
                    <p className="mt-1 text-base text-gray-900">
                      {order.user?.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start">
                  <FileText className="h-5 w-5 text-gray-400 mt-1" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      CCCD/Passport
                    </p>
                    <p className="mt-1 text-base text-gray-900">
                      {order.user?.cccdPassport}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Balance Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {order.payments?.[0]?.name === "Cash" ? (
                // Display only 3 fields for Cash payment
                <div className="space-y-6 col-span-2">
                  <div className="flex items-start">
                    <CreditCard className="h-5 w-5 text-gray-400 mt-1" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">
                        Balance At Present
                      </p>
                      <p className="mt-1 text-base text-gray-900">
                        {formatAmount(order.balanceAtPresent || 0)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <CreditCard className="h-5 w-5 text-gray-400 mt-1" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">
                        Virtual Currency Before
                      </p>
                      <p className="mt-1 text-base text-gray-900">
                        {formatAmount(order.balanceHistoryBefore || 0)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <CreditCard className="h-5 w-5 text-gray-400 mt-1" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">
                        Virtual Currency After
                      </p>
                      <p className="mt-1 text-base text-gray-900">
                        {formatAmount(order.balanceHistoryAfter || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                // Display all fields for non-Cash payments
                <>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <CreditCard className="h-5 w-5 text-gray-400 mt-1" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">
                          Price Transfer To Vega
                        </p>
                        <p className="mt-1 text-base text-gray-900">
                          {formatAmount(order.priceTransferToVega || 0)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <CreditCard className="h-5 w-5 text-gray-400 mt-1" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">
                          Price Store Handle
                        </p>
                        <p className="mt-1 text-base text-gray-900">
                          {formatAmount(order.priceStoreHandle || 0)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <CreditCard className="h-5 w-5 text-gray-400 mt-1" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">
                          Balance At Present
                        </p>
                        <p className="mt-1 text-base text-gray-900">
                          {formatAmount(order.balanceAtPresent || 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start">
                      <CreditCard className="h-5 w-5 text-gray-400 mt-1" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">
                          Virtual Currency Before
                        </p>
                        <p className="mt-1 text-base text-gray-900">
                          {formatAmount(order.balanceHistoryBefore || 0)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <CreditCard className="h-5 w-5 text-gray-400 mt-1" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">
                          Virtual Currency After
                        </p>
                        <p className="mt-1 text-base text-gray-900">
                          {formatAmount(order.balanceHistoryAfter || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <p className="text-lg font-medium text-gray-900">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatAmount(order.totalAmount)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderDetailPage;
