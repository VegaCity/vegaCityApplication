import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageIcon, Upload, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { Product as StoreProduct } from "@/types/store/store";
import { ProductPatch } from "@/types/product";

interface ProductUpdateDialogProps {
  open: boolean;
  onClose: () => void;
  product: StoreProduct | null;
  onUpdate: (updatedProduct: ProductPatch) => Promise<void>;
}

const ProductUpdateDialog: React.FC<ProductUpdateDialogProps> = ({
  open,
  onClose,
  product,
  onUpdate,
}) => {
  const [formData, setFormData] = useState<ProductPatch>({
    name: "",
    price: 0,
    duration: 0,
    unit: "",
    imageUrl: "",
    quantity: 1,
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [storeType, setStoreType] = useState<string>("");

  const formatPrice = (price: string): string => {
    // Remove any non-digit characters except the last dot
    const numericValue = price.replace(/[^\d]/g, "");
    // Convert to number and format with thousand separators
    return numericValue === ""
      ? ""
      : Number(numericValue).toLocaleString("vi-VN");
  };

  useEffect(() => {
    const type = localStorage.getItem("storeType");
    setStoreType(type || "");
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price,
        duration: product.duration,
        unit: product.unit,
        imageUrl: product.imageUrl || "",
        quantity: product.quantity || 0,
      });
      setImagePreview(product.imageUrl || "");
    }
  }, [product]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      await onUpdate({
        ...formData,
        imageUrl: imagePreview,
      });
      onClose();
      toast.success("Product updated successfully");
    } catch (error) {
      toast.error("Failed to update product");
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Update Product Details
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Image Upload Section */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Product Image</Label>
            <div className="flex justify-center">
              <div className="relative w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-gray-400 transition-colors">
                {imagePreview ? (
                  <div className="relative group">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="mr-2"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Change
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview("");
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-full flex flex-col items-center justify-center text-gray-500 hover:text-gray-700"
                  >
                    <ImageIcon className="w-12 h-12 mb-2" />
                    <p className="text-sm font-medium">Click to upload image</p>
                    <p className="text-xs text-gray-500">Max size: 5MB</p>
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Product Details Section */}
          <div className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name" className="text-base font-semibold">
                  Product Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <Label htmlFor="price" className="text-base font-semibold">
                  Price (VND)
                </Label>
                <Input
                  id="price"
                  type="text"
                  value={formData.price?.toLocaleString("vi-VN") ?? 0}
                  onChange={(e) => {
                    //convert string to number
                    const input = e.target.value;
                    const numericValue = parseFloat(input.replace(/[.]/g, ""));
                    console.log(numericValue, "numericValue");
                    setFormData({ ...formData, price: numericValue });
                  }}
                  className="mt-1"
                  placeholder="Enter price"
                />
              </div>

              <div>
                <Label htmlFor="quantity" className="text-base font-semibold">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: Number(e.target.value),
                    })
                  }
                  className="mt-1"
                  placeholder="Enter quantity"
                />
              </div>

              {storeType === "2" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="duration"
                      className="text-base font-semibold"
                    >
                      Duration
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      min="0"
                      value={formData.duration ?? 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          duration: Number(e.target.value),
                        })
                      }
                      className="mt-1"
                      placeholder="Enter duration"
                    />
                  </div>

                  <div>
                    <Label htmlFor="unit" className="text-base font-semibold">
                      Time Unit
                    </Label>
                    <Select
                      value={formData.unit || ""}
                      onValueChange={(value) =>
                        setFormData({ ...formData, unit: value })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hour">Hour</SelectItem>
                        <SelectItem value="Minute">Minute</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="px-8">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductUpdateDialog;
