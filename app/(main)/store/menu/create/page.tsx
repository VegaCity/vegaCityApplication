"use client";

import React, { useState } from "react";
import { Save, Image as ImageIcon, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StoreMenuServices } from "@/components/services/storeMenuService";
import { useToast } from "@/components/ui/use-toast";

const MenuCreationForm = ({ storeId }: { storeId: string }) => {
  const { toast } = useToast();

  const [menuData, setMenuData] = useState({
    name: "",
    dateFilter: "Morning",
    imageUrl: "",
    imageFile: null as File | null,
    imagePreview: null as string | null,
  });

  const handleMenuImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const file = files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMenuData({
          ...menuData,
          imageFile: file,
          imagePreview: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateMenu = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const menuPayload = {
        name: menuData.name,
        dateFilter: menuData.dateFilter,
        imageUrl: menuData.imageUrl,
      };
      const storeId = localStorage.getItem("storeId");
      const response = await StoreMenuServices.createStoreMenu(
        (storeId as string) || "",
        menuPayload
      );

      toast({
        title: "Success",
        description: "Menu created successfully",
      });
    } catch (error) {
      console.error("Error creating menu:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create menu",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleCreateMenu} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Tạo Menu Mới</h2>

          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-medium">Tên Menu</label>
              <input
                type="text"
                value={menuData.name}
                onChange={(e) =>
                  setMenuData({ ...menuData, name: e.target.value })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Thời gian phục vụ
              </label>
              <Select
                value={menuData.dateFilter}
                onValueChange={(value) =>
                  setMenuData({ ...menuData, dateFilter: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn thời gian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Morning">Buổi sáng</SelectItem>
                  <SelectItem value="Lunch">Buổi trưa</SelectItem>
                  <SelectItem value="Afternoon">Buổi chiều</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block mb-2 font-medium">Hình ảnh Menu</label>
              <div className="relative">
                {menuData.imagePreview ? (
                  <div className="relative">
                    <img
                      src={menuData.imagePreview}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setMenuData({
                          ...menuData,
                          imageFile: null,
                          imagePreview: null,
                        })
                      }
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMenuImageChange}
                      className="hidden"
                      id="menu-image-upload"
                    />
                    <label
                      htmlFor="menu-image-upload"
                      className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:bg-gray-50"
                    >
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                      <span className="mt-2 text-sm text-gray-500">
                        Thêm hình ảnh menu
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Save className="w-5 h-5 mr-2" />
            Tạo Menu
          </button>
        </div>
      </form>
    </div>
  );
};

export default MenuCreationForm;
