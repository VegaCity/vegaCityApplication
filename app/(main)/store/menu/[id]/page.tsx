"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  Plus,
  Clock,
  Eye,
  Pencil,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import ShoppingCartComponent, { CartRef } from "@/components/cart/cart";
import { useRouter } from "next/navigation";
import { StoreMenuServices } from "@/components/services/storeMenuService";
import { toast } from "@/components/ui/use-toast";
import ProductUpdateDialog from "@/lib/dialog/ProductUpdateDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductServices } from "@/components/services/productServices";
import { ProductPatch } from "@/types/product";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Product } from "@/types/store/store";
import ProductDetailsDialog from "@/lib/dialog/ProductDetailsDialog";
import { Loader } from "@/components/loader/Loader";
import { Toast } from "@radix-ui/react-toast";
interface Menu {
  id: string;
  name: string;
  itemCount: number;
  lastUpdated: string;
  dateFilter: number;
  products?: MenuItem[];
}

interface Category {
  id: string;
  name: string;
  description?: string;
  count?: number;
}

interface MenuItem extends Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  categoryId: string;
  status: string;
  dateFilter: number;
  productCategoryId: string;
  menuId: string;
  crDate: string;
  upsDate: string;
  quantity: number;
  duration: number | null;
  unit: string | null;
}
const DATE_FILTERS = {
  MORNING: 1,
  AFTERNOON: 2,
  LUNCH: 3,
};

const DATE_FILTER_LABELS = {
  [DATE_FILTERS.MORNING]: "7h - 10h30",
  [DATE_FILTERS.AFTERNOON]: "14h - 22h",
  [DATE_FILTERS.LUNCH]: "10h30 - 14h",
};

