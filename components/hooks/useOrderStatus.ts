'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { detailOrder } from '@/components/services/orderuserServices';

export const useOrderStatus = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState({ orderId: '', total: 0 });

  const status = searchParams.get('status');
  const orderId = searchParams.get('orderId');
  const isSuccess = status === 'success';

  useEffect(() => {
    if (isSuccess && orderId) {
      detailOrder(orderId).then(setOrderDetails);
    }
  }, [isSuccess, orderId]);

  const goToHomePage = () => router.push('/');

  return { isSuccess, orderDetails, goToHomePage };
};