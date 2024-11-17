import React, { useState } from 'react';
import { ChevronRight, Clock, Store, Coffee, Users, Plus } from 'lucide-react';
import Link from 'next/link';

const MenuList = () => {
  // Dữ liệu giả
  const [menus, setMenus] = useState([
    {
      id: 1,
      name: "Menu Chính",
      description: "Các món ăn chính trong nhà hàng",
      itemCount: 45,
      status: "active",
      lastUpdated: "2024-03-15",
      shifts: [
        {
          name: "Ca sáng",
          startTime: "07:00",
          endTime: "11:00"
        }
      ],
      products: [
        {
          name: "Phở bò",
          price: "45000",
          imagePreview: null
        }
      ],
      creator: {
        name: "Nguyễn Văn A",
        email: "nguyenvana@example.com",
        phone: "0123456789"
      }
    },
    {
      id: 2,
      name: "Menu Cuối Tuần",
      description: "Món ăn đặc biệt cho cuối tuần",
      itemCount: 20,
      status: "active",
      lastUpdated: "2024-03-14",
      creator: {
        name: "Trần Thị B",
        email: "tranthib@example.com",
        phone: "0987654321"
      }
    }
  ]);

  // Hàm thêm menu mới
  interface MenuData {
    menuName: string;
    shifts: { name: string; startTime: string; endTime: string }[];
    products: { name: string; price: string; imagePreview: null }[];
    creator: { name: string; email: string; phone: string };
  }

  const addNewMenu = (menuData: MenuData) => {
    const newMenu = {
      id: menus.length + 1,
      name: menuData.menuName,
      description: `Menu created on ${new Date().toLocaleDateString()}`,
      itemCount: menuData.products.length,
      status: 'active',
      lastUpdated: new Date().toISOString().split('T')[0],
      shifts: menuData.shifts,
      products: menuData.products,
      creator: menuData.creator
    };

    setMenus([...menus, newMenu]);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Danh sách Menu</h1>
          <p className="text-gray-600">Quản lý các menu của nhà hàng</p>
        </div>
        <Link 
          href="/store/menu/create" 
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Tạo menu mới
        </Link>
      </div>

      <div className="grid gap-4">
        {menus.map((menu) => (
          <Link 
            href={`/store/menu/${menu.id}`} 
            key={menu.id}
            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{menu.name}</h3>
                  <p className="text-gray-600 mb-4">{menu.description}</p>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Store size={16} />
                      <span>{menu.itemCount} món</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>Cập nhật: {new Date(menu.lastUpdated).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      <span>Người tạo: {menu.creator.name}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    menu.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {menu.status === 'active' ? 'Đang hoạt động' : 'Tạm dừng'}
                  </span>
                  <ChevronRight className="text-gray-400" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MenuList;