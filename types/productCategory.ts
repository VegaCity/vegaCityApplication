export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  crDate: string;
  upsDate: string;
  deflag: boolean;
}
export interface ProductCategoryPost {
  name: string;
  description: string;
}
export interface ProductCategoryPatch {
  name: string;
  description: string;
}
export interface ProductCategoryResponse {
  id: number;
  name: string;
  description: string;
}
export interface ProductCategoryDetail {
  id: number;
  name: string;
  description: string;
  products: Product[] | null;
}
export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  status: string;
  productCategory: ProductCategory;
  productCategoryId: string;
  crDate: string;
  upsDate: string;
}
interface StoreMenu {
  id: string;
  name: string;
  dateFilter: number;
  upsDate: string;
  // thêm các trường khác nếu cần
}

// Interface cho menu với products
interface MenuWithProducts extends StoreMenu {
  products?: Product[];
}
