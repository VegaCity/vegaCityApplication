"use client";

import React, { useState, useEffect } from "react";
import { Trash2, Plus, Save, Image as ImageIcon } from "lucide-react";
import { StoreMenuServices } from "@/components/services/storeMenuService";
import { ProductCategoryServices } from "@/components/services/productCategoryService";
import { StoreMenuPatch } from "@/types/store/storeMenu";
import { useToast } from "@/components/ui/use-toast";
import { storage } from "@/lib/firebase"; // Make sure to create this firebase config
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import { ProductServices } from "@/components/services/productServices";
import { AxiosError } from "axios";
import { ScrollArea } from "@/components/ui/scroll-area";
interface Category {
  id: string;
  name: string;
  description?: string;
  count?: number;
}

enum DateFilter {
  Morning = 1,
  Afternoon = 2,
  Lunch = 3,
}
interface ProductErrors {
  name?: string;
  price?: string;
  quantity?: string;
  categoryId?: string;
  image?: string;
  duration?: string;
  unit?: string;
}
const DATE_FILTER_LABELS = {
  [DateFilter.Morning]: "Morning",
  [DateFilter.Afternoon]: "Afternoon",
  [DateFilter.Lunch]: "Lunch",
};

interface Product {
  id?: string;
  name: string;
  price: string;
  quantity: number;
  categoryId: string;
  image: File | null;
  imagePreview: string | ArrayBuffer | null;
  isNew?: boolean;
  isSaving?: boolean;
  status?: string;
  dateFilter?: number;
  duration?: number | null;
  unit?: "Hour" | "Minute" | null;
}

interface MenuData {
  id?: string;
  menuName: string;
  dateFilter: DateFilter;
  products: Product[];
  itemCount?: number;
  lastUpdated?: string;
}
const initialFormData: MenuData = {
  menuName: "",
  dateFilter: DateFilter.Morning,
  products: [
    {
      name: "",
      price: "",
      quantity: 1,
      categoryId: "",
      image: null,
      imagePreview: null,
      duration: localStorage.getItem("storeType") === "2" ? null : undefined,
      unit: localStorage.getItem("storeType") === "2" ? null : undefined,
    },
  ],
};

interface MenuCreationFormProps {
  params: { id: string };
}

const formatPrice = (price: string): string => {
  // Remove any non-digit characters except the last dot
  const numericValue = price.replace(/[^\d]/g, "");
  // Convert to number and format with thousand separators
  return numericValue === ""
    ? ""
    : Number(numericValue).toLocaleString("vi-VN");
};

