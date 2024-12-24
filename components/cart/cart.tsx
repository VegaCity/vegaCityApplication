import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
} from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product } from "@/types/store/store";
import { confirmOrder, createOrderStore } from "../services/orderuserServices";
import { PackageItemServices } from "@/components/services/Package/packageItemService";
import paymentService from "../services/paymentService";
import { Toast } from "@/components/ui/toast";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
interface CartItem extends Product {
  quantity: number;
  stockQuantity: number;
  categoryId: string;
}

export interface CartRef {
  addToCart: (product: Product) => void;
}

const ShoppingCartComponent = forwardRef<CartRef>((props, ref) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [vcardCode, setVcardCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("QRCode");
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [paymentError, setPaymentError] = useState("");
  const [storeType, setStoreType] = useState<string>("");
  useEffect(() => {
    const type = localStorage.getItem("storeType");
    console.log("storeType loaded:", type);
    setStoreType(type || "");
  }, []);


  useImperativeHandle(ref, () => ({
    addToCart: (product: Product) => {
      setCartItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.id === product.id);

        // Kiểm tra số lượng tồn kho
        if (existingItem) {
          // Nếu số lượng hiện tại + 1 vượt quá số lượng tồn kho
          if (existingItem.quantity + 1 > product.quantity) {
            toast.error(
              `Sản phẩm "${product.name}" không đủ số lượng trong kho. Chỉ còn ${product.quantity} sản phẩm.`
            );
            return prevItems;
          }

          return prevItems.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }

        // Kiểm tra nếu sản phẩm hết hàng
        if (product.quantity === 0) {
          toast.error(`Sản phẩm "${product.name}" hiện đã hết hàng.`);
          return prevItems;
        }

        return [
          ...prevItems,
          {
            ...product,
            quantity: 1,
            stockQuantity: product.quantity,
            categoryId: product.productCategoryId || "Unknown",
          } as CartItem,
        ];
      });

      setIsOpen(true);
    },
  }));

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId)
    );
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setCartItems((prevItems) => {
      const item = prevItems.find((item) => item.id === productId);
      if (item && newQuantity > item.stockQuantity) {
        toast.error(
          `Sản phẩm "${item.name}" không đủ số lượng trong kho. Chỉ còn ${item.stockQuantity} sản phẩm.`
        );
        return prevItems;
      }

      return prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  };



  const totalPrice = cartItems.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
  const resetPaymentState = () => {
    setIsPaymentModalOpen(false);
    setPaymentStatus("idle");
    setVcardCode("");
    setCartItems([]);
  };
  const initiatePayment = async (paymentMethod: string, invoiceId: string) => {
    try {
      let paymentResponse;
      switch (paymentMethod) {
        case "Momo":
          paymentResponse = await paymentService.momo({
            invoiceId,
          });
          break;
        case "VnPay":
          paymentResponse = await paymentService.vnpay({
            invoiceId,
          });
          break;
        case "PayOS":
          paymentResponse = await paymentService.payos({
            invoiceId,
          });
          break;
        case "ZaloPay":
          paymentResponse = await paymentService.zalopay({
            invoiceId,
          });
          break;
        case "QRCode":
          // Handle QR code payment separately if needed
          return false;
        default:
          throw new Error(`Unsupported payment method: ${paymentMethod}`);
      }

      if (paymentResponse?.statusCode !== 200) {
        throw new Error("Payment service returned non-200 status");
      }

      const paymentUrl = getPaymentUrl(paymentMethod, paymentResponse.data);
      if (!paymentUrl) {
        throw new Error("Payment URL not found in response");
      }

      window.location.href = paymentUrl;
      return true;
    } catch (error) {
      console.error("Payment initiation error:", error);
      throw error;
    }
  };

  const getPaymentUrl = (method: string, data: any): string | null => {
    if (!data) return null;
    switch (method.toLowerCase()) {
      case "momo":
        return data.payUrl || data.shortLink;
      case "vnpay":
        return data.vnPayResponse;
      case "payos":
        return data.checkoutUrl;
      case "zalopay":
        return data.order_url;
      default:
        return null;
    }
  };
  
  async function handleCreateOrder() {
    setPaymentStatus("processing");
    try {
      // Kiểm tra số lượng trước khi tạo đơn hàng
      for (const cartItem of cartItems) {
        // So sánh số lượng trong giỏ với số lượng tồn kho
        if (cartItem.quantity > cartItem.stockQuantity) {
          toast.error(
            `Sản phẩm "${cartItem.name}" không đủ số lượng trong kho. Chỉ còn ${cartItem.stockQuantity} sản phẩm.`
          );
          setPaymentStatus("idle");
          return;
        }
      }

      const storeId = localStorage?.getItem("storeId") ?? "";
      const storeType = localStorage?.getItem("storeType");
     
      setPaymentStatus("processing");
      const isDirectPayment =
        paymentMethod === "QRCode" || paymentMethod === "Cash";

      const orderData = {
        saleType: storeType === "2" ? "Service" : "Product",
        storeId,
        totalAmount: totalPrice,
        packageOrderId: paymentMethod === "QRCode" ? vcardCode : null,
        
        productData: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          productCategory: item.categoryId || "Unknown",
          price: item.price,
          imgUrl: item.imageUrl || "",
          quantity: item.quantity,
        })),
        paymentType: paymentMethod,
      };
      const orderResponse = await createOrderStore(orderData);
      const invoiceId = orderResponse.data.invoiceId;
      const transactionId = orderResponse.data.transactionId;

      if (isDirectPayment) {
        const confirmationResponse = await confirmOrder({
          invoiceId: invoiceId,
          transactionId: transactionId,
        });
        if (confirmationResponse.statusCode === 200) {
          (toast.success as any)({
            title: "Success",
            description: "Payment completed successfully",
            duration: 1000,
          });
          window.location.reload();
          setPaymentStatus("success");
          setTimeout(resetPaymentState, 1000);
        }
      } else {
        const result = await initiatePayment(paymentMethod, invoiceId);
        if (result) {
          setPaymentStatus("success");
        }
      }
    } catch (error: any) {
      console.error("Payment Error:", error);
      setPaymentError(
        error.response?.data?.Error ||
          (error instanceof Error
            ? error.message
            : "Payment failed. Please try again.")
      );
      setPaymentStatus("error");
    }
  }
  const handleCreateOrderClick = () => {
    setIsPaymentModalOpen(true);
  };


  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full w-16 h-16 flex items-center justify-center bg-sky-600"
        >
          <ShoppingCart className="h-6 w-6" />
          {cartItems.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
              {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </Button>

        {isOpen && (
          <div className="absolute bottom-20 right-0 w-96 bg-white rounded-lg shadow-xl p-4">
            <h3 className="text-lg font-semibold mb-4">Shopping Cart</h3>

            {cartItems.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Your cart is empty
              </p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-auto">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 border-b pb-4"
                  >
                    <img
                      src={item.imageUrl || ""}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-500">
                        {item.price.toLocaleString("vi-VN")} đ
                        {storeType === "2"}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          -
                        </Button>
                        <span>{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>{totalPrice.toLocaleString("vi-VN")} đ</span>
              </div>
              <Button
                className="w-full mt-4 bg-sky-600"
                onClick={handleCreateOrderClick}
              >
                Create Order
              </Button>
            </div>
          </div>
        )}

        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Payment</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="payment-method" className="text-sm font-medium">
                  Select Payment Method
                </label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="QRCode">QRCode</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Momo">Momo</SelectItem>
                    <SelectItem value="VnPay">VnPay</SelectItem>
                    <SelectItem value="PayOS">PayOS</SelectItem>
                    <SelectItem value="ZaloPay">ZaloPay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {paymentMethod === "QRCode" && (
                <div className="space-y-2">
                  <label htmlFor="vcard-code" className="text-sm font-medium">
                    Enter Vcard Code
                  </label>
                  <Input
                    id="vcard-code"
                    placeholder="Enter your Vcard code"
                    value={vcardCode}
                    onChange={(e) => {
                      const input = e.target.value;
                      const idIndex = input.lastIndexOf("/");
                      if (idIndex !== -1) {
                        setVcardCode(input.substring(idIndex + 1));
                      } else {
                        setVcardCode(input);
                      }
                    }}
                    maxLength={50}
                    className="font-mono"
                  />
                </div>
              )}
              
              <div className="font-semibold">
                Total Amount: {totalPrice.toLocaleString("vi-VN")} đ
              </div>

              <Button
                className="w-full"
                onClick={handleCreateOrder}
                disabled={
                  (paymentMethod === "QRCode" && !vcardCode) ||
                  paymentStatus === "processing" ||
                  paymentStatus === "success" 
      }
              >
                {paymentStatus === "processing" ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </div>
                ) : (
                  "Confirm Order"
                )}
              </Button>

              {paymentStatus === "error" && (
                <Alert variant="destructive">
                  <AlertDescription>{paymentError}</AlertDescription>
                </Alert>
              )}

              {paymentStatus === "success" && (
                <Alert className="bg-green-50 text-green-700 border-green-200">
                  <AlertDescription>
                    Payment successful! Thank you for your purchase.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
});

ShoppingCartComponent.displayName = "ShoppingCartComponent";

export default ShoppingCartComponent;
