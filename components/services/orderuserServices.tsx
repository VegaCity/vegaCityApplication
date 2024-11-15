import { API } from "@/components/services/api";
import {
  OrderData,
  ConfirmOrderData,
  ConfirmOrderForChargeData,
  OrderStoreData,
  ConfirmOrderForGenerateNewCardData,
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
  const storedInvoiceId = localStorage.getItem("invoiceId");
  if (storedInvoiceId) {
    return API.get(`/order/?invoiceId=${storedInvoiceId}`);
  } else if (id) {
    return API.get(`/order/?id=${id}`);
  } else {
    throw new Error("Either 'id' or 'rfId' must be provided.");
  }
};
export const GetOrdersDetails = async (id: string) => {
  try {
    const response = await API.get(`/order/?id=${id}`);
    return response.data;
  } catch (error) {
    console.error("Error getting order details:", error);
    throw error;
  }
};

// getPackageItemById({ id, rfId }: GetPackageItemByIdParams) {
//   if (id) {
//     return API.get(`/package-item/?id=${id}`);
//   } else if (rfId) {
//     return API.get(`/package-item/?rfId=${rfId}`);
//   } else {
//     throw new Error("Either 'id' or 'rfId' must be provided.");
//   }
// },

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
export const confirmOrderForGenerateNewVCard = async (
  confirmData: ConfirmOrderForGenerateNewCardData
) => {
  try {
    const response = await API.post("/order/cashier/confirm", confirmData);
    return response.data;
  } catch (error) {
    console.error("Error confirming order:", error);
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
