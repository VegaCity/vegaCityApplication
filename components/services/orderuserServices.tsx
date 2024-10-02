import { API } from '@/components/services/api';
import { OrderData, ConfirmOrderData } from '@/types/orderUser';

export const createOrder = async (orderData: OrderData) => {
  try {
    const response = await API.post('/order/cashier', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const confirmOrder = async (confirmData: ConfirmOrderData) => {
  try {
    const response = await API.post('/order/cashier/confirm', confirmData);
    return response.data;
  } catch (error) {
    console.error('Error confirming order:', error);
    throw error;
  }
};

export const deleteOrder = async (id: string) => {
  try {
    const response = await API.delete(`/order/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};