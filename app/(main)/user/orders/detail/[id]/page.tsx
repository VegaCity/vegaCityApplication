"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { OrderDetailResponse } from "@/types/paymentFlow/orderUser";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Package,
  Receipt,
  AlertCircle,
} from "lucide-react";
import { GetOrdersById } from "@/components/services/orderuserServices";

const OrderDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<
    OrderDetailResponse["data"]["orderExist"] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        const response = await GetOrdersById(params.id as string);
        if (response.data.orderExist) {
          setOrder(response.data.orderExist);
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
      fetchOrderDetail();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-20 h-20 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <div className="text-xl font-medium text-red-500 mb-6">{error}</div>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Orders
          </Button>
        </div>
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
        return "bg-green-50 text-green-700 border-green-200";
      case "PENDING":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "CANCELED":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="max-h-screen">
      <div className="container max-w-6xl mx-auto py-8 px-4 ">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header Section */}
          <div className="border-b border-gray-100 p-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Order Details
                </h1>
                <p className="text-gray-500 mt-2 text-lg">#{order.invoiceId}</p>
              </div>
              <div
                className={`px-6 py-3 rounded-full border ${getStatusColor(
                  order.status
                )} text-lg font-medium`}
              >
                {order.status}
              </div>
            </div>
          </div>

          {/* Order Details Section */}
          <div className="p-8  box-border  border-2">
            <div className="grid grid-cols-2 gap-12 mb-12">
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <Receipt className="w-6 h-6 text-gray-400 mt-1" />
                  <div>
                    <p className="text-base font-medium text-gray-500">
                      Order Name
                    </p>
                    <p className="mt-1 text-xl text-gray-900">{order.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Calendar className="w-6 h-6 text-gray-400 mt-1" />
                  <div>
                    <p className="text-base font-medium text-gray-500">
                      Create Date
                    </p>
                    <p className="mt-1 text-xl text-gray-900">
                      {formatDate(order.crDate)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <CreditCard className="w-6 h-6 text-gray-400 mt-1" />
                  <div>
                    <p className="text-base font-medium text-gray-500">
                      Payment Type
                    </p>
                    <p className="mt-1 text-xl text-gray-900">
                      {order.paymentType}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Package className="w-6 h-6 text-gray-400 mt-1" />
                  <div>
                    <p className="text-base font-medium text-gray-500">
                      Sale Type
                    </p>
                    <p className="mt-1 text-xl text-gray-900">
                      {order.saleType}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Total Amount Section */}

        <div className="flex items-start gap-4 mt-4 mb-4 box-border  border-2 p-4 ">
          <div className="grid grid-cols-2 gap-12 mb-12">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <Receipt className="w-6 h-6 text-gray-400 mt-1" />
                <div>
                  <p className="text-base font-medium text-gray-500">
                    Customer Name
                  </p>
                  <p className="mt-1 text-xl text-gray-900">
                    {order.packageOrders[0].cusName}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Receipt className="w-6 h-6 text-gray-400 mt-1" />
                <div>
                  <p className="text-base font-medium text-gray-500">
                    Customer Email
                  </p>
                  <p className="mt-1 text-xl text-gray-900">
                    {order.packageOrders[0].cusEmail}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <CreditCard className="w-6 h-6 text-gray-400 mt-1" />
                <div>
                  <p className="text-base font-medium text-gray-500">
                    Customer Phone
                  </p>
                  <p className="mt-1 text-xl text-gray-900">
                    {order.packageOrders[0].phoneNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Package className="w-6 h-6 text-gray-400 mt-1" />
                <div>
                  <p className="text-base font-medium text-gray-500">
                    Customer CCCD/Passport
                  </p>
                  <p className="mt-1 text-xl text-gray-900">
                    {order.packageOrders[0].cusCccdpassport}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t-4 border-gray-100 pt-8 ">
        <div className="flex justify-between items-center">
          <p className="text-2xl font-medium text-gray-900">Total Amount</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatAmount(order.totalAmount)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
