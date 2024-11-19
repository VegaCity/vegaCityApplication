import { API } from "@/components/services/api";
import { Product, ProductPost, ProductPatch } from "@/types/product";

interface ProductPageSize {
  page?: number;
  size?: number;
}

export const ProductServices = {
  getProducts({ page, size, menuId }: ProductPageSize & { menuId: string }) {
    return API.get("/products", {
      params: {
        menuId,
        page,
        size,
      },
    });
  },
  getProductById(id: string) {
    return API.get(`/store/product/${id}`);
  },

  editProduct(productId: string, productData: ProductPatch) {
    return API.patch(`/store/product/${productId}`, productData);
  },
  deleteProductById(id: string) {
    return API.delete(`/store/product/${id}`);
  },
};
