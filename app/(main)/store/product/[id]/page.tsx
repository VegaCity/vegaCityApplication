'use client';
import React, { useState } from 'react';
import { ArrowLeft, Heart, Share2, Clock, Tag, ShoppingCart, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Định nghĩa kiểu dữ liệu cho món ăn
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

// Mock data cho chi tiết món ăn
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

const ProductDetail = () => {
  const [quantity, setQuantity] = useState(1);
  const [isWishlist, setIsWishlist] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleQuantityChange = (action: 'increase' | 'decrease') => {
    if (action === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (action === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Back button and actions */}
      <div className="flex justify-between items-center mb-8">
        <Link href="/menu" className="flex items-center text-gray-600 hover:text-gray-900">
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
            <h1 className="text-3xl font-bold mb-4">{menuItemDetail.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-2xl font-bold text-blue-600">
                {formatPrice(menuItemDetail.price)}
              </span>
              <span className="text-lg text-gray-400 line-through">
                {formatPrice(menuItemDetail.originalPrice)}
              </span>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center text-gray-600">
                <Clock size={20} className="mr-2" />
                {SESSIONS[menuItemDetail.session as keyof typeof SESSIONS].label}
              </div>
              <div className="flex items-center text-gray-600">
                <Tag size={20} className="mr-2" />
                {menuItemDetail.category}
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-8">
            {menuItemDetail.description}
          </p>

          {/* Add to cart section */}
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleQuantityChange('decrease')}
                  className="p-2 rounded-lg border hover:bg-gray-50"
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className="text-xl font-medium w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange('increase')}
                  className="p-2 rounded-lg border hover:bg-gray-50"
                >
                  <Plus size={16} />
                </button>
              </div>
              <span className="text-xl font-bold text-blue-600">
                {formatPrice(menuItemDetail.price * quantity)}
              </span>
            </div>
            <Button className="w-full" size="lg">
              <ShoppingCart className="mr-2" size={20} />
              Thêm vào giỏ hàng
            </Button>
          </Card>

          {/* Additional Information */}
          <Accordion type="single" collapsible>
            <AccordionItem value="ingredients">
              <AccordionTrigger>Nguyên liệu</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-6 space-y-2">
                  {menuItemDetail.ingredients?.map((ingredient, index) => (
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
                      {menuItemDetail.nutritionInfo?.calories} kcal
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Protein</div>
                    <div className="text-lg font-semibold">
                      {menuItemDetail.nutritionInfo?.protein}g
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Carbs</div>
                    <div className="text-lg font-semibold">
                      {menuItemDetail.nutritionInfo?.carbs}g
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Fat</div>
                    <div className="text-lg font-semibold">
                      {menuItemDetail.nutritionInfo?.fat}g
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