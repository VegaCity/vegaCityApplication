"use client";
import React, { useState, useEffect, useRef } from "react";
import { Store, Product } from "@/types/store/store";
import { StoreServices } from "@/components/services/Store/storeServices";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import ShoppingCartComponent from "@/components/cart/cart";
import { CartRef } from "@/components/cart/cart";

interface StoreDetailPageProps {
  params: {
    id: string;
  };
}

const StoreDetailPage = ({ params }: StoreDetailPageProps) => {
  const [store, setStore] = useState<Store>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const cartRef = useRef<CartRef>(null);
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    const storedStoreId = localStorage.getItem("storeId");
    if (storedStoreId) {
      setStoreId(storedStoreId);
    } else {
      setError("No store ID found in localStorage");
    }
  }, []);

  useEffect(() => {
    const fetchStoreDetails = async () => {
      if (storeId) {
        try {
          setLoading(true);
          const { data } = await StoreServices.getStoreById(storeId);
          setStore(data.store);
          setProducts(
            Array.isArray(data.data.store.menus[0].products)
              ? data.data.store.menus[0].products
              : []
          );
        } catch (err) {
          setError("Failed to load store details");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchStoreDetails();
  }, [storeId]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAddToCart = (product: Product) => {
    cartRef.current?.addToCart(product);
  };

  const filteredProducts = selectedCategory
    ? products.filter(
        (product) => product.productCategory?.name === selectedCategory
      )
    : products;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{store?.name}</h1>
      <p className="text-gray-500 mb-6">{store?.address}</p>

      {/* Category Filter */}
      <div className="mb-4">
        <label className="font-semibold">Filter by Category: </label>
        <select
          onChange={(e) => setSelectedCategory(e.target.value || null)}
          className="p-2 border border-gray-300 rounded-md"
        >
          <option value="">All</option>
          {[...new Set(products.map((p) => p.productCategory?.name))]
            .filter(Boolean)
            .map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
        </select>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => handleProductClick(product)}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative h-48">
                <img
                  src={product.imageUrl || "/api/placeholder/400/320"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-sm">
                  {product.productCategory?.name || "Unknown"}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-primary font-medium">
                    {product.price.toLocaleString("vi-VN")} đ
                  </span>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    className="bg-primary text-white hover:bg-primary-600"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No products available</p>
        )}
      </div>

      {/* Product Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-semibold">
                  {selectedProduct.name}
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="aspect-square relative rounded-lg overflow-hidden">
                  <img
                    src={selectedProduct.imageUrl || "/api/placeholder/400/320"}
                    alt={selectedProduct.name}
                    className="object-cover w-full h-full"
                  />
                </div>

                <div className="flex flex-col justify-between">
                  <div>
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-primary">
                        {selectedProduct.price.toLocaleString("vi-VN")} đ
                      </p>
                      <p className="text-sm text-gray-500">
                        Category:{" "}
                        {selectedProduct.productCategory?.name || "Unknown"}
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

      <ShoppingCartComponent ref={cartRef} />
    </div>
  );
};

export default StoreDetailPage;
