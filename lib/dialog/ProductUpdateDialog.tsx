import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { ImageIcon, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Product as StoreProduct } from "@/types/store/store";
import { Product as ProductType, ProductPatch } from "@/types/product";

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
  // Initialize formData with empty values
  const [formData, setFormData] = useState<ProductPatch>({
    name: "",
    price: 0,

    imageUrl: "",
    quantity: 1,
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update formData when product prop changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price,

        imageUrl: product.imageUrl || "",
        quantity: product.quantity || 0,
      });
      setImagePreview(product.imageUrl || "");
    }
  }, [product]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    try {
      await onUpdate({
        ...formData,
        imageUrl: imagePreview,
      });
      onClose();
      // Reset form after successful update
      setFormData({
        name: "",
        price: 0,

        imageUrl: "",
        quantity: 0,
      });
      setSelectedImage(null);
      setImagePreview("");
    } catch (error) {
      toast.error("Failed to update product");
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Edit the details of the product.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Image Upload Section */}
          <div className="flex flex-col items-center space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            <div className="relative w-48 h-48 bg-gray-100 rounded-lg overflow-hidden">
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <ImageIcon size={48} />
                  <p className="mt-2">No image selected</p>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Image
            </Button>
          </div>

          {/* Product Name */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-left">
              Product Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="col-span-3"
            />
          </div>

          {/* Price */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-left">
              Price
            </Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: Number(e.target.value) })
              }
              className="col-span-3"
            />
          </div>

          {/* Status */}
        </div>

        {/* Quantity */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="quantity" className="text-left">
            Số lượng
          </Label>
          <Input
            id="quantity"
            type="number"
            min="0"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: Number(e.target.value) })
            }
            className="col-span-3"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductUpdateDialog;
