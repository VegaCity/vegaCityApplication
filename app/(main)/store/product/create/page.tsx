'use client';
import React, { useState } from 'react';
import { Upload, X, DollarSign, ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  "Cơm",
  "Bún",
  "Món nước",
  "Bánh",
  "Mì",
  "Món sáng"
];

const CreateProduct = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    session: '',
    category: '',
    description: ''
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên món ăn';
    }

    if (!formData.price) {
      newErrors.price = 'Vui lòng nhập giá bán';
    } else if (isNaN(Number(formData.price))) {
      newErrors.price = 'Giá bán phải là số';
    }

    if (!formData.originalPrice) {
      newErrors.originalPrice = 'Vui lòng nhập giá gốc';
    } else if (isNaN(Number(formData.originalPrice))) {
      newErrors.originalPrice = 'Giá gốc phải là số';
    }

    if (!formData.session) {
      newErrors.session = 'Vui lòng chọn ca bán';
    }

    if (!formData.category) {
      newErrors.category = 'Vui lòng chọn danh mục';
    }

    if (!imagePreview) {
      newErrors.image = 'Vui lòng chọn hình ảnh món ăn';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      console.log('Form data:', formData);
      console.log('Image:', imagePreview);
      router.push('/store/menu');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Thêm món ăn mới</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Hình ảnh món ăn</Label>
              <div className={`
                border-2 border-dashed rounded-lg p-6
                ${errors.image ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400'}
                transition-colors duration-200
              `}>
                {!imagePreview ? (
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="p-4 rounded-full bg-gray-100">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="text-center space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="relative"
                      >
                        <input
                          id="image-upload"
                          name="image"
                          type="file"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                        Chọn hình ảnh
                      </Button>
                      <p className="text-sm text-gray-500">PNG, JPG, GIF tối đa 10MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative group">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-64 rounded-lg mx-auto"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={removeImage}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              {errors.image && (
                <p className="text-sm text-red-500">{errors.image}</p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Tên món ăn</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nhập tên món ăn..."
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Prices */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Giá bán</Label>
                <div className="relative">
                  <Input
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0"
                    className={`pl-8 ${errors.price ? 'border-red-500' : ''}`}
                  />
                  <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <span className="absolute right-3 top-2 text-sm text-gray-500">VND</span>
                </div>
                {errors.price && (
                  <p className="text-sm text-red-500">{errors.price}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="originalPrice">Giá gốc</Label>
                <div className="relative">
                  <Input
                    id="originalPrice"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    placeholder="0"
                    className={`pl-8 ${errors.originalPrice ? 'border-red-500' : ''}`}
                  />
                  <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <span className="absolute right-3 top-2 text-sm text-gray-500">VND</span>
                </div>
                {errors.originalPrice && (
                  <p className="text-sm text-red-500">{errors.originalPrice}</p>
                )}
              </div>
            </div>

            {/* Session & Category */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="session">Ca bán</Label>
                <Select
                  value={formData.session}
                  onValueChange={(value) => handleSelectChange(value, 'session')}
                >
                  <SelectTrigger className={errors.session ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Chọn ca bán" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SESSIONS).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.session && (
                  <p className="text-sm text-red-500">{errors.session}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Danh mục</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange(value, 'category')}
                >
                  <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Nhập mô tả món ăn..."
                className="resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Hủy
              </Button>
              <Button type="submit">
                Thêm món
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateProduct;