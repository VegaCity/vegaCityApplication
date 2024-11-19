import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ProductServices } from "@/components/services/productServices";
import { Product } from "@/types/store/store";
import { Eye } from "lucide-react";
import { toast } from "react-hot-toast";

interface ProductDetailsDialogProps {
  productId: string | null;
  onClose: () => void;
}

const ProductDetailsDialog: React.FC<ProductDetailsDialogProps> = ({
  productId,
  onClose,
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [previousProductId, setPreviousProductId] = useState<string | null>(
    null
  );

  const fetchProductDetails = async () => {
    if (!productId) return;

    try {
      setLoading(true);
      const response = await ProductServices.getProductById(productId);
      setProduct(response.data.data);
    } catch (error) {
      console.error("Error fetching product details:", error);
      toast.error("Không thể tải thông tin sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (productId) {
      if (productId !== previousProductId) {
        setProduct(null); // Reset product state
        fetchProductDetails();
        setPreviousProductId(productId);
      }
    } else {
      setProduct(null);
    }
  }, [productId, previousProductId]);

  return (
    <Dialog open={!!productId} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Đang tải thông tin...</p>
          </div>
        ) : product ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye size={20} />
                {product.name}
              </DialogTitle>
              <DialogDescription>Chi tiết sản phẩm</DialogDescription>
            </DialogHeader>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Product Image */}
              <div className="w-full aspect-square bg-gray-100 rounded-lg">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Không có hình ảnh
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Tên sản phẩm</p>
                  <h2 className="text-2xl font-bold">{product.name}</h2>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Giá</p>
                  <p className="text-xl font-bold text-blue-600">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(product.price)}
                  </p>
                </div>

                {product.productCategory && (
                  <div>
                    <p className="text-sm text-gray-600">Danh mục</p>
                    <p className="text-base">{product.productCategory.name}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600">Trạng thái</p>
                  <p
                    className={`
                    inline-block px-3 py-1 rounded-full text-sm 
                    ${
                      product.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  `}
                  >
                    {product.status === "Active"
                      ? "Đang kinh doanh"
                      : "Ngừng kinh doanh"}
                  </p>
                </div>

                {product.description && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Mô tả</p>
                    <p className="text-base text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {product.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p>Không tìm thấy thông tin sản phẩm</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsDialog;
