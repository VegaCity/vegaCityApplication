import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  Plus,
  Clock,
  Calendar,
  Loader2,
  Trash,
} from "lucide-react";
import Link from "next/link";
import { StoreMenuServices } from "@/components/services/storeMenuService";
import { StoreMenu } from "@/types/store/storeMenu";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "react-hot-toast";

const getDateFilterText = (dateFilter: number) => {
  const filters = {
    1: "Morning",
    2: "Afternoon",
    3: "Lunch",
  };
  return filters[dateFilter as keyof typeof filters] || "Unknown";
};

const getDateFilterColor = (dateFilter: number) => {
  const colors = {
    1: "bg-amber-100 text-amber-800",
    2: "bg-orange-100 text-orange-800",
    3: "bg-sky-100 text-sky-800",
  };
  return (
    colors[dateFilter as keyof typeof colors] || "bg-gray-100 text-gray-800"
  );
};

const MenuList = () => {
  const [menus, setMenus] = useState<StoreMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuToDelete, setMenuToDelete] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const fetchMenus = async () => {
    try {
      setLoading(true);
      const response = await StoreMenuServices.getStoreMenus({
        storeId: localStorage.getItem("storeId") || "",
        page: 1,
        size: 10,
      });

      const menuData = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
        ? response.data.data
        : [];

      setMenus(menuData);
      setError(null);
    } catch (err) {
      setError("Cannot fetch menu list. Please try again later.");
      console.error("Error fetching menus:", err);
      setMenus([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleDeleteMenu = async () => {
    if (!menuToDelete) return;

    try {
      setLoading(true);
      await StoreMenuServices.deleteStoreMenuById(menuToDelete);

      setMenus((prev) => prev.filter((menu) => menu.id !== menuToDelete));
      toast.success("Menu deleted successfully");
    } catch (error) {
      console.error("Error deleting menu:", error);
      toast.error("Cannot delete menu. Please try again later.");
    } finally {
      setLoading(false);
      setMenuToDelete(null);
    }
  };

  const DeleteConfirmationDialog = () => (
    <AlertDialog
      open={!!menuToDelete}
      onOpenChange={() => setMenuToDelete(null)}
    >
      <AlertDialogContent className="rounded-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold text-red-600">
            Delete Menu
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600">
            Are you sure you want to permanently delete this menu? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="mr-4">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteMenu}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete Menu
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600 text-lg">Loading menus...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
          <div className="flex items-center text-red-700">
            <span className="font-semibold mr-2">Error:</span>
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Menu Management
          </h1>
          <p className="text-gray-500">
            Create, view, and manage your store menus
          </p>
        </div>
        <Button
          asChild
          className="bg-emerald-600 hover:bg-emerald-700 transition-colors rounded-lg shadow-md"
        >
          <Link href="/store/menu/create" className="flex items-center">
            <Plus className="mr-2 h-5 w-5" />
            Create Menu
          </Link>
        </Button>
      </div>

      {menus.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
          <p className="text-gray-500 mb-4 text-lg">No menus created yet</p>
          <Button
            asChild
            variant="outline"
            className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
          >
            <Link href="/store/menu/create" className="flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              Create First Menu
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {menus.map((menu) => (
            <div key={menu.id} className="relative group">
              <Link href={`/store/menu/${menu.id}`} className="block">
                <Card className="hover:shadow-lg transition-all duration-300 border-gray-200 rounded-xl overflow-hidden">
                  <CardContent className="p-6 bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-800 truncate max-w-[200px]">
                        {menu.name}
                      </h3>
                      <ChevronRight className="h-6 w-6 text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {new Date(menu.upsDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <Badge
                        className={`${getDateFilterColor(
                          menu.dateFilter
                        )} rounded-full`}
                      >
                        {getDateFilterText(menu.dateFilter)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <button
                onClick={() => setMenuToDelete(menu.id)}
                className="absolute top-3 right-3 bg-red-100 text-red-500 hover:bg-red-200 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <DeleteConfirmationDialog />
    </div>
  );
};

export default MenuList;
