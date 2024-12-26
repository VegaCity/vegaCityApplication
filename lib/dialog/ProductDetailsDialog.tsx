import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { ProductServices } from "@/components/services/productServices";
import { ProductCategoryServices } from "@/components/services/productCategoryService";
import { Product } from "@/types/store/store";
import { Eye, ImageIcon } from "lucide-react";
import { toast } from "react-hot-toast";

interface ProductDetailsDialogProps {
  productId: string | null;
  onClose: () => void;
}

const ProductDetailsDialog = ({
  productId,
  onClose,
}: ProductDetailsDialogProps) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [storeType, setStoreType] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!productId) return;
      try {
        setLoading(true);
        const [productRes, storeType] = await Promise.all([
          ProductServices.getProductById(productId),
          localStorage.getItem("storeType"),
        ]);

        setProduct(productRes.data.data);
        setStoreType(storeType || "");

        if (productRes.data.data.productCategoryId) {
          const categoryRes =
            await ProductCategoryServices.getProductCategoryById(
              productRes.data.data.productCategoryId
            );
          setCategoryName(categoryRes.data.data.name);
        }
      } catch (error) {
        toast.error("Không thể tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  if (!product && !loading) return null;

  return (
    <Dialog open={!!productId} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        {loading ? (
          <div className="h-64 grid place-items-center">Loading...</div>
        ) : (
          product && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  <DialogTitle>Product Details</DialogTitle>
                </div>
              </DialogHeader>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Left - Image */}
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="h-full grid place-items-center">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Right - Content */}
                <div className="space-y-4">
                  <div>
                    <div className="flex text-sm text-gray-600 items-center gap-2">
                      Name:
                    </div>
                    <h2 className="text-2xl font-bold">{product.name}</h2>
                    <div className="flex text-sm text-gray-600 items-center gap-5 mt-5">
                      Category
                    </div>
                    {categoryName && (
                      <p className="text-base font-semibold">{categoryName}</p>
                    )}
                  </div>

                  {storeType === "2" && (
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="text-lg font-semibold">
                        {product.duration} {product.unit}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="text-lg font-semibold">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(product.price)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Quantity</p>
                    <p className="text-lg font-semibold">{product.quantity} </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm bg-green-100 text-green-800">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </>
          )
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsDialog;
