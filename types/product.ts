export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  productCategoryName: string;
  status: string;
}
export interface ProductCategory {
  id: string;
  name: string;
  description: string;
}
export interface ProductPatch {
  name: string;
  price: number;
  status: string;
  imageUrl: string | null;
}
export interface ProductPost {
  name: string;
  productCategoryId: string;
  price: number;
  imageUrl: string;
}
