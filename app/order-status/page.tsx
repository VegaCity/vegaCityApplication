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

  const continueEtag = () => {
    const etagId = localStorage.getItem("packageOrderId");
    if (etagId) {
      // router.push(`/user/etags/detail/${etagId}`);
      router.push(`/`);
    } else {
      router.push("/");
    }
  };
  const orderId = localStorage.getItem("orderId");
  const invoiceId = localStorage.getItem("invoiceId");

  const handleFailure = () => {
    router.push("/");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[850px]">
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
                Đơn hàng #{invoiceId} đã được thanh toán thành công.
              </p>
              {/* {orderDetails.total && (
                <p className="text-sm text-gray-500">
                  Số tiền đã thanh toán: {orderDetails.total}
                </p>
              )} */}
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
            <Button onClick={continueEtag}>Back to Home</Button>
          ) : (
            <Button onClick={handleFailure} variant="destructive">
              Back
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
