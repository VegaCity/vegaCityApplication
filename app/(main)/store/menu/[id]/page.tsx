'use client';
import React, { useState, useEffect } from 'react';
import { Search, Plus, ChevronRight, Clock, ShoppingCart, Eye } from 'lucide-react';
import Link from "next/link";

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

const CATEGORIES = [
  "Tất cả",
  "Cơm",
  "Bún",
  "Món nước", 
  "Bánh",
  "Mì",
  "Món sáng"
];

const menuData = [
  { id: 1, name: "Phở bò", price: 45000, originalPrice: 50000, session: "sang", category: "Món nước" },
  { id: 2, name: "Cơm gà", price: 40000, originalPrice: 45000, session: "trua", category: "Cơm" },
  { id: 3, name: "Bún chả", price: 35000, originalPrice: 40000, session: "trua", category: "Bún" },
  { id: 4, name: "Bánh mì", price: 20000, originalPrice: 25000, session: "sang", category: "Bánh" },
  { id: 5, name: "Cơm rang", price: 35000, originalPrice: 38000, session: "toi", category: "Cơm" },
  { id: 6, name: "Mì xào", price: 40000, originalPrice: 45000, session: "toi", category: "Mì" },
  { id: 7, name: "Xôi", price: 15000, originalPrice: 18000, session: "sang", category: "Món sáng" },
  { id: 8, name: "Bún bò", price: 45000, originalPrice: 50000, session: "trua", category: "Bún" }
];

const MenuUI = () => {
  const [selectedSession, setSelectedSession] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentSession, setCurrentSession] = useState<keyof typeof SESSIONS | null>(null);
  const [isOwnerMode, setIsOwnerMode] = useState(false);
  const [cart, setCart] = useState<Array<{id: number, quantity: number}>>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const currentTimeStr = currentTime.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });

    const isInTimeRange = (start: string | number, end: string | number) => {
      const current = currentTimeStr;
      if (end < start) {
        return current >= start || current < end;
      }
      return current >= start && current < end;
    };

    let activeSession = null;
    Object.entries(SESSIONS).forEach(([session, time]) => {
      if (isInTimeRange(time.start, time.end)) {
        activeSession = session;
      }
    });

    setCurrentSession(activeSession);
  }, [currentTime]);

  const isItemAvailable = (itemSession: string | null) => {
    return itemSession === currentSession;
  };

  const handleAddToCart = (itemId: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === itemId);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === itemId 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { id: itemId, quantity: 1 }];
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, cartItem) => {
      const menuItem = menuData.find(item => item.id === cartItem.id);
      return total + (menuItem ? menuItem.price * cartItem.quantity : 0);
    }, 0);
  };

  const filteredMenu = menuData.filter(item => {
    const matchesSession = selectedSession === 'all' || item.session === selectedSession;
    const matchesCategory = selectedCategory === 'Tất cả' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && matchesSession && matchesCategory;
  });

  const formatPrice = (price: number | bigint) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getCategoryCount = (category: string) => {
    if (category === 'Tất cả') return menuData.length;
    return menuData.filter(item => item.category === category).length;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Menu Nhà hàng</h1>
          <div className="flex items-center text-gray-600">
            <Clock size={20} className="mr-2" />
            {currentTime.toLocaleTimeString()}
            {currentSession && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                {SESSIONS[currentSession].label}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Role Switch */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Chế độ:</span>
            <select 
              className="p-2 border rounded-lg"
              value={isOwnerMode ? "owner" : "staff"}
              onChange={(e) => setIsOwnerMode(e.target.value === "owner")}
            >
              <option value="staff">Nhân viên</option>
              <option value="owner">Chủ cửa hàng</option>
            </select>
          </div>
          
          {/* Conditional buttons based on role */}
          {isOwnerMode ? (
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <Link href="/store/product/create" className="flex items-center">
                <Plus size={20} />
                Thêm món
              </Link>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-medium">
                Giỏ hàng ({cart.reduce((sum, item) => sum + item.quantity, 0)})
              </span>
              <span className="text-blue-600 font-bold">
                {formatPrice(getCartTotal())}
              </span>
              <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                <ShoppingCart size={20} />
                Thanh toán
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-8">
        {/* Category sidebar */}
        <div className="w-64 flex-shrink-0">
          <h2 className="font-semibold mb-4">Danh mục món ăn</h2>
          <div className="space-y-2">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                <span>{category}</span>
                <span className="text-sm bg-white bg-opacity-20 px-2 py-0.5 rounded-full">
                  {getCategoryCount(category)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          {/* Search and Session filters */}
          <div className="mb-8">
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Tìm kiếm món ăn..."
                className="w-full p-3 pl-10 border rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
            </div>

            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setSelectedSession('all')}
                className={`px-4 py-2 rounded-lg ${
                  selectedSession === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Tất cả
              </button>
              {Object.entries(SESSIONS).map(([session, time]) => (
                <button
                  key={session}
                  onClick={() => setSelectedSession(session)}
                  className={`px-4 py-2 rounded-lg ${
                    selectedSession === session
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {time.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenu.map((item) => {
              const isAvailable = isItemAvailable(item.session);
              const cartItem = cart.find(cartItem => cartItem.id === item.id);
              
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-lg shadow-md transition-all ${
                    isAvailable ? 'hover:shadow-lg' : 'opacity-60'
                  }`}
                >
                  {/* Product image */}
                  <div className="aspect-square bg-gray-100 rounded-t-lg relative">
                    {!isAvailable && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-t-lg flex items-center justify-center">
                        <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm">
                          Hết giờ bán
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product info */}
                  <div className="p-4">
                    <h3 className="font-medium text-lg mb-2">{item.name}</h3>

                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-lg font-semibold text-blue-600">
                        {formatPrice(item.price)}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(item.originalPrice)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                        {SESSIONS[item.session as keyof typeof SESSIONS].label}
                      </span>
                      <span className="text-sm text-gray-500">{item.category}</span>
                    </div>

                    {/* Action buttons - different for each role */}
                    <div className="flex gap-2">
                      {!isOwnerMode && (
                        <button
                          className="flex-1 flex items-center justify-center gap-1 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleAddToCart(item.id)}
                          disabled={!isAvailable}
                        >
                         
                          {cartItem ? `Order (${cartItem.quantity})` : 'Add'}
                        </button>
                      )}

                      <Link
                        href={`/store/product/${item.id}`}
                        className={`flex items-center justify-center gap-1 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
                          isOwnerMode ? 'flex-1' : 'w-32'
                        }`}
                      >
                        <Eye size={16} />
                        Chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuUI;