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
import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";

// Define types for mobile app interfaces
interface WebkitMessageHandler {
  postMessage: (message: any) => void;
}

interface Webkit {
  messageHandlers?: {
    paymentCallback?: WebkitMessageHandler;
  };
}

interface AndroidInterface {
  onPaymentStatus: (status: string, data: string) => void;
}

// Extend Window interface to include mobile app specific properties
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
    webkit?: Webkit;
    Android?: AndroidInterface;
  }
}

// Helper function to detect if running in mobile app webview
const isMobileApp = (): boolean => {
  if (typeof window === "undefined") return false;

  const userAgent = window.navigator.userAgent.toLowerCase();
  return (
    userAgent.includes("wv") || // Android WebView
    userAgent.includes("mobileapp") || // Custom app identifier
    window.ReactNativeWebView !== undefined
  ); // React Native WebView
};

// Define type for payment status data
interface PaymentStatusData {
  orderId?: string | null;
  invoiceId?: string | null;
  orderDetails?: any;
  deepLink?: string;
}

// Helper function to generate deep link URL
const generateDeepLink = (status: string, data: PaymentStatusData): string => {
  const params = new URLSearchParams({
    status,
    orderId: data.orderId || "",
    invoiceId: data.invoiceId || "",
  });

  return `https://www.VegaCity.com?${params.toString()}`;
};

// Helper function to communicate with mobile app
const sendToMobileApp = (status: string, data: PaymentStatusData): void => {
  const deepLink = generateDeepLink(status, data);
  const messageData = {
    ...data,
    deepLink,
    type: "PAYMENT_STATUS",
    status,
  };

  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify(messageData));
  } else if (window.webkit?.messageHandlers?.paymentCallback) {
    window.webkit.messageHandlers.paymentCallback.postMessage(messageData);
  } else if (window.Android) {
    window.Android.onPaymentStatus(status, JSON.stringify(messageData));
  }
};

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

  useEffect(() => {
    if (isMobileApp()) {
      const data: PaymentStatusData = {
        orderId: window.ReactNativeWebView
          ? "orderIdFromApp"
          : localStorage.getItem("orderId"),
        invoiceId: window.ReactNativeWebView
          ? "invoiceIdFromApp"
          : localStorage.getItem("invoiceId"),
        orderDetails,
      };

      sendToMobileApp(isSuccess ? "SUCCESS" : "FAILURE", data);
    }
  }, [isSuccess, orderDetails]);

  const handleContinue = (): void => {
    if (isMobileApp()) {
      const data: PaymentStatusData = {
        orderId: window.ReactNativeWebView
          ? "orderIdFromApp"
          : localStorage.getItem("orderId"),
        invoiceId: window.ReactNativeWebView
          ? "invoiceIdFromApp"
          : localStorage.getItem("invoiceId"),
      };
      if (isSuccess) {
        sendToMobileApp("COMPLETED", data);
      }
    } else {
      const etagId = localStorage.getItem("packageOrderId");
      router.push("/");
    }
  };

  const handleFailure = (): void => {
    if (isMobileApp()) {
      const data: PaymentStatusData = {
        orderId: window.ReactNativeWebView
          ? "orderIdFromApp"
          : localStorage.getItem("orderId"),
        invoiceId: window.ReactNativeWebView
          ? "invoiceIdFromApp"
          : localStorage.getItem("invoiceId"),
      };
      sendToMobileApp("CLOSE", data);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-[850px] mx-4">
        <CardHeader>
          <CardTitle className="text-center">
            {isSuccess ? "Payment successful!" : "Payment failed!"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {isSuccess ? (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Order{" "}
                {window.ReactNativeWebView
                  ? "invoiceIdFromApp"
                  : localStorage.getItem("invoiceId")}{" "}
                payment was successful.
              </p>
            </>
          ) : (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Sorry! Some problem has occurred! Please try again!
              </p>
            </>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          {isSuccess ? (
            <Button onClick={handleContinue}>Back to Home</Button>
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
