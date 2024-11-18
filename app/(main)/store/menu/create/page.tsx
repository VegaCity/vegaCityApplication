'use client';

import React, { useState } from 'react';
import { Trash2, Plus, Save, Image as ImageIcon } from 'lucide-react';

const MenuCreationForm = () => {
  const [formData, setFormData] = useState({
    menuName: '',
    shifts: [
      {
        name: 'Ca sáng',
        startTime: '07:00',
        endTime: '11:00'
      }
    ],
    creator: {
      name: '',
      email: '',
      phone: ''
    },
    products: [
      {
        name: '',
        price: '',
        image: null as File | null,
        imagePreview: null as string | ArrayBuffer | null
      }
    ]
  });

  const addShift = () => {
    setFormData({
      ...formData,
      shifts: [...formData.shifts, { name: '', startTime: '', endTime: '' }]
    });
  };

  const removeShift = (index: number) => {
    const newShifts = formData.shifts.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      shifts: newShifts
    });
  };

  const addProduct = () => {
    setFormData({
      ...formData,
      products: [...formData.products, { name: '', price: '', image: null, imagePreview: null }]
    });
  };

  const removeProduct = (index: number) => {
    const newProducts = formData.products.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      products: newProducts
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
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
          imagePreview: reader.result
        };
        setFormData({
          ...formData,
          products: newProducts
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
      imagePreview: null
    };
    setFormData({
      ...formData,
      products: newProducts
    });
  };

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Xử lý gửi dữ liệu đến server ở đây
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tên Menu */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Thông tin Menu</h2>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Tên Menu</label>
            <input
              type="text"
              value={formData.menuName}
              onChange={(e) => setFormData({...formData, menuName: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Ca làm việc */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Ca làm việc</h2>
            <button
              type="button"
              onClick={addShift}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm ca
            </button>
          </div>
          
          {formData.shifts.map((shift, index) => (
            <div key={index} className="flex gap-4 items-center mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Tên ca"
                  value={shift.name}
                  onChange={(e) => {
                    const newShifts = [...formData.shifts];
                    newShifts[index].name = e.target.value;
                    setFormData({...formData, shifts: newShifts});
                  }}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="flex-1">
                <input
                  type="time"
                  value={shift.startTime}
                  onChange={(e) => {
                    const newShifts = [...formData.shifts];
                    newShifts[index].startTime = e.target.value;
                    setFormData({...formData, shifts: newShifts});
                  }}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="flex-1">
                <input
                  type="time"
                  value={shift.endTime}
                  onChange={(e) => {
                    const newShifts = [...formData.shifts];
                    newShifts[index].endTime = e.target.value;
                    setFormData({...formData, shifts: newShifts});
                  }}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <button
                type="button"
                onClick={() => removeShift(index)}
                className="p-2 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Sản phẩm */}
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
                {/* Thông tin sản phẩm */}
                <div className="col-span-2 space-y-4">
                  <input
                    type="text"
                    placeholder="Tên sản phẩm"
                    value={product.name}
                    onChange={(e) => {
                      const newProducts = [...formData.products];
                      newProducts[index].name = e.target.value;
                      setFormData({...formData, products: newProducts});
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
                      setFormData({...formData, products: newProducts});
                    }}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                {/* Phần upload hình ảnh */}
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
                        <span className="mt-2 text-sm text-gray-500">Thêm hình ảnh</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Nút xóa sản phẩm */}
              <div className="mt-4 flex justify-end">
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

        {/* Thông tin người tạo */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Thông tin người tạo</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block mb-2 font-medium">Họ tên</label>
              <input
                type="text"
                value={formData.creator.name}
                onChange={(e) => setFormData({
                  ...formData,
                  creator: {...formData.creator, name: e.target.value}
                })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Email</label>
              <input
                type="email"
                value={formData.creator.email}
                onChange={(e) => setFormData({
                  ...formData,
                  creator: {...formData.creator, email: e.target.value}
                })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Số điện thoại</label>
              <input
                type="tel"
                value={formData.creator.phone}
                onChange={(e) => setFormData({
                  ...formData,
                  creator: {...formData.creator, phone: e.target.value}
                })}
                className="w-full p-2 border rounded"
                required
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