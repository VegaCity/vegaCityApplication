"use client";
import { useState, useEffect } from "react";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ProductCategory,
  ProductCategoryPost,
  ProductCategoryPatch,
} from "@/types/productCategory";
import { ProductCategoryServices } from "@/components/services/productCategoryService";

interface ApiResponse {
  statusCode: number;
  messageResponse: string;
  data: ProductCategory[];
  metaData: {
    size: number;
    page: number;
    total: number;
    totalPage: number;
  };
  parentName: string | null;
  qrCode: string | null;
}

export default function ProductCategoryPage() {
  const { toast } = useToast();
  const [productCategories, setProductCategories] = useState<ProductCategory[]>(
    []
  );
  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] =
    useState<ProductCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductCategories = async () => {
    try {
      setLoading(true);
      const response = await ProductCategoryServices.getProductCategories({
        page: 1,
        size: 20,
        storeId: localStorage.getItem("storeId") as string,
      });

      const apiResponse = response.data as ApiResponse;
      if (apiResponse.statusCode === 200) {
        setProductCategories(apiResponse.data);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const categoryData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
    };

    try {
      if (selectedCategory) {
        await ProductCategoryServices.editProductCategory(
          selectedCategory.id,
          categoryData as ProductCategoryPatch
        );
        toast({
          title: "Success",
          description: "Product category updated successfully",
        });
      } else {
        await ProductCategoryServices.createProductCategory(
          categoryData as ProductCategoryPost
        );
        toast({
          title: "Success",
          description: "New product category created successfully",
        });
      }

      fetchProductCategories();
      setIsModalOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error("Error saving product category:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error saving product category",
      });
    }
  };

  const handleEdit = async (category: ProductCategory) => {
    const patchData: ProductCategoryPatch = {
      name: category.name,
      description: category.description,
    };
    try {
      const response = await ProductCategoryServices.editProductCategory(
        category.id,
        patchData
      );
      setSelectedCategory(category);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching category details:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error loading category details",
      });
    }
  };

  const handleDeleteClick = (category: ProductCategory) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (categoryToDelete) {
      try {
        await ProductCategoryServices.deleteProductCategoryById(
          categoryToDelete.id
        );
        toast({
          title: "Success",
          description: "Product category deleted successfully",
        });
        fetchProductCategories();
      } catch (error) {
        console.error("Error deleting product category:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Error deleting product category",
        });
      }
    }
    setIsDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Categories Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          <PlusCircle size={20} />
          Add Category
        </button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              productCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {category.description}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 text-blue-500 hover:bg-blue-100 rounded"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(category)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {selectedCategory ? "Edit Category" : "Add New Category"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-2">Category Name</label>
                <input
                  name="name"
                  defaultValue={selectedCategory?.name}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Description</label>
                <textarea
                  name="description"
                  defaultValue={selectedCategory?.description}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedCategory(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {selectedCategory ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the category "
              {categoryToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