const MenuCreationForm = ({ params }: MenuCreationFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<MenuData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();
  const [productErrors, setProductErrors] = useState<ProductErrors[]>([]);
  const uploadImageToFirebase = async (file: File): Promise<string> => {
    try {
      const storageRef = ref(
        storage,
        `menu-products/${Date.now()}-${file.name}`
      );
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    }
  };
  const fetchProductCategories = async () => {
    try {
      setIsLoading(true);
      const response = await ProductCategoryServices.getProductCategories({
        page: 1,
        size: 20,
        storeId: localStorage.getItem("storeId") as string,
      });

      const apiResponse = response.data;
      if (apiResponse.statusCode === 200) {
        setCategories(apiResponse.data);
      } else {
        setError(apiResponse.messageResponse);
        toast({
          variant: "destructive",
          title: "Error",
          description: apiResponse.messageResponse,
        });
      }
    } catch (error) {
      console.error("Error fetching product categories:", error);
      setError("Error loading product categories");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error loading product categories",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductCategories();
  }, []);

  const fetchMenuAndCategories = async () => {
    try {
      setIsLoading(true);

      const categoryResponse =
        await ProductCategoryServices.getProductCategories({
          page: 1,
          size: 20,
          storeId: localStorage.getItem("storeId") as string,
        });

      if (categoryResponse.data.statusCode === 200) {
        setCategories(categoryResponse.data.data);
      }

      const menuResponse = await StoreMenuServices.getStoreMenuById(params.id);
      const menuData = menuResponse.data.data;

      // Filter and process active products only
      const existingProducts = menuData.menuProductMappings
        .filter((mapping: any) => mapping.product.status === "Active")
        .map((mapping: any) => {
          const product = mapping.product;
          const showDurationFields = localStorage.getItem("storeType") === "2";
          return {
            id: product.id,
            name: product.name,
            price: product.price.toString(),
            categoryId: product.productCategoryId,
            image: null,
            imagePreview: product.imageUrl,
            status: product.status,
            dateFilter: menuData.dateFilter,
            isNew: false,
            quantity: product.quantity || 1,
            duration: showDurationFields ? product.duration : null,
            unit: showDurationFields ? product.unit : null,
          };
        });

      setFormData({
        id: menuData.id,
        menuName: menuData.name,
        dateFilter: menuData.dateFilter,

        products: existingProducts,
        itemCount: existingProducts.length,
        lastUpdated: menuData.upsDate,
      });
      const menuId = localStorage.setItem("menuId" as string, menuData.id);
    } catch (err) {
      setError("Failed to load menu data");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load menu data",
      });
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchMenuAndCategories();
  }, [params.id]);
  const addProduct = () => {
    setFormData({
      ...formData,
      products: [
        {
          name: "",
          price: "",
          quantity: 1,
          categoryId: "",
          image: null,
          imagePreview: null,
          isNew: true,
          duration:
            localStorage.getItem("storeType") === "2" ? null : undefined,
          unit: localStorage.getItem("storeType") === "2" ? null : undefined,
        },
        ...formData.products,
      ],
    });
  };

  const handleSaveProduct = async (index: number) => {
    const product = formData.products[index];
    if (!product.isNew) return;

    // Validate before saving
    if (!validateProduct(product, index)) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields correctly",
      });
      return;
    }

    try {
      const updatedProducts = [...formData.products];
      updatedProducts[index] = { ...product, isSaving: true };
      setFormData({ ...formData, products: updatedProducts });

      let imageUrl = "";
      if (product.image) {
        imageUrl = await uploadImageToFirebase(product.image);
      }

      const productData = {
        name: product.name,
        productCategoryId: product.categoryId,
        price: parseFloat(product.price.replace(/\./g, "")),
        imageUrl: imageUrl,
        quantity: product.quantity,
        status: "Active",
        duration:
          localStorage.getItem("storeType") === "2" ? product.duration : null,
        unit: localStorage.getItem("storeType") === "2" ? product.unit : null,
      };

      const response = await StoreMenuServices.addProductToMenu(
        params.id,
        productData
      );

      if (response?.data?.messageResponse === "Create Product Successfully!") {
        updatedProducts[index] = {
          ...product,
          isNew: false,
          isSaving: false,
          imagePreview: imageUrl,
          status: "Active",
        };
        setFormData({ ...formData, products: updatedProducts });

        toast({
          title: "Success",
          description: response.data.messageResponse,
        });
        return;
      }

      throw new Error(
        response?.data?.messageResponse || "Failed to add product"
      );
    } catch (err) {
      if (err instanceof AxiosError) {
        console.error("Error details:", err.message);

        const updatedProducts = [...formData.products];
        updatedProducts[index] = { ...product, isSaving: false };
        setFormData({ ...formData, products: updatedProducts });

        toast({
          variant: "destructive",
          title: "Add Product failed!",
          description:
            err.response?.data.messageResponse ||
            err.response?.data.Error ||
            "Failed to add product",
        });
      }
    }
  };

  const removeProduct = async (index: number) => {
    const product = formData.products[index];

    try {
      if (product.id && !product.isNew) {
        await ProductServices.deleteProductById(product.id);
      }

      const newProducts = formData.products.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        products: newProducts,
      });

      toast({
        title: "Success",
        description: "Product removed successfully",
      });
    } catch (error) {
      console.error("Error removing product:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove product",
      });
    }
  };

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const files = e.target.files;
    if (!files) return;
    const file = files[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newProducts = [...formData.products];
        newProducts[index] = {
          ...newProducts[index],
          image: file,
          imagePreview: reader.result,
        };
        setFormData({
          ...formData,
          products: newProducts,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    const newProducts = [...formData.products];
    newProducts[index] = {
      ...newProducts[index],
      image: null,
      imagePreview: null,
    };
    setFormData({
      ...formData,
      products: newProducts,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const storeMenuData: StoreMenuPatch = {
        name: formData.menuName,
        dateFilter: formData.dateFilter,
        imageUrl: "",
      };

      await StoreMenuServices.editStoreMenu(params.id, storeMenuData);

      toast({
        title: "Success",
        description: "Menu saved successfully",
      });

      // Save any new products
      const newProducts = formData.products.filter((product) => product.isNew);
      for (let i = 0; i < formData.products.length; i++) {
        if (formData.products[i].isNew) {
          await handleSaveProduct(i);
        }
      }
      const menuId = localStorage.getItem("menuId");
      router.push(`/store/menu/${menuId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update menu");
      console.error("Error updating menu:", err);
    }
  };

  const handleSaveMultipleProducts = async () => {
    try {
      const newProducts = formData.products.filter((product) => product.isNew);
      if (newProducts.length === 0) return;

      // Validate all new products
      const isValid = newProducts.every((product, idx) =>
        validateProduct(
          product,
          formData.products.findIndex((p) => p === product)
        )
      );

      if (!isValid) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please fill in all required fields correctly",
        });
        return;
      }

      // Hiển thị loading state
      setIsLoading(true);

      // Xử lý upload ảnh và tạo dữ liệu cho tất cả sản phẩm mới
      const productPromises = newProducts.map(async (product) => {
        let imageUrl = "";
        if (product.image) {
          imageUrl = await uploadImageToFirebase(product.image);
        }

        return {
          name: product.name,
          productCategoryId: product.categoryId,
          price: parseFloat(product.price.replace(/\./g, "")),
          imageUrl: imageUrl,
          quantity: product.quantity,
          status: "Active",
          duration:
            localStorage.getItem("storeType") === "2" ? product.duration : null,
          unit: localStorage.getItem("storeType") === "2" ? product.unit : null,
        };
      });

      const preparedProducts = await Promise.all(productPromises);

      // Gọi API để thêm nhiều sản phẩm cùng lúc
      await Promise.all(
        preparedProducts.map((productData) =>
          StoreMenuServices.addProductToMenu(params.id, productData)
        )
      );

      // Cập nhật state sau khi thêm thành công
      const updatedProducts = formData.products.map((product) => {
        if (product.isNew) {
          return {
            ...product,
            isNew: false,
            isSaving: false,
            status: "Active",
          };
        }
        return product;
      });

      setFormData({
        ...formData,
        products: updatedProducts,
      });

      toast({
        title: "Success",
        description: "All products added successfully",
      });
    } catch (error) {
      console.error("Error adding multiple products:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add some products",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const [startRent, setStartRent] = useState(getCurrentTime());

  const getDurationLabel = (duration: number, unit: string) => {
    return `${duration} ${unit}${duration > 1 ? "s" : ""}`;
  };

  const validateProduct = (product: Product, index: number): boolean => {
    const errors: ProductErrors = {};
    let isValid = true;

    // Name validation
    if (!product.name?.trim()) {
      errors.name = "Product name is required";
      isValid = false;
    } else if (product.name.length < 2) {
      errors.name = "Product name must be at least 2 characters";
      isValid = false;
    } else if (product.name.length > 50) {
      errors.name = "Product name must not exceed 50 characters";
      isValid = false;
    }

    // Price validation
    if (!product.price) {
      errors.price = "Price is required";
      isValid = false;
    } else {
      const numericPrice = parseInt(product.price.replace(/\./g, ""));
      if (isNaN(numericPrice) || numericPrice <= 0) {
        errors.price = "Price must be greater than 0";
        isValid = false;
      } else if (numericPrice < 100000) {
        errors.price = "Price must not be less than 100,000 VND";
        isValid = false;
      } else if (numericPrice > 10000000) {
        errors.price = "Price must not exceed 10,000,000";
        isValid = false;
      }
    }

    // Quantity validation
    if (!product.quantity) {
      errors.quantity = "Quantity is required";
      isValid = false;
    } else if (product.quantity < 1) {
      errors.quantity = "Quantity must be at least 1";
      isValid = false;
    } else if (product.quantity > 1000) {
      errors.quantity = "Quantity must not exceed 1000";
      isValid = false;
    }

    // Category validation
    if (!product.categoryId) {
      errors.categoryId = "Category is required";
      isValid = false;
    }

    // Image validation
    if (!product.image && !product.imagePreview) {
      errors.image = "Image is required";
      isValid = false;
    }

    // Duration and Unit validation for storeType 2
    if (localStorage.getItem("storeType") === "2") {
      if (!product.duration) {
        errors.duration = "Duration is required";
        isValid = false;
      } else {
        if (product.unit === "Hour") {
          if (product.duration > MAX_HOURS) {
            errors.duration = "Duration must not exceed 24 hours";
            isValid = false;
          }
        } else if (product.unit === "Minute") {
          if (product.duration > MAX_MINUTES) {
            errors.duration = "Duration must not exceed 1440 minutes";
            isValid = false;
          }
        }
      }

      if (!product.unit) {
        errors.unit = "Unit is required";
        isValid = false;
      }
    }

    // Update errors state
    setProductErrors((prev) => {
      const newErrors = [...prev];
      newErrors[index] = errors;
      return newErrors;
    });

    return isValid;
  };

  // Add helper function to determine appropriate unit
  const determineUnit = (duration: number): "Hour" | "Minute" => {
    // If duration is less than 60, use minutes
    // If duration is 60 or greater, convert to hours
    return duration < 60 ? "Minute" : "Hour";
  };

  // Add helper function to convert duration to hours and minutes
  const convertToHoursAndMinutes = (totalMinutes: number | null) => {
    if (!totalMinutes) return { hours: 0, minutes: 0 };
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes };
  };

  // Add helper function to convert hours and minutes to total minutes
  const convertToTotalMinutes = (hours: number, minutes: number) => {
    return hours * 60 + minutes;
  };

  // Add max duration constants
  const MAX_HOURS = 24;
  const MAX_MINUTES = 1440;

  return (
    <ScrollArea>
      <div className="max-w-4xl mx-auto p-6 text-black">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tên Menu - Read only */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Menu</h2>
            <div className="mb-4">
              <label className="block mb-2 font-medium">Menu Name</label>
              <input
                type="text"
                value={formData.menuName}
                className="w-full p-2 border rounded bg-gray-100"
                disabled
              />
            </div>
          </div>

          {/* Ca làm việc - Single Select */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Shift</h2>
            <select
              value={formData.dateFilter}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dateFilter: Number(e.target.value) as DateFilter,
                })
              }
              disabled
              className="w-full p-2 border rounded"
            >
              {Object.entries(DATE_FILTER_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Sản phẩm - Editable */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Products</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveMultipleProducts}
                  disabled={
                    isLoading || !formData.products.some((p) => p.isNew)
                  }
                  className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? "Saving..." : "Save All New Products"}
                </button>
                <button
                  type="button"
                  onClick={addProduct}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </button>
              </div>
            </div>

            {formData.products.map((product, index) => (
              <div key={index} className="mb-6 p-4 border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <div className="col-span-2 space-y-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Product Name"
                        value={product.name}
                        onChange={(e) => {
                          const newProducts = [...formData.products];
                          newProducts[index].name = e.target.value;
                          setFormData({ ...formData, products: newProducts });
                          validateProduct(newProducts[index], index);
                        }}
                        className={`w-full p-2 border rounded ${
                          productErrors[index]?.name ? "border-red-500" : ""
                        }`}
                        required
                        readOnly={!product.isNew}
                      />
                      {productErrors[index]?.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {productErrors[index].name}
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Price"
                        value={product.price}
                        onChange={(e) => {
                          const newProducts = [...formData.products];
                          newProducts[index].price = formatPrice(
                            e.target.value
                          );
                          setFormData({ ...formData, products: newProducts });
                          validateProduct(newProducts[index], index);
                        }}
                        className={`w-full p-2 border rounded ${
                          productErrors[index]?.price ? "border-red-500" : ""
                        }`}
                        required
                        readOnly={!product.isNew}
                      />
                      {productErrors[index]?.price && (
                        <p className="text-red-500 text-sm mt-1">
                          {productErrors[index].price}
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        type="number"
                        placeholder="Quantity"
                        value={product.quantity}
                        onChange={(e) => {
                          const newProducts = [...formData.products];
                          newProducts[index].quantity = parseInt(
                            e.target.value
                          );
                          setFormData({ ...formData, products: newProducts });
                          validateProduct(newProducts[index], index);
                        }}
                        className={`w-full p-2 border rounded ${
                          productErrors[index]?.quantity ? "border-red-500" : ""
                        }`}
                        required
                        min="1"
                        readOnly={!product.isNew}
                      />
                      {productErrors[index]?.quantity && (
                        <p className="text-red-500 text-sm mt-1">
                          {productErrors[index].quantity}
                        </p>
                      )}
                    </div>

                    <div>
                      <select
                        value={product.categoryId}
                        onChange={(e) => {
                          const newProducts = [...formData.products];
                          newProducts[index].categoryId = e.target.value;
                          setFormData({ ...formData, products: newProducts });
                          validateProduct(newProducts[index], index);
                        }}
                        className={`w-full p-2 border rounded ${
                          productErrors[index]?.categoryId
                            ? "border-red-500"
                            : ""
                        }`}
                        required
                        disabled={!product.isNew}
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {productErrors[index]?.categoryId && (
                        <p className="text-red-500 text-sm mt-1">
                          {productErrors[index].categoryId}
                        </p>
                      )}
                    </div>

                    {localStorage.getItem("storeType") === "2" && (
                      <div className="space-y-2">
                        <label className="block mb-2 text-sm font-medium">
                          Duration
                        </label>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <input
                              type="number"
                              placeholder="Enter duration"
                              value={product.duration || ""}
                              onChange={(e) => {
                                const duration =
                                  parseInt(e.target.value) || null;
                                const newProducts = [...formData.products];
                                newProducts[index] = {
                                  ...newProducts[index],
                                  duration: duration,
                                };
                                setFormData({
                                  ...formData,
                                  products: newProducts,
                                });
                                validateProduct(newProducts[index], index);
                              }}
                              className={`w-full p-2 border rounded ${
                                productErrors[index]?.duration
                                  ? "border-red-500"
                                  : ""
                              }`}
                              min="1"
                              max={
                                product.unit === "Hour"
                                  ? MAX_HOURS
                                  : MAX_MINUTES
                              }
                              disabled={!product.isNew}
                            />
                            {productErrors[index]?.duration && (
                              <p className="text-red-500 text-sm mt-1">
                                {productErrors[index].duration}
                              </p>
                            )}
                          </div>
                          <div className="flex-1">
                            <select
                              value={product.unit || ""}
                              onChange={(e) => {
                                const newUnit = e.target.value as
                                  | "Hour"
                                  | "Minute"
                                  | null;
                                const newProducts = [...formData.products];

                                // Adjust duration if it exceeds the new unit's maximum
                                let newDuration = product.duration;
                                if (
                                  newUnit === "Hour" &&
                                  newDuration &&
                                  newDuration > MAX_HOURS
                                ) {
                                  newDuration = MAX_HOURS;
                                }

                                newProducts[index] = {
                                  ...newProducts[index],
                                  unit: newUnit,
                                  duration: newDuration,
                                };
                                setFormData({
                                  ...formData,
                                  products: newProducts,
                                });
                                validateProduct(newProducts[index], index);
                              }}
                              className={`w-full p-2 border rounded ${
                                productErrors[index]?.unit
                                  ? "border-red-500"
                                  : ""
                              }`}
                              disabled={!product.isNew}
                            >
                              <option value="">Select Unit</option>
                              <option value="Hour">Hour</option>
                              <option value="Minute">Minute</option>
                            </select>
                            {productErrors[index]?.unit && (
                              <p className="text-red-500 text-sm mt-1">
                                {productErrors[index].unit}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    {productErrors[index]?.image && (
                      <p className="text-red-500 text-sm mb-1">
                        {productErrors[index].image}
                      </p>
                    )}
                    {product.imagePreview ? (
                      <div className="relative">
                        <img
                          src={product.imagePreview as string}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded"
                        />
                        {product.isNew && (
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      product.isNew && (
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, index)}
                            className="hidden"
                            id={`image-upload-${index}`}
                          />
                          <label
                            htmlFor={`image-upload-${index}`}
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:bg-gray-50"
                          >
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                            <span className="mt-2 text-sm text-gray-500">
                              Upload Image
                            </span>
                          </label>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  {product.isNew && (
                    <button
                      type="button"
                      onClick={() => handleSaveProduct(index)}
                      disabled={product.isSaving}
                      className="flex items-center px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      {product.isSaving ? "Saving..." : "Save Product"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeProduct(index)}
                    className="flex items-center px-3 py-1 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Nút submit */}
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
    </ScrollArea>
  );
};

export default MenuCreationForm;
