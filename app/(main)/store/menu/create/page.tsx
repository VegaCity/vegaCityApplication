"use client";

import { StoreMenuServices } from "@/components/services/storeMenuService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Image as ImageIcon, Save, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
const MenuCreationForm = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [menuData, setMenuData] = useState({
    name: "",
    dateFilter: "Morning",
    imageUrl: "",
    imageFile: null as File | null,
    imagePreview: null as string | null,
  });
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
      setTimeout(() => {
        router.push("/store/menu");
      });
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = (error as any).response?.data?.messageResponse;
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleCreateMenu} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Create Menu</h2>

          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-medium">Menu Name</label>
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
              <label className="block mb-2 font-medium">Time</label>
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
                  <SelectItem value="Morning">Morning</SelectItem>
                  <SelectItem value="Lunch">Lunch</SelectItem>
                  <SelectItem value="Afternoon">Afternoon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Save className="w-5 h-5 mr-2" />
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default MenuCreationForm;
