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
'use client'
import { useState, useEffect, ChangeEvent } from 'react'
import { PlusCircle, Pencil, Trash2, Image as ImageIcon } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Product {
  id: number
  name: string
  price: number
  description: string
  imageUrl: string
}

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  useEffect(() => {
    setProducts([
      { 
        id: 1, 
        name: "Laptop", 
        price: 1000, 
        description: "A powerful laptop",
        imageUrl: "/api/placeholder/400/300"
      },
      { 
        id: 2, 
        name: "Phone", 
        price: 500, 
        description: "Latest smartphone",
        imageUrl: "/api/placeholder/400/300"
      }
    ])
  }, [])

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    let imageUrl = selectedProduct?.imageUrl || '/api/placeholder/400/300'
    if (selectedFile) {
      imageUrl = imagePreview
    }

    const newProduct = {
      id: selectedProduct?.id || Date.now(),
      name: formData.get('name') as string,
      price: Number(formData.get('price')),
      description: formData.get('description') as string,
      imageUrl: imageUrl
    }

    if (selectedProduct) {
      setProducts(products.map(p => p.id === selectedProduct.id ? newProduct : p))
    } else {
      setProducts([...products, newProduct])
    }
    
    setIsModalOpen(false)
    setSelectedProduct(null)
    setImagePreview('')
    setSelectedFile(null)
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setImagePreview(product.imageUrl)
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      setProducts(products.filter(p => p.id !== id))
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          <PlusCircle size={20} />
          Thêm sản phẩm
        </button>
      </div>

      {/* Bảng sản phẩm */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hình ảnh</TableHead>
              <TableHead>Tên sản phẩm</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map(product => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="w-20 h-20 relative">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.price.toLocaleString('vi-VN')}đ</TableCell>
                <TableCell className="max-w-xs truncate">{product.description}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 text-blue-500 hover:bg-blue-100 rounded"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-red-500 hover:bg-red-100 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal thêm/sửa sản phẩm */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {selectedProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-2">Hình ảnh sản phẩm</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="imageInput"
                  />
                  {imagePreview ? (
                    <div className="relative aspect-video mb-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('')
                          setSelectedFile(null)
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="imageInput"
                      className="flex flex-col items-center justify-center cursor-pointer py-6"
                    >
                      <ImageIcon size={40} className="text-gray-400 mb-2" />
                      <span className="text-gray-500">Click để chọn ảnh</span>
                    </label>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="block mb-2">Tên sản phẩm</label>
                <input
                  name="name"
                  defaultValue={selectedProduct?.name}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Giá</label>
                <input
                  name="price"
                  type="number"
                  defaultValue={selectedProduct?.price}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Mô tả</label>
                <textarea
                  name="description"
                  defaultValue={selectedProduct?.description}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setSelectedProduct(null)
                    setImagePreview('')
                    setSelectedFile(null)
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {selectedProduct ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}