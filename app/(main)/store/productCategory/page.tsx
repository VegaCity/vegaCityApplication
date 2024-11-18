// "use client";
// import React, { useState, useEffect, useRef } from "react";
// import { Store, Product } from "@/types/store/store";
// import { StoreServices } from "@/components/services/Store/storeServices";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { ShoppingCart, RefreshCw } from "lucide-react";
// import ShoppingCartComponent from "@/components/cart/cart";
// import { CartRef } from "@/components/cart/cart";
// import { toast } from "@/components/ui/use-toast";

// interface StoreDetailPageProps {
//   params: {
//     id: string;
//   };
// }

// const StoreDetailPage = ({ params }: StoreDetailPageProps) => {
//   const [store, setStore] = useState<Store>();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [products, setProducts] = useState<Product[]>([]);
//   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
//   const cartRef = useRef<CartRef>(null);
//   const [storeId, setStoreId] = useState<string | null>(null);
//   const [updating, setUpdating] = useState(false);
//   const [storeType, setStoreType] = useState<string | null>(null);

//   useEffect(() => {
//     const storedStoreId = localStorage.getItem("storeId");
//     if (storedStoreId) {
//       setStoreId(storedStoreId);
//     } else {
//       setError("No store ID found in localStorage");
//     }
//   }, []);

//   useEffect(() => {
//     const fetchStoreDetails = async () => {
//       if (storeId) {
//         try {
//           setLoading(true);
//           const { data } = await StoreServices.getStoreById(storeId);
//           setStore(data.data.store);
//           setStoreType(data.data.storeType);
//           localStorage.setItem("phone", data.data.store.phoneNumber);
//           setProducts(
//             Array.isArray(data.data.store.menus[0].products)
//               ? data.data.store.menus[0].products
//               : []
//           );
//         } catch (err) {
//           setError("Failed to load store details");
//         } finally {
//           setLoading(false);
//         }
//       }
//     };
//     fetchStoreDetails();
//   }, [storeId]);

//   const handleUpdateMenu = async () => {
//     const phone = localStorage.getItem("phone");
//     if (!phone) {
//       toast({
//         variant: "destructive",
//         title: "Error",
//         description: "Phone number not found in localStorage",
//       });
//       return;
//     }

//     try {
//       setUpdating(true);
//       await StoreServices.updateMenu(phone);
//       toast({
//         title: "Success",
//         description: "Menu updated successfully",
//       });

//       const { data } = await StoreServices.getStoreById(storeId!);
//       setStore(data.store);
//       setProducts(
//         Array.isArray(data.data.store.menus[0].products)
//           ? data.data.store.menus[0].products
//           : []
//       );
//     } catch (error) {
//       toast({
//         variant: "destructive",
//         title: "Error",
//         description: "Failed to update menu",
//       });
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const handleProductClick = (product: Product) => {
//     setSelectedProduct(product);
//     setIsModalOpen(true);
//   };

//   const handleAddToCart = (product: Product) => {
//     cartRef.current?.addToCart(product);
//   };

//   const filteredProducts = selectedCategory
//     ? products.filter(
//         (product) => product.productCategory?.name === selectedCategory
//       )
//     : products;

//   return (
//     <div className="container mx-auto p-4">
//       <div className="flex justify-between items-center mb-4">
//         <div>
//           <h1 className="text-2xl font-bold">{store?.name}</h1>
//           <p className="text-gray-500">{store?.shortName}</p>
//         </div>
//         {storeType === "Food" && (
//           <Button
//             onClick={handleUpdateMenu}
//             disabled={updating}
//             className="bg-primary text-white"
//             type="button"
//           >
//             <RefreshCw
//               className={`mr-2 h-4 w-4 ${updating ? "animate-spin" : ""}`}
//             />
//             {updating ? "Updating Menu..." : "Update Menu"}
//           </Button>
//         )}
//       </div>

//       <div className="mb-4">
//         <label className="font-semibold">Filter by Category: </label>
//         <select
//           onChange={(e) => setSelectedCategory(e.target.value || null)}
//           className="p-2 border border-gray-300 rounded-md"
//         >
//           <option value="">All</option>
//           {[...new Set(products.map((p) => p.productCategory?.name))]
//             .filter(Boolean)
//             .map((category) => (
//               <option key={category} value={category}>
//                 {category}
//               </option>
//             ))}
//         </select>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//         {filteredProducts.length > 0 ? (
//           filteredProducts.map((product) => (
//             <div
//               key={product.id}
//               onClick={() => handleProductClick(product)}
//               className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
//             >
//               <div className="relative h-48">
//                 <img
//                   src={product.imageUrl ?? "img/side.png"}
//                   alt={product.name}
//                   className="w-full h-full object-cover"
//                 />
//                 <span className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-sm">
//                   {product.productCategory?.name || "Unknown"}
//                 </span>
//               </div>
//               <div className="p-4">
//                 <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
//                 <div className="flex justify-between items-center">
//                   <span className="text-primary font-medium">
//                     {product.price.toLocaleString("vi-VN")} đ
//                   </span>
//                   <Button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleAddToCart(product);
//                     }}
//                     className="bg-primary text-white hover:bg-primary-600"
//                   >
//                     <ShoppingCart className="mr-2 h-4 w-4" />
//                     Add to Cart
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           ))
//         ) : (
//           <p>No products available</p>
//         )}
//       </div>

//       <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
//         <DialogContent className="max-w-2xl">
//           {selectedProduct && (
//             <>
//               <DialogHeader>
//                 <DialogTitle className="text-2xl font-semibold">
//                   {selectedProduct.name}
//                 </DialogTitle>
//               </DialogHeader>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
//                 <div className="aspect-square relative rounded-lg overflow-hidden">
//                   <img
//                     src={selectedProduct.imageUrl || "/api/placeholder/400/320"}
//                     alt={selectedProduct.name}
//                     className="object-cover w-full h-full"
//                   />
//                 </div>

//                 <div className="flex flex-col justify-between">
//                   <div>
//                     <div className="space-y-2">
//                       <p className="text-lg font-semibold text-primary">
//                         {selectedProduct.price.toLocaleString("vi-VN")} đ
//                       </p>
//                       <p className="text-sm text-gray-500">
//                         Category:{" "}
//                         {selectedProduct.productCategory?.name || "Unknown"}
//                       </p>
//                     </div>
//                   </div>
//                   <Button
//                     onClick={() => handleAddToCart(selectedProduct)}
//                     className="w-full mt-4"
//                   >
//                     <ShoppingCart className="mr-2 h-4 w-4" />
//                     Add to Cart
//                   </Button>
//                 </div>
//               </div>
//             </>
//           )}
//         </DialogContent>
//       </Dialog>

//       <ShoppingCartComponent ref={cartRef} />
//     </div>
//   );
// };

// export default StoreDetailPage;
// types.ts
// app/page.tsx
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
