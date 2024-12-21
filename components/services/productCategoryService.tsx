import { API } from "@/components/services/api";
import {
  ProductCategory,
  ProductCategoryPost,
  ProductCategoryPatch,
} from "@/types/productCategory";

interface ProductCategoryPageSize {
  page?: number;
  size?: number;
}

export const ProductCategoryServices = {
  getProductCategories({
    page,
    size,
    storeId,
  }: ProductCategoryPageSize & { storeId: string }) {
    return API.get(`store/product-categories?storeId=${storeId}`, {
      params: {
        page,
        size,
      },
    });
  },

  getProductCategoryById(id: string) {
    return API.get(`/store/product-category/${id}`);
  },
  createProductCategory(productCategoryData: ProductCategoryPost) {
    return API.post("/store/product-category", productCategoryData);
  },
  editProductCategory(
    productCategoryId: string,
    productCategoryData: ProductCategoryPatch
  ) {
    return API.patch(
      `store/product-category/${productCategoryId}`,
      productCategoryData
    );
  },
  deleteProductCategoryById(id: string) {
    return API.delete(`store/product-category/${id}`);
  },
};