const MenuUI = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDateFilter, setSelectedDateFilter] = useState<number | "all">(
    "all"
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentDateFilter, setCurrentDateFilter] = useState<number | null>(
    null
  );
  const [isOwnerMode, setIsOwnerMode] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const cartRef = useRef<CartRef>(null);
  const cartComponentRef = useRef<HTMLDivElement | null>(null); // Reference for the div to scroll to
  const [itemToUpdate, setItemToUpdate] = useState<Product | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateFormData, setUpdateFormData] = useState<ProductPatch>({
    name: "",
    price: 0,
    imageUrl: "",
    quantity: 1,
    duration: 0,
    unit: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProductUpdateDialogOpen, setIsProductUpdateDialogOpen] =
    useState(false);
  const [storeType, setStoreType] = useState<string>("1");

  const [isDeleting, setIsDeleting] = useState(false);
  useEffect(() => {
    const storedType = localStorage.getItem("storeType");
    if (storedType) {
      setStoreType(storedType);
    }
  }, []);

  const uploadImageToFirebase = async (file: File): Promise<string> => {
    try {
      // Create a unique filename
      const timestamp = Date.now();
      const fileName = `products/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);

      // Upload file
      const uploadTask = uploadBytes(storageRef, file);

      // Wait for upload to complete
      await uploadTask;

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      return downloadURL;
    } catch (error) {
      console.error("Error uploading to Firebase:", error);
      throw new Error("Failed to upload image");
    }
  };

  // Fetch menu data and process categories
  useEffect(() => {
    const fetchMenuAndCategories = async () => {
      try {
        setLoading(true);
        const response = await StoreMenuServices.getStoreMenuById(params.id);
        const menuData = response.data.data;

        // Process products and create category map
        const categoryMap = new Map<string, Category>();
        const products = menuData.menuProductMappings
          .map((mapping: any) => {
            const product = mapping.product;

            // Only process products based on user role
            if (!isOwnerMode && product.status !== "Active") return null;

            const category = product.productCategory;

            // Update category count only for active or owner-visible products
            if (!categoryMap.has(category.id)) {
              categoryMap.set(category.id, {
                id: category.id,
                name: category.name,
                description: category.description,
                count: 1,
              });
            } else {
              const existing = categoryMap.get(category.id)!;
              categoryMap.set(category.id, {
                ...existing,
                count: (existing.count || 0) + 1,
              });
            }

            return {
              id: product.id,
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl,
              categoryId: product.productCategoryId,
              status: product.status,
              dateFilter: menuData.dateFilter,
              quantity: product.quantity || 0,
              duration: product.duration,
              unit: product.unit,
            } as MenuItem;
          })
          .filter((product: Product) => product !== null);

        setMenu({
          id: menuData.id,
          name: menuData.name,
          itemCount: products.length,
          lastUpdated: menuData.upsDate,
          dateFilter: menuData.dateFilter,
          products: products,
        });

        setCategories(Array.from(categoryMap.values()));
        setMenuItems(products);
      } catch (err) {
        setError("Failed to load menu data");
        console.error("Error fetching menu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuAndCategories();
  }, [params.id, isOwnerMode]); // Added isOwnerMode to dependency array

  // Filter menu items remains the same
  const filteredMenu = menuItems
    .filter((item) => {
      const matchesDateFilter =
        selectedDateFilter === "all" || item.dateFilter === selectedDateFilter;
      const matchesCategory =
        selectedCategory === "all" || item.categoryId === selectedCategory;
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // Different status filtering based on mode
      const isStatusValid = isOwnerMode
        ? true // Show all items in owner mode
        : item.status === "Active"; // Only show active items in staff mode

      return (
        matchesSearch && matchesDateFilter && matchesCategory && isStatusValid
      );
    })
    .sort((a, b) => {
      // In manager mode, sort by status (Active first)
      if (isOwnerMode) {
        if (a.status === b.status) return 0;
        return a.status === "Active" ? -1 : 1;
      }
      return 0; // No sorting in staff mode
    });
  const handleDelete = async (itemId: string) => {
    try {
      setIsDeleting(true);
      await ProductServices.deleteProductById(itemId);

      // Cập nhật lại state menuItems sau khi xóa thành công
      setMenuItems((prev) => prev.filter((item) => item.id !== itemId));

      toast({
        title: "Success",
        description: "Product deleted successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setItemToDelete(null); // Đóng dialog
    }
  };

  const DeleteConfirmationDialog = ({ itemId }: { itemId: string }) => (
    <AlertDialog
      open={itemToDelete === itemId}
      onOpenChange={(open) => !open && setItemToDelete(null)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you absolutely sure delete this?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            product and remove its data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => handleDelete(itemId)}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
  const handleUpdateClick = async (item: MenuItem) => {
    setItemToUpdate(item);
    setIsProductUpdateDialogOpen(true);
  };

  const handleProductUpdate = async (updatedData: ProductPatch) => {
    if (!itemToUpdate) return;

    try {
      console.log("updatedData", updatedData);
      console.log("itemToUpdate", itemToUpdate);
      // Upload new image if needed
      let finalImageUrl = updatedData.imageUrl;
      if (selectedImage) {
        finalImageUrl = await uploadImageToFirebase(selectedImage);
      }

      // Prepare update data
      const updatePayload = {
        ...updatedData,
        imageUrl: finalImageUrl,
      };

      // Update product via service
      const response = await ProductServices.editProduct(
        itemToUpdate.id,
        updatePayload
      );

      // Show success notification
      toast({
        title: "Success",
        description: response.data.messageResponse,
        variant: "success",
      });

      // Update local state
      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === itemToUpdate.id
            ? {
                ...item,
                ...updatePayload,
              }
            : item
        )
      );

      setItemToUpdate(null);
      setSelectedImage(null);
      setIsProductUpdateDialogOpen(false);
    } catch (error) {
      console.error("Error updating product:", error);
      // Show error notification
      toast({
        title: "Error",
        description: "Failed to update product.",
        variant: "destructive",
      });
    }
  };

  // Category sidebar component
  const CategorySidebar = () => (
    <div className="w-64 flex-shrink-0">
      <h2 className="font-semibold mb-4">
        {Number(storeType) === 1 ? "Product" : "Service"} Category
      </h2>
      <div className="space-y-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
            selectedCategory === "all"
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-200 hover:text-blue-600"
          }`}
        >
          <span>All {Number(storeType) === 1 ? "Products" : "Services"}</span>
          <span className="text-sm bg-white bg-opacity-20 px-2 py-0.5 rounded-full">
            {menuItems.length}
          </span>
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === category.id
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-200 hover:text-blue-600"
            }`}
          >
            <span>{category.name}</span>
            <span className="text-sm bg-white bg-opacity-20 px-2 py-0.5 rounded-full">
              {category.count || 0}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  const handleAddToCart = (item: MenuItem) => {
    cartRef.current?.addToCart({
      ...item,
      quantity: item.quantity,
    });
    cartComponentRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading)
    return (
      <div>
        <Loader />
      </div>
    );
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Keep existing header section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{menu?.name || "Menu "}</h1>
          <div className="flex items-center text-gray-500">
            <Clock size={20} className="mr-2" />
            {currentTime.toLocaleTimeString()}
            {currentDateFilter && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                {DATE_FILTER_LABELS[currentDateFilter]}
              </span>
            )}
          </div>
        </div>

        {/* Modify the existing div with the mode selection and buttons */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Mode:</span>
            <select
              className="p-2 border rounded-lg text-black dark:text-white"
              value={isOwnerMode ? "owner" : "staff"}
              onChange={(e) => setIsOwnerMode(e.target.value === "owner")}
            >
              <option value="staff">Seller</option>
              <option value="owner">Manager</option>
            </select>
          </div>

          {isOwnerMode && menu && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/store/menu/edit/${menu.id}`)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus size={20} />
                Add Product
              </button>
              <button
                onClick={() => router.push(`/store/menu/update/${menu.id}`)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <Pencil size={20} />
                Update Menu
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-8">
        <CategorySidebar />

        <div className="flex-1">
          {/* Keep existing search and filters section */}
          <div className="mb-8">
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search..."
                className="w-full p-3 pl-10 border rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search
                className="absolute left-3 top-3.5 text-gray-400"
                size={20}
              />
            </div>
          </div>

          {/* Modified product grid with update/delete buttons for manager mode */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenu.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-square bg-gray-100 rounded-t-lg relative overflow-hidden">
                  {!isOwnerMode && item.quantity === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
                      <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-xl transform -rotate-45">
                        {storeType === "1"
                          ? "SOLD OUT"
                          : storeType === "2"
                          ? "OUT OF RENT"
                          : ""}
                      </div>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 z-10">
                    <span className="text-sm font-bold bg-white/90 text-gray-700 px-3 py-1 rounded-full shadow-sm ">
                      {
                        categories.find((cat) => cat.id === item.categoryId)
                          ?.name
                      }
                    </span>
                  </div>
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  )}
                </div>

                <div className="p-4">
                  {/* Title and Status Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-xl text-gray-800">
                      {item.name}
                    </h3>
                    {isOwnerMode && (
                      <Badge
                        className={
                          item.status === "InActive"
                            ? "border-red-400 bg-red-100 hover:bg-red-400 text-red-500 hover:text-white"
                            : "border-green-400 bg-green-100 hover:bg-green-400 text-green-500 hover:text-white"
                        }
                      >
                        {item.status}
                      </Badge>
                    )}
                  </div>

                  {/* Add description for service duration */}
                  {storeType === "2" && item.duration && item.unit && (
                    <div className="text-gray-600 text-sm mb-2">
                      <div className="flex items-center gap-1">
                        <span>
                          <span className="font-medium">
                            Duration per service:
                          </span>{" "}
                          <span className="text-blue-600 font-semibold">
                            {item.duration} {item.unit}
                          </span>
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500 italic">
                        (Each booking will reserve the service for{" "}
                        {item.duration} {item.unit.toLowerCase()})
                      </div>
                    </div>
                  )}

                  {/* Price section */}
                  <div className="text-blue-600 font-semibold text-lg mb-2">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(item.price)}
                  </div>

                  {/* Details */}
                  <div className="text-sm text-gray-600 space-y-1 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        {storeType === "1" ? "Quantity" : "Available"}:{" "}
                        {item.quantity}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {!isOwnerMode ? (
                      <>
                        {item.quantity > 0 && (
                          <>
                            <button
                              className="flex-1 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors 
                              flex items-center justify-center gap-2 font-semibold"
                              onClick={() => handleAddToCart(item)}
                            >
                              <ShoppingCart size={18} />
                              Buy
                            </button>
                            <button
                              onClick={() => setSelectedProductId(item.id)}
                              className="w-12 flex items-center justify-center py-2.5 text-blue-600 border border-blue-600 
                              rounded-lg hover:bg-blue-50 transition-colors"
                            >
                              <Eye size={18} />
                            </button>
                          </>
                        )}
                      </>
                    ) : (
                      item.status === "Active" && (
                        <>
                          <button
                            onClick={() => handleUpdateClick(item)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-white bg-green-600 
                          rounded-lg hover:bg-green-700 transition-colors font-semibold"
                          >
                            <Pencil size={16} />
                            Update
                          </button>
                          <button
                            onClick={() => setItemToDelete(item.id)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-white bg-red-600 
    rounded-lg hover:bg-red-700 transition-colors font-semibold"
                            disabled={isDeleting}
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shopping Cart */}
      <div ref={cartComponentRef} className="fixed bottom-4 right-4 z-50">
        {!isOwnerMode && <ShoppingCartComponent ref={cartRef} />}
      </div>
      {itemToDelete && <DeleteConfirmationDialog itemId={itemToDelete} />}
      <ProductUpdateDialog
        open={isProductUpdateDialogOpen}
        onClose={() => setIsProductUpdateDialogOpen(false)}
        product={itemToUpdate}
        onUpdate={handleProductUpdate}
      />

      <ProductDetailsDialog
        productId={selectedProductId}
        onClose={() => setSelectedProductId(null)}
      />
    </div>
  );
};

export default MenuUI;
