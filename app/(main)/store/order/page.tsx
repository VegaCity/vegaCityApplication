'use client'
import React, { useState } from 'react';
import { ArrowUpDown, ChevronDown, ChevronUp, User } from 'lucide-react';

const PurchaseHistory = () => {
  // Dữ liệu mẫu với cấu trúc mới - nhóm theo người dùng
  const users = [
    {
      id: 1,
      name: 'Nguyễn Văn A',
      vcard: 'VGC101720242816399',
      phone: '0901234567',
      purchases: [
        {
          id: 1,
          productName: 'Bàn học gaming gấp gọn ngồi bệt chân khung sắt tĩnh điện',
          price: 265000,
          quantity: 2,
          date: '2024-04-01',
          status: 'Đã mua',
          image: '/api/placeholder/40/40'
        },
        {
          id: 2,
          productName: 'Máy giặt Mini tự động gấp gọn thông minh',
          price: 700000,
          quantity: 1,
          date: '2024-04-01',
          status: 'Đã mua',
          image: '/api/placeholder/40/40'
        }
      ]
    },
    {
      id: 2,
      name: 'Trần Thị B',
      vcard: 'VGC101720242816399',
      phone: '0909876543',
      purchases: [
        {
          id: 3,
          productName: 'Ghế văn phòng cao cấp',
          price: 1200000,
          quantity: 1,
          date: '2024-03-28',
          status: 'Đã mua',
          image: '/api/placeholder/40/40'
        },
        {
          id: 4,
          productName: 'Đèn học LED thông minh',
          price: 450000,
          quantity: 2,
          date: '2024-03-28',
          status: 'Đã mua',
          image: '/api/placeholder/40/40'
        }
      ]
    }
  ];

  const [expandedUsers, setExpandedUsers] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const formatPrice = (price : number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(price);
  };

  const formatDate = (dateString : string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusColor = (status : string) => {
    switch (status) {
      case 'Đã mua':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateTotalSpent = (purchases: { price: number, quantity: number }[]) => {
    return purchases.reduce((total, purchase) => total + (purchase.price * purchase.quantity), 0);
  };

  const toggleUser = (userId: number) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.purchases.some(p => p.productName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Lịch Sử Mua Hàng Theo Khách Hàng</h1>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="px-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredUsers.map(user => (
          <div key={user.id} className="border rounded-lg">
            {/* User Header */}
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
              onClick={() => toggleUser(user.id)}
            >
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-2 rounded-full">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">{user.name}</h3>
                  <div className="text-sm text-gray-500">
                    {user.vcard} • {user.phone}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500">Tổng chi tiêu</div>
                  <div className="font-medium">{formatPrice(calculateTotalSpent(user.purchases))}</div>
                </div>
                {expandedUsers.has(user.id) ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>

            {/* Purchase Details */}
            {expandedUsers.has(user.id) && (
              <div className="border-t">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="py-3 px-6 text-left">Sản phẩm</th>
                      <th className="py-3 px-6 text-left">Số lượng</th>
                      <th className="py-3 px-6 text-left">Đơn giá</th>
                      <th className="py-3 px-6 text-left">Tổng tiền</th>
                      <th className="py-3 px-6 text-left">Ngày mua</th>
                      <th className="py-3 px-6 text-left">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.purchases.map((purchase) => (
                      <tr key={purchase.id} className="border-b last:border-b-0 hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={purchase.image}
                              alt={purchase.productName}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <span className="line-clamp-1">{purchase.productName}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">{purchase.quantity}</td>
                        <td className="py-4 px-6">{formatPrice(purchase.price)}</td>
                        <td className="py-4 px-6">{formatPrice(purchase.price * purchase.quantity)}</td>
                        <td className="py-4 px-6">{formatDate(purchase.date)}</td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(purchase.status)}`}>
                            {purchase.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PurchaseHistory;