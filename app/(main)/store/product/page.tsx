// StoreDetailPage.tsx
"use client";

<<<<<<< Updated upstream
import React, { useState, useEffect } from "react";
import BackButton from "@/components/BackButton";
import { useUserRole } from "@/components/hooks/useUserRole";
=======
import React, { useState, useEffect, useMemo, useRef } from "react";
>>>>>>> Stashed changes
import { Store } from "@/types/store";
import { StoreServices } from "@/components/services/storeServices";
import { useAuthUser } from "@/components/hooks/useAuthUser";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import ShoppingCartComponent, { CartRef } from '@/components/cart/cart';

<<<<<<< Updated upstream
interface ApiResponse {
  statusCode: number;
  messageResponse: string;
  data: Store;  // Changed from Store[] to Store for single store
=======
export interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  thumbnail: string;
  description: string;
>>>>>>> Stashed changes
}

interface StoreDetailPageProps {
  params: {
    id: string;
  }
}

const StoreDetailPage = ({ params }: StoreDetailPageProps) => {
  const cartRef = useRef<CartRef>(null);
  const { storeId, loading: userRoleLoading } = useAuthUser();
  const [store, setStore] = useState<Store | null>(null);
<<<<<<< Updated upstream
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const storeId: string | null = localStorage.getItem("storeId");
  console.log(storeId, "storeId")


=======
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
>>>>>>> Stashed changes

  useEffect(() => {
    const fetchProducts = async () => {
      try {
<<<<<<< Updated upstream
        if(storeId){
          const response = await StoreServices.getStoreById(storeId);
          console.log(response, "responseeeeee")
          const apiResponse = response.data.data.store;
          console.log(apiResponse, "nguu")
          
          if (apiResponse) {
            setStore(apiResponse);
          } else {
            throw new Error("Invalid response format");
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product.:", error);
        setError("Failed to load product details");
=======
        const response = await fetch('https://dummyjson.com/products');
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
>>>>>>> Stashed changes
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

<<<<<<< Updated upstream
  console.log(store, "storeeee")

  // if (userRoleLoading || loading) {
  //   return <div>Loading product details...</div>;
  // }
=======
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(products.map((product) => product.category))
    );
    return ["All", ...uniqueCategories];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") return products;
    return products.filter(
      (product) => product.category === selectedCategory
    );
  }, [products, selectedCategory]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAddToCart = (product: Product) => {
    cartRef.current?.addToCart(product);
  };
>>>>>>> Stashed changes

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!store) {
    return <div>product not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
<<<<<<< Updated upstream
      <div className="flex justify-between items-center mb-4">
        <BackButton text="Go Back" link="/stores" />
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">{store.name}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Store Details</h2>
            <div className="space-y-2">
              <p><span className="font-medium">ID:</span> {store.id}</p>
              <p><span className="font-medium">Address:</span> {store.address}</p>
              <p><span className="font-medium">Phone:</span> {store.phoneNumber}</p>
              {/* <p><span className="font-medium">Status:</span> 
                <span className={`ml-2 px-2 py-1 rounded ${
                  store.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {store.status}
=======
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
                <span className="ml-2 text-sm">({filteredProducts.length})</span>
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
>>>>>>> Stashed changes
                </span>
              </p> */}
            </div>
          </div>
<<<<<<< Updated upstream
          
          {/* Add more store details sections as needed */}
        </div>
      </div>
=======
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
>>>>>>> Stashed changes
    </div>
  );
};

export default StoreDetailPage;