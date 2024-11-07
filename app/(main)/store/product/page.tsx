// StoreDetailPage.tsx
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Store } from "@/types/store/store";
import { StoreServices } from "@/components/services/Store/storeServices";
import { useAuthUser } from "@/components/hooks/useAuthUser";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import ShoppingCartComponent, { CartRef } from "@/components/cart/cart";

export interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  thumbnail: string;
  description: string;
}

interface StoreDetailPageProps {
  params: {
    id: string;
  };
}

const StoreDetailPage = ({ params }: StoreDetailPageProps) => {
  const cartRef = useRef<CartRef>(null);
  const { storeId, loading: userRoleLoading } = useAuthUser();
  const [store, setStore] = useState<Store | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("https://dummyjson.com/products");
        const data = await response.json();

        if (data && data.products) {
          setProducts(data.products);
        } else {
          throw new Error("Invalid response format");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(products.map((product) => product.category))
    );
    return ["All", ...uniqueCategories];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") return products;
    return products.filter((product) => product.category === selectedCategory);
  }, [products, selectedCategory]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAddToCart = (product: Product) => {
    cartRef.current?.addToCart(product);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 overflow-x-auto">
        <div className="flex space-x-2 min-w-max pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                px-4 py-2 rounded-full transition-colors duration-200
                ${
                  selectedCategory === category
                    ? "bg-primary text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }
              `}
            >
              {category}
              {selectedCategory === category && (
                <span className="ml-2 text-sm">
                  ({filteredProducts.length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-10">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => handleProductClick(product)}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="relative h-48">
              <img
                src={product.thumbnail || "/api/placeholder/400/320"}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-sm">
                {product.category}
              </span>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
              <div className="flex justify-between items-center">
                <span className="text-primary font-medium">
                  {product.price.toLocaleString("vi-VN")} đ
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-semibold">
                  {selectedProduct.title}
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="aspect-square relative rounded-lg overflow-hidden">
                  <img
                    src={selectedProduct.thumbnail}
                    alt={selectedProduct.title}
                    className="object-cover w-full h-full"
                  />
                </div>

                <div className="flex flex-col justify-between">
                  <div>
                    <p className="text-gray-600 mb-4">
                      {selectedProduct.description}
                    </p>
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-primary">
                        {selectedProduct.price.toLocaleString("vi-VN")} đ
                      </p>
                      <p className="text-sm text-gray-500">
                        Category: {selectedProduct.category}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleAddToCart(selectedProduct)}
                    className="w-full mt-4"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Không tìm thấy sản phẩm nào trong danh mục này
          </p>
        </div>
      )}

      <ShoppingCartComponent ref={cartRef} />
    </div>
  );
};

export default StoreDetailPage;
