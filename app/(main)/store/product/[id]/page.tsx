'use client';
import React, { useState } from 'react';
import { ArrowLeft, Heart, Share2, Clock, Tag } from 'lucide-react';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  session: string;
  category: string;
  description?: string;
  ingredients?: string[];
  nutritionInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

const SESSIONS = {
  sang: {
    start: '07:00',
    end: '10:30',
    label: 'Ca sáng (7:00 - 10:30)'
  },
  trua: {
    start: '10:30',
    end: '14:00',
    label: 'Ca trưa (10:30 - 14:00)'
  },
  toi: {
    start: '14:00',
    end: '22:00',
    label: 'Ca tối (14:00 - 22:00)'
  }
};

// Mock data
const menuItemDetail: MenuItem = {
  id: 1,
  name: "Phở bò",
  price: 45000,
  originalPrice: 50000,
  session: "sang",
  category: "Món nước",
  description: "Phở bò truyền thống với nước dùng đậm đà, thịt bò tươi và các loại rau thơm đặc trưng. Món ăn được nấu theo công thức gia truyền, mang đến hương vị đậm đà, thơm ngon.",
  ingredients: [
    "Bánh phở tươi",
    "Thịt bò tươi",
    "Hành tây",
    "Hành lá",
    "Rau thơm các loại",
    "Gia vị đặc biệt"
  ],
  nutritionInfo: {
    calories: 480,
    protein: 25,
    carbs: 65,
    fat: 12
  }
};

const ProductDetail = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [menuItem, setMenuItem] = useState<MenuItem>(menuItemDetail);
  const [isWishlist, setIsWishlist] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleChange = (field: keyof MenuItem, value: any) => {
    setMenuItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleIngredientsChange = (value: string) => {
    const ingredients = value.split('\n').filter(item => item.trim() !== '');
    setMenuItem(prev => ({
      ...prev,
      ingredients
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement save logic here
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center mb-8">
          <Button variant="ghost" onClick={() => setIsEditing(false)} className="mr-4">
            <ArrowLeft className="mr-2" size={20} />
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold">Chỉnh sửa sản phẩm</h1>
        </div>

        <form onSubmit={handleSave}>
          <Card className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Tên sản phẩm</Label>
                <Input
                  id="name"
                  value={menuItem.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Giá bán</Label>
                  <Input
                    id="price"
                    type="number"
                    value={menuItem.price}
                    onChange={(e) => handleChange('price', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="originalPrice">Giá gốc</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={menuItem.originalPrice}
                    onChange={(e) => handleChange('originalPrice', Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="session">Ca phục vụ</Label>
                  <Select
                    value={menuItem.session}
                    onValueChange={(value) => handleChange('session', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn ca phục vụ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {Object.entries(SESSIONS).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Danh mục</Label>
                  <Input
                    id="category"
                    value={menuItem.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={menuItem.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="ingredients">Nguyên liệu (mỗi dòng một nguyên liệu)</Label>
                <Textarea
                  id="ingredients"
                  value={menuItem.ingredients?.join('\n')}
                  onChange={(e) => handleIngredientsChange(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Nutrition Information */}
              <div>
                <Label className="mb-2 block">Thông tin dinh dưỡng</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="calories">Calories (kcal)</Label>
                    <Input
                      id="calories"
                      type="number"
                      value={menuItem.nutritionInfo?.calories}
                      onChange={(e) => handleChange('nutritionInfo', {
                        ...menuItem.nutritionInfo,
                        calories: Number(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="protein">Protein (g)</Label>
                    <Input
                      id="protein"
                      type="number"
                      value={menuItem.nutritionInfo?.protein}
                      onChange={(e) => handleChange('nutritionInfo', {
                        ...menuItem.nutritionInfo,
                        protein: Number(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="carbs">Carbs (g)</Label>
                    <Input
                      id="carbs"
                      type="number"
                      value={menuItem.nutritionInfo?.carbs}
                      onChange={(e) => handleChange('nutritionInfo', {
                        ...menuItem.nutritionInfo,
                        carbs: Number(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fat">Fat (g)</Label>
                    <Input
                      id="fat"
                      type="number"
                      value={menuItem.nutritionInfo?.fat}
                      onChange={(e) => handleChange('nutritionInfo', {
                        ...menuItem.nutritionInfo,
                        fat: Number(e.target.value)
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Hủy
              </Button>
              <Button type="submit">
                Lưu thay đổi
              </Button>
            </div>
          </Card>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Back button and actions */}
      <div className="flex justify-between items-center mb-8">
        <Link href="/store/menu/${menu.id}" className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="mr-2" size={20} />
          Quay lại menu
        </Link>
        <div className="flex gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsWishlist(!isWishlist)}
          >
            <Heart
              size={20}
              className={isWishlist ? "fill-red-500 text-red-500" : ""}
            />
          </Button>
          <Button variant="outline" size="icon">
            <Share2 size={20} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="aspect-square bg-gray-100 rounded-xl"></div>

        {/* Product Info */}
        <div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">{menuItem.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-2xl font-bold text-blue-600">
                {formatPrice(menuItem.price)}
              </span>
              <span className="text-lg text-gray-400 line-through">
                {formatPrice(menuItem.originalPrice)}
              </span>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center text-gray-600">
                <Clock size={20} className="mr-2" />
                {SESSIONS[menuItem.session as keyof typeof SESSIONS].label}
              </div>
              <div className="flex items-center text-gray-600">
                <Tag size={20} className="mr-2" />
                {menuItem.category}
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-8">
            {menuItem.description}
          </p>

          {/* Edit button section */}
          <Card className="p-6 mb-8">
            <Button className="w-full" size="lg" onClick={() => setIsEditing(true)}>
              Chỉnh sửa sản phẩm
            </Button>
          </Card>

          {/* Additional Information */}
          <Accordion type="single" collapsible>
            <AccordionItem value="ingredients">
              <AccordionTrigger>Nguyên liệu</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-6 space-y-2">
                  {menuItem.ingredients?.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="nutrition">
              <AccordionTrigger>Thông tin dinh dưỡng</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Calories</div>
                    <div className="text-lg font-semibold">
                      {menuItem.nutritionInfo?.calories} kcal
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Protein</div>
                    <div className="text-lg font-semibold">
                      {menuItem.nutritionInfo?.protein}g
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Carbs</div>
                    <div className="text-lg font-semibold">
                      {menuItem.nutritionInfo?.carbs}g
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Fat</div>
                    <div className="text-lg font-semibold">
                      {menuItem.nutritionInfo?.fat}g
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;