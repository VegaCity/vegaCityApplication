"use client";

import React, { useState, useEffect, useMemo } from "react";
import BackButton from "@/components/BackButton";
import { useUserRole } from "@/components/hooks/useUserRole";
import { Store } from "@/types/store/store";
import { StoreServices } from "@/components/services/Store/storeServices";
import { useAuthUser } from "@/components/hooks/useAuthUser";

interface MenuItem {
  Id: string;
  Name: string;
  ProductCategory: string;
  Price: number;
  ImgUrl: string;
}

interface StoreDetailPageProps {
  params: {
    id: string;
  };
}

const StoreDetailPage = ({ params }: StoreDetailPageProps) => {
  const { storeId, loading: userRoleLoading } = useAuthUser();
  const [store, setStore] = useState<Store | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    const fetchStore = async () => {
      try {
        if (storeId) {
          const response = await StoreServices.getStoreById(storeId);
          const apiResponse = response.data.data.store;

          if (apiResponse) {
            setStore(apiResponse);
            const menuData = JSON.parse(
              apiResponse.menus?.[0]?.menuJson || "[]"
            );
            setMenuItems(menuData);
          } else {
            throw new Error("Invalid response format");
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching store:", error);
        setError("Failed to load store details");
        setLoading(false);
      }
    };

    if (storeId) {
      fetchStore();
    }
  }, [storeId]);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(menuItems.map((item) => item.ProductCategory))
    );
    return ["All", ...uniqueCategories];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === "All") return menuItems;
    return menuItems.filter(
      (item) => item.ProductCategory === selectedCategory
    );
  }, [menuItems, selectedCategory]);

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
                <span className="ml-2 text-sm">({filteredItems.length})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-10">
        {filteredItems.map((item, index) => (
          <div
            key={`${item.Id}-${index}`}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="relative h-48">
              <img
                src={item.ImgUrl || "/api/placeholder/400/320"}
                alt={item.Name}
                className="w-full h-full object-cover"
              />

              <span className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-sm">
                {item.ProductCategory}
              </span>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{item.Name}</h3>

              <div className="flex justify-between items-center">
                <span className="text-primary font-medium">
                  {item.Price.toLocaleString("vi-VN")} đ
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Không tìm thấy sản phẩm nào trong danh mục này
          </p>
        </div>
      )}
    </div>
  );
};

export default StoreDetailPage;
