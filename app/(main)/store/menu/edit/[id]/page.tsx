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

const DATE_FILTER_LABELS = {
  [DateFilter.Morning]: "Ca sáng",
  [DateFilter.Afternoon]: "Ca chiều",
  [DateFilter.Lunch]: "Ca trưa",
};

interface Product {
  id?: string;
  name: string;
  price: string;
  categoryId: string;
  image: File | null;
  imagePreview: string | ArrayBuffer | null;
  isNew?: boolean;
  isSaving?: boolean;
  status?: string;
  dateFilter?: number;
}

interface MenuData {
  id?: string;
  menuName: string;
  dateFilter: DateFilter;
  creator: {
    name: string;
    email: string;
    phone: string;
  };
  products: Product[];
  itemCount?: number;
  lastUpdated?: string;
}
const initialFormData: MenuData = {
  menuName: "",
  dateFilter: DateFilter.Morning,
  creator: {
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0123456789",
  },
  products: [
    {
      name: "",
      price: "",
      categoryId: "",
      image: null,
      imagePreview: null,
    },
  ],
};

interface MenuCreationFormProps {
  params: { id: string };
}

const MenuCreationForm = ({ params }: MenuCreationFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<MenuData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();
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
          };
        });

      setFormData({
        id: menuData.id,
        menuName: menuData.name,
        dateFilter: menuData.dateFilter,
        creator: menuData.creator || initialFormData.creator,
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
        ...formData.products,
        {
          name: "",
          price: "",
          categoryId: "",
          image: null,
          imagePreview: null,
          isNew: true,
        },
      ],
    });
  };

  const handleSaveProduct = async (index: number) => {
    const product = formData.products[index];
    if (!product.isNew) return;

    try {
      const updatedProducts = [...formData.products];
      updatedProducts[index] = { ...product, isSaving: true };
      setFormData({ ...formData, products: updatedProducts });

      // Upload image to Firebase if exists
      let imageUrl = "";
      if (product.image) {
        imageUrl = await uploadImageToFirebase(product.image);
      }

      const productData = {
        name: product.name,
        productCategoryId: product.categoryId,
        price: parseFloat(product.price),
        imageUrl: imageUrl,
        status: "Active", // Set initial status as Active
      };

      await StoreMenuServices.addProductToMenu(params.id, productData);

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
        description: "Product added successfully",
      });
    } catch (err) {
      console.error("Error adding product:", err);
      setError(err instanceof Error ? err.message : "Failed to add product");

      const updatedProducts = [...formData.products];
      updatedProducts[index] = { ...product, isSaving: false };
      setFormData({ ...formData, products: updatedProducts });

      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add product",
      });
    }
  };

  const removeProduct = async (index: number) => {
    const product = formData.products[index];

    try {
      // If the product has an ID and is not a new product, call the delete API
      if (product.id && !product.isNew) {
        await ProductServices.deleteProductById(product.id);
      }

      // Remove the product from the local state
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tên Menu - Read only */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Thông tin Menu</h2>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Tên Menu</label>
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
          <h2 className="text-xl font-semibold mb-4">Ca làm việc</h2>
          <select
            value={formData.dateFilter}
            onChange={(e) =>
              setFormData({
                ...formData,
                dateFilter: Number(e.target.value) as DateFilter,
              })
            }
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
            <h2 className="text-xl font-semibold">Sản phẩm</h2>
            <button
              type="button"
              onClick={addProduct}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm sản phẩm
            </button>
          </div>

          {formData.products.map((product, index) => (
            <div key={index} className="mb-6 p-4 border rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div className="col-span-2 space-y-4">
                  <input
                    type="text"
                    placeholder="Tên sản phẩm"
                    value={product.name}
                    onChange={(e) => {
                      const newProducts = [...formData.products];
                      newProducts[index].name = e.target.value;
                      setFormData({ ...formData, products: newProducts });
                    }}
                    className="w-full p-2 border rounded"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Giá"
                    value={product.price}
                    onChange={(e) => {
                      const newProducts = [...formData.products];
                      newProducts[index].price = e.target.value;
                      setFormData({ ...formData, products: newProducts });
                    }}
                    className="w-full p-2 border rounded"
                    required
                  />
                  <select
                    value={product.categoryId}
                    onChange={(e) => {
                      const newProducts = [...formData.products];
                      newProducts[index].categoryId = e.target.value;
                      setFormData({ ...formData, products: newProducts });
                    }}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Chọn loại sản phẩm</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  {product.imagePreview ? (
                    <div className="relative">
                      <img
                        src={product.imagePreview as string}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
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
                          Thêm hình ảnh
                        </span>
                      </label>
                    </div>
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
                    {product.isSaving ? "Đang lưu..." : "Lưu sản phẩm"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeProduct(index)}
                  className="flex items-center px-3 py-1 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Xóa sản phẩm
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Thông tin người tạo - Read only */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Thông tin người tạo</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block mb-2 font-medium">Họ tên</label>
              <input
                type="text"
                value={formData.creator.name}
                className="w-full p-2 border rounded bg-gray-100"
                disabled
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Email</label>
              <input
                type="email"
                value={formData.creator.email}
                className="w-full p-2 border rounded bg-gray-100"
                disabled
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Số điện thoại</label>
              <input
                type="tel"
                value={formData.creator.phone}
                className="w-full p-2 border rounded bg-gray-100"
                disabled
              />
            </div>
          </div>
        </div>

        {/* Nút submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Save className="w-5 h-5 mr-2" />
            Lưu Menu
          </button>
        </div>
      </form>
    </div>
  );
};

export default MenuCreationForm;