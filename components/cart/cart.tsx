import React, { forwardRef, useImperativeHandle, useState } from "react";
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
import { Product } from "@/types/store/store";
import { confirmOrder, createOrderStore } from "../services/orderuserServices";
import { PackageItemServices } from "../services/packageItemService";
interface CartItem extends Product {
  quantity: number;
}

export interface CartRef {
  addToCart: (product: Product) => void;
}

const ShoppingCartComponent = forwardRef<CartRef>((props, ref) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [vcardCode, setVcardCode] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [paymentError, setPaymentError] = useState("");

  useImperativeHandle(ref, () => ({
    addToCart: (product: Product) => {
      setCartItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.id === product.id);
        if (existingItem) {
          return prevItems.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prevItems, { ...product, quantity: 1 }];
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
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  async function handleCreateOrder() {
    if (!vcardCode) {
      setPaymentError("Please enter a valid Vcard code.");
      return;
    }

    try {
      const storeId = localStorage?.getItem("storeId") ?? "";
      const orderData = {
        saleType: "Product",
        storeId,
        totalAmount: totalPrice,
        packageItemId: vcardCode,
        productData: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          productCategory: item.productCategory?.name ?? "Unknown",
          price: item.price,
          imgUrl: item.imageUrl,
          quantity: item.quantity,
        })),
      };

      const orderResponse = await createOrderStore(orderData);

      await confirmOrder({
        transactionId: orderResponse.data.transactionId,
        invoiceId: orderResponse.data.invoiceId,
      });
      setPaymentStatus("success");
      setTimeout(() => {
        setCartItems([]);
        setIsPaymentModalOpen(false);
        setIsOpen(false);
        setVcardCode("");
        setPaymentStatus("idle");
      }, 2000);
    } catch (error) {
      // Log the error details for debugging
      console.error("Payment Error:", error);

      setPaymentStatus("error");
      setPaymentError(
        error instanceof Error
          ? error.message
          : "Payment failed. Please try again."
      );
    }
  }

  const handleCreateOrderClick = () => {
    setIsPaymentModalOpen(true); // Open payment modal if Vcard code is not provided
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
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-500">
                        {item.price.toLocaleString("vi-VN")} đ
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
                onClick={handleCreateOrderClick} // Open payment modal
              >
                Create Order
              </Button>
            </div>
          </div>
        )}

        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Payment with Vcard</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="vcard-code" className="text-sm font-medium">
                  Enter Vcard Code
                </label>
                <Input
                  id="vcard-code"
                  placeholder="Enter your Vcard code"
                  value={vcardCode}
                  onChange={(e) => setVcardCode(e.target.value)}
                  maxLength={50}
                  className="font-mono"
                />
              </div>

              <div className="font-semibold">
                Total Amount: {totalPrice.toLocaleString("vi-VN")} đ
              </div>

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

              <Button
                className="w-full"
                onClick={handleCreateOrder}
                disabled={
                  !vcardCode ||
                  paymentStatus === "processing" ||
                  paymentStatus === "success"
                }
              >
                {paymentStatus === "processing"
                  ? "Processing..."
                  : "Confirm Payment"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
});

ShoppingCartComponent.displayName = "ShoppingCartComponent";

export default ShoppingCartComponent;
