import { API } from "@/components/services/api";
import {
  OrderData,
  ConfirmOrderData,
  ConfirmOrderForChargeData,
  OrderStoreData,
} from "@/types/paymentFlow/orderUser";
export const GetOrders = async (page: number) => {
  try {
    const response = await API.get(`/orders?page=${page}`);
    return response.data;
  } catch (error) {
    console.error("Error getting orders:", error);
    throw error;
  }
};
export const GetOrdersById = async (id: string) => {
  try {
    const response = await API.get(`/orders?id=${id}`);
    return response.data;
  } catch (error) {
    console.error("Error getting orders:", error);
    throw error;
  }
};

export const createOrder = async (orderData: OrderData) => {
  try {
    const response = await API.post("/order/cashier", orderData);
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};
export const createOrderStore = async (orderStoreData: OrderStoreData) => {
  try {
    const response = await API.post("/order", orderStoreData);
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

export const confirmOrderForCharge = async (
  confirmData: ConfirmOrderForChargeData
) => {
  try {
    const response = await API.post("/order/cashier/confirm", confirmData);
    return response.data;
  } catch (error) {
    console.error("Error confirming order:", error);
    throw error;
  }
};
export const confirmOrder = async (confirmData: ConfirmOrderData) => {
  try {
    const response = await API.post("/order/confirm", confirmData);
    return response.data;
  } catch (error) {
    console.error("Error confirming order:", error);
    throw error;
  }
};

export const deleteOrder = async (id: string) => {
  try {
    const response = await API.delete(`/order/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
};
export const detailOrder = async (id: string) => {
  try {
    const response = await API.get(`/order/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
};
