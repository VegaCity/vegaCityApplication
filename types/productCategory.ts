export interface ProductCategory {
  id: string;
  name: string;
  description: string;
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
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
}
