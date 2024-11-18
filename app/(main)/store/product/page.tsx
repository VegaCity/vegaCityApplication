'use client';
import React, { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, Package, ListOrdered } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ProductManagement = () => {
  interface Product {
    id: number;
    name: string;
    price: string;
  }
  
  interface Category {
    id: number;
    name: string;
    products: Product[];
  }
  
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: "Cơm", products: [] },
    { id: 2, name: "Bún", products: [] },
    { id: 3, name: "Món nước", products: [] },
    { id: 4, name: "Bánh", products: [] },
    { id: 5, name: "Mì", products: [] },
  ]);

  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<{ id: number; name: string } | null>(null);
  const [newProduct, setNewProduct] = useState({ categoryId: "", name: "", price: "" });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const showNotification = (message: React.SetStateAction<string>) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      showNotification("Vui lòng nhập tên danh mục!");
      return;
    }
    
    const newId = Math.max(...categories.map(c => c.id), 0) + 1;
    setCategories([...categories, { id: newId, name: newCategory, products: [] }]);
    setNewCategory("");
    showNotification("Đã thêm danh mục mới!");
  };

  const handleDeleteCategory = (categoryId: number) => {
    setCategories(categories.filter(c => c.id !== categoryId));
    showNotification("Đã xóa danh mục!");
  };

  const startEditingCategory = (category: { id: number; name: string }) => {
    setEditingCategory({ ...category });
  };

  const handleSaveCategory = () => {
    if (editingCategory && !editingCategory.name.trim()) {
      showNotification("Tên danh mục không được để trống!");
      return;
    }
    
    if (editingCategory) {
      setCategories(categories.map(c => 
        c.id === editingCategory.id ? { ...c, name: editingCategory.name } : c
      ));
    }
    setEditingCategory(null);
    showNotification("Đã cập nhật danh mục!");
  };

  const handleAddProduct = () => {
    if (!newProduct.categoryId || !newProduct.name.trim() || !newProduct.price.trim()) {
      showNotification("Vui lòng nhập đầy đủ thông tin sản phẩm!");
      return;
    }

    setCategories(categories.map(c => {
      if (c.id === parseInt(newProduct.categoryId)) {
        const newProductId = Math.max(...c.products.map(p => p.id || 0), 0) + 1;
        return {
          ...c,
          products: [...c.products, { id: newProductId, name: newProduct.name, price: newProduct.price }]
        };
      }
      return c;
    }));
    
    setNewProduct({ categoryId: "", name: "", price: "" });
    showNotification("Đã thêm sản phẩm mới!");
  };

  const handleDeleteProduct = (categoryId: number, productId: any) => {
    setCategories(categories.map(c => {
      if (c.id === categoryId) {
        return {
          ...c,
          products: c.products.filter(p => p.id !== productId)
        };
      }
      return c;
    }));
    showNotification("Đã xóa sản phẩm!");
  };

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-800 mb-8">Quản lý Danh mục & Sản phẩm</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form thêm mới */}
          <div className="space-y-6">
            <Card className="border-blue-200 shadow-lg">
              <CardHeader className="bg-blue-600">
                <CardTitle className="text-white flex items-center">
                  <ListOrdered className="w-5 h-5 mr-2" />
                  Thêm Danh mục Mới
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Tên danh mục mới"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="border-blue-200 focus:border-blue-400"
                    />
                    <Button 
                      onClick={handleAddCategory}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 shadow-lg">
              <CardHeader className="bg-blue-600">
                <CardTitle className="text-white flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Thêm Sản phẩm Mới
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Select
                    value={newProduct.categoryId}
                    onValueChange={(value) => setNewProduct({...newProduct, categoryId: value})}
                  >
                    <SelectTrigger className="border-blue-200 focus:border-blue-400">
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Tên sản phẩm"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="border-blue-200 focus:border-blue-400"
                  />

                  <Input
                    placeholder="Giá"
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    className="border-blue-200 focus:border-blue-400"
                  />

                  <Button 
                    onClick={handleAddProduct}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm sản phẩm
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Danh sách danh mục và sản phẩm */}
          <Card className="border-blue-200 shadow-lg">
            <CardHeader className="bg-blue-600">
              <CardTitle className="text-white">Danh sách Danh mục & Sản phẩm</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {categories.map(category => (
                  <div key={category.id} className="rounded-lg border border-blue-200 p-4">
                    <div className="flex items-center justify-between mb-4">
                      {editingCategory?.id === category.id ? (
                        <div className="flex gap-2 items-center flex-1">
                          <Input
                            value={editingCategory.name}
                            onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                            className="border-blue-200 focus:border-blue-400"
                          />
                          <Button 
                            onClick={handleSaveCategory} 
                            variant="outline"
                            className="border-blue-400 text-blue-600 hover:bg-blue-50"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button 
                            onClick={() => setEditingCategory(null)} 
                            variant="outline"
                            className="border-blue-400 text-blue-600 hover:bg-blue-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <h3 className="text-lg font-semibold text-blue-800">{category.name}</h3>
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => startEditingCategory(category)} 
                              variant="outline"
                              className="border-blue-400 text-blue-600 hover:bg-blue-50"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button 
                              onClick={() => handleDeleteCategory(category.id)} 
                              variant="outline"
                              className="border-red-400 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>

                    {category.products.length > 0 && (
                      <>
                        <Separator className="my-4 bg-blue-100" />
                        <div className="space-y-2">
                          {category.products.map(product => (
                            <div key={product.id} 
                              className="flex items-center justify-between p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                            >
                              <div>
                                <span className="font-medium text-blue-800">{product.name}</span>
                                <span className="ml-4 text-blue-600">{Number(product.price).toLocaleString()}đ</span>
                              </div>
                              <Button
                                onClick={() => handleDeleteProduct(category.id, product.id)}
                                variant="outline"
                                size="icon"
                                className="border-red-400 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showAlert && (
        <Alert className="fixed bottom-4 right-4 w-auto bg-blue-600 text-white">
          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ProductManagement;