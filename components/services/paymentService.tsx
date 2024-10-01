import { API } from "@/components/services/api";

interface PaymentRequest {
  invoiceId: string;
  key?: string;
  urlDirect?: string;
  urlIpn?: string;
}

const paymentService = {
  vnpay: async (data: PaymentRequest) => {
    try {
      const response = await API.post('/payment/vnpay', {
        invoiceId: data.invoiceId,
        ...(data.key && { key: data.key }),
        ...(data.urlDirect && { urlDirect: data.urlDirect }),
        ...(data.urlIpn && { urlIpn: data.urlIpn }),
      });
      return response.data;
    } catch (error) {
      console.error("VNPay payment error:", error);
      throw error;
    }
  },

  momo: async (data: PaymentRequest) => {
    try {
      const response = await API.post('/payment/momo', {
        invoiceId: data.invoiceId,
        ...(data.key && { key: data.key }),
        ...(data.urlDirect && { urlDirect: data.urlDirect }),
        ...(data.urlIpn && { urlIpn: data.urlIpn }),
      });
      return response.data;
    } catch (error) {
      console.error("Momo payment error:", error);
      throw error;
    }
  },
};

export default paymentService;