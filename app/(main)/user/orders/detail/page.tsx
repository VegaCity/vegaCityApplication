// orderDetail.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Order } from "@/types/paymentFlow/orderUser";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { GetOrdersById } from "@/components/services/orderuserServices";

const OrderDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        const response = await GetOrdersById(params.id as string);

        if (response.statusCode === 200) {
          setOrder(response.data);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardContent className="pt-6">
          <div className="text-center text-red-500">{error}</div>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!order) return null;

  return (
    <div className="container mx-auto py-8">
      <Button className="mb-6" variant="outline" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <div className="font-semibold">Order ID</div>
              <div>{order.id}</div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <div className="font-semibold">Customer Name</div>
              <div>{order.name}</div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <div className="font-semibold">Payment Type</div>
              <div>{order.paymentType}</div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <div className="font-semibold">Total Amount</div>
              <div>{order.totalAmount.toLocaleString()} VND</div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <div className="font-semibold">Status</div>
              <div>
                <span
                  className={`px-2 py-1 rounded-full text-sm ${
                    order.status === "COMPLETED"
                      ? "bg-green-100 text-green-800"
                      : order.status === "PENDING"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>
            {/* Thêm các trường thông tin khác của order nếu cần */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetailPage;
