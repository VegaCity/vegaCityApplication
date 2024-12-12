"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { StoreMenuServices } from "@/components/services/storeMenuService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-hot-toast";
import { Clock, X } from "lucide-react";

const UpdateStoreMenuPage = () => {
  const router = useRouter();
  const params = useParams();
  const menuId = params.id as string;

  const [menuName, setMenuName] = useState("");
  const [dateFilter, setDateFilter] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const DATE_FILTERS = {
    MORNING: 1,
    LUNCH: 3,
    AFTERNOON: 2,
  };

  const DATE_FILTER_LABELS = {
    [DATE_FILTERS.MORNING]: "Morning",
    [DATE_FILTERS.LUNCH]: "Lunch",
    [DATE_FILTERS.AFTERNOON]: "Afternoon",
  };

  useEffect(() => {
    const fetchMenuDetails = async () => {
      try {
        const response = await StoreMenuServices.getStoreMenuById(menuId);
        const menuData = response.data.data;
        setMenuName(menuData.name);
        setDateFilter(menuData.dateFilter);
        setLoading(false);
      } catch (error) {
        toast.error("Failed to load menu details");
        console.error(error);
        setLoading(false);
      }
    };

    fetchMenuDetails();
  }, [menuId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!menuName || !dateFilter) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await StoreMenuServices.editStoreMenu(menuId, {
        imageUrl: "",
        name: menuName,
        dateFilter,
      });

      toast.success("Menu updated successfully");
      router.push(`/store/menu/${menuId}`);
    } catch (error) {
      toast.error("Failed to update menu");
      console.error(error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6 max-w-xl">
      <Card className="w-full shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <CardTitle className="flex items-center gap-3">
            <Clock size={24} className="text-blue-600" />
            Update Menu Details
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/store/menu/${menuId}`)}
          >
            <X size={24} />
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-gray-700">Menu Name</Label>
              <Input
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
                placeholder="Enter menu name"
                className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700">Time Filter</Label>
              <Select
                value={dateFilter?.toString()}
                onValueChange={(value) => setDateFilter(Number(value))}
                required
              >
                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200">
                  <SelectValue placeholder="Select time filter" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DATE_FILTERS).map(([key, value]) => (
                    <SelectItem key={value} value={value.toString()}>
                      {DATE_FILTER_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Update Menu
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdateStoreMenuPage;
