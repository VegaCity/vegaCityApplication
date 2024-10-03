'use client';

import { useOrderStatus } from '@/components/hooks/useOrderStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';

export default function OrderStatusPage() {
  const { isSuccess, orderDetails, goToHomePage } = useOrderStatus();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-center">
            {isSuccess ? 'Giao dịch thành công!' : 'Giao dịch thất bại'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {isSuccess ? (
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          ) : (
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          )}
          <p className="text-gray-600 mb-4">
            {isSuccess
              ? `Cảm ơn bạn đã đặt hàng. Đơn hàng #${orderDetails.orderId} của bạn đã được xác nhận.`
              : 'Rất tiếc, đã xảy ra lỗi trong quá trình xử lý đơn hàng của bạn.'}
          </p>
          {isSuccess && (
            <p className="text-sm text-gray-500">
              Tổng giá trị đơn hàng: ${orderDetails.total}
            </p>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <Button onClick={goToHomePage}>Quay lại trang chủ</Button>
        </CardFooter>
      </Card>
    </div>
  );
}