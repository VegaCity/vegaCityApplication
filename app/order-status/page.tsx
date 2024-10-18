"use client";

import { useOrderStatus } from "@/components/hooks/useOrderStatus";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import { Suspense } from "react";
import { useRouter } from "next/navigation";

export default function OrderStatusPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderStatusContent />
    </Suspense>
  );
}

function OrderStatusContent() {
  const { isSuccess, orderDetails } = useOrderStatus();
  const router = useRouter();

  // Redirect back to E-tag generation page
  const continueEtagGeneration = () => {
    const etagTypeId = localStorage.getItem("etagTypeId");
    if (etagTypeId) {
      router.push(`/user/etagtypes/generate/${etagTypeId}`);
    } else {
      router.push("/user/etagtypes");
    }
  };

  // Handle failure case
  const handleFailure = () => {
    router.push("/user/etagtypes");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-center">
            {isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {isSuccess ? (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Đơn hàng #{orderDetails.orderId} đã được thanh toán thành công.
                Vui lòng tiếp tục để tạo E-tag.
              </p>
              {orderDetails.total && (
                <p className="text-sm text-gray-500">
                  Số tiền đã thanh toán: {orderDetails.total}
                </p>
              )}
            </>
          ) : (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Rất tiếc, đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử
                lại.
              </p>
            </>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          {isSuccess ? (
            <Button onClick={continueEtagGeneration}>Tiếp tục tạo E-tag</Button>
          ) : (
            <Button onClick={handleFailure} variant="destructive">
              Quay lại
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
