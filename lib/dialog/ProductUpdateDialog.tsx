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
import { Edit, ImageIcon, Upload, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { Product as StoreProduct } from "@/types/store/store";
import { ProductPatch } from "@/types/product";
import {
  editProductStoreServiceFormSchema,
  EditProductStoreServiceValues,
} from "@/lib/validation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AxiosError } from "axios";
import { useToast } from "@/components/ui/use-toast";

interface ProductErrors {
  name?: string;
  price?: string;
  quantity?: string;
  categoryId?: string;
  image?: string;
  duration?: string;
  unit?: string;
}

interface Product {
  id?: string;
  name: string;
  price: string;
  quantity: number;
  categoryId: string;
  image: File | null;
  imagePreview: string | ArrayBuffer | null;
  isNew?: boolean;
  isSaving?: boolean;
  status?: string;
  dateFilter?: number;
  duration?: number | null;
  unit?: "Hour" | "Minute" | null;
}

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
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [storeType, setStoreType] = useState<number>(0);
  const [productErrors, setProductErrors] = useState<ProductErrors[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditProductStoreServiceValues>({
    resolver: zodResolver(editProductStoreServiceFormSchema),
    defaultValues: {
      name: "",
      price: 0,
      duration: 0,
      unit: "",
      imageUrl: "",
      quantity: 1,
    },
  });

  useEffect(() => {
    const type = localStorage.getItem("storeType");
    const numType = parseInt(type || "");
    setStoreType(numType);
  }, []);

  useEffect(() => {
    if (product) {
      // setFormData({
      //   name: product.name,
      //   price: product.price,
      //   duration: product.duration,
      //   unit: product.unit,
      //   imageUrl: product.imageUrl || "",
      //   quantity: product.quantity || 0,
      // });
      form.reset({
        name: product.name,
        price: product.price,
        duration: product.duration || 0,
        unit: product.unit || "",
        imageUrl: product.imageUrl || "",
        quantity: product.quantity || 1,
      });
      setImagePreview(product.imageUrl || "");
    }
  }, [product]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        // toast.error("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // toast.error("Image size must be less than 5MB");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const validateFormFields = (data: ProductPatch): boolean => {
    const errors: string[] = [];

    // Iterate over each field and validate
    Object.entries(data).forEach(([key, value]) => {
      switch (key) {
        case "name":
          if (typeof value !== "string" || value.trim() === "") {
            errors.push("Name is required and must be a string.");
          }
          break;
        case "price":
          if (typeof value !== "number" || value <= 0 || value > 10000000) {
            errors.push(
              "Price must be a positive number and smaller than 10 millions VND."
            );
          }
          break;
        case "imageUrl":
          if (value !== null && typeof value !== "string") {
            errors.push("Image URL must be a string or null.");
          }
          break;
        case "quantity":
          if (typeof value !== "number" || value < 0 || value > 1000) {
            errors.push(
              "Quantity must be a non-negative number and smaller than 1000 items."
            );
          }
          break;
        case "unit":
          if (typeof value !== "string") {
            errors.push("Unit must be a string.");
          }
          break;
        case "duration":
          if (typeof value !== "number" || value < 0) {
            errors.push("Quantity must be a non-negative number.");
          }
          break;
        default:
          errors.push(`Unexpected field: ${key}`);
      }
    });

    // Log or display errors
    if (errors.length > 0) {
      console.error("Validation Errors:", errors);
      errors.forEach((error) =>
        toast({
          title: `Field Error!`,
          description: error,
          variant: "destructive",
        })
      ); // Optional: Use toast to display errors
      return false;
    }

    return true; // Return true if no errors
  };

  const handleNone = async () => {
    // Trigger validation from react-hook-form
    const data: ProductPatch = form.getValues();

    // Validate form fields
    const isValid = validateFormFields(data);
    if (!isValid) {
      return; // Stop execution if validation fails
    }

    try {
      setIsSubmitting(true);
      // Call your API with the validated data and imagePreview
      await onUpdate({
        ...data,
        imageUrl: imagePreview,
      });
      onClose();
      // toast.success("Product updated successfully");
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.status === 413) {
          // toast.error("Image URL too large");
        } else {
          // toast.error(
          //   error.response?.data.messageResponse ||
          //     error.response?.data.Error ||
          //     "Failed to update product! Some fields happened errors!"
          // );
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (data: ProductPatch) => {
    console.log(data, "dataProduct");
    try {
      setIsSubmitting(true);
      await onUpdate({
        ...data,
        imageUrl: imagePreview,
      });
      onClose();
      // toast.success("Product updated successfully");
    } catch (error) {
      if (error instanceof AxiosError) {
        // error.status === 413 && toast.error("Image URL too large");
        // toast.error(
        //   error.response?.data.messageResponse ||
        //     error.response?.data.Error ||
        //     "Failed to update product! Some fields happened errors!"
        // );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add max duration constants
  const MAX_HOURS = 24;
  const MAX_MINUTES = 1440;

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Update Product Details
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid gap-2 py-4">
              {/* Image Upload Section */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Product Image</Label>
                <div className="flex justify-center">
                  <div className="relative w-auto h-auto max-w-sm max-h-svh border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-gray-400 transition-colors">
                    {imagePreview ? (
                      <div className="relative group">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg"
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
                        <p className="text-sm font-medium">
                          Click to upload image
                        </p>
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
                <div className="grid gap-4 px-4 py-8">
                  <div>
                    {/* <Label htmlFor="name" className="text-base font-semibold">
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
                    /> */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                            Product Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                              placeholder="Enter Product Name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    {/* <Label htmlFor="price" className="text-base font-semibold">
                      Price (VND)
                    </Label>
                    <Input
                      id="price"
                      type="text"
                      value={formData.price?.toLocaleString("vi-VN") ?? 0}
                      onChange={(e) => {
                        //convert string to number
                        const input = e.target.value;
                        const numericValue = parseFloat(
                          input.replace(/[.]/g, "")
                        );
                        console.log(numericValue, "numericValue");
                        setFormData({ ...formData, price: numericValue });
                      }}
                      className="mt-1"
                      placeholder="Enter price"
                    /> */}
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price(VND)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="text"
                                placeholder="Enter Price"
                                value={
                                  field.value?.toLocaleString("vi-VN") ?? 0
                                }
                                onChange={(e) => {
                                  //convert string to number
                                  const input = e.target.value;
                                  const numericValue = parseFloat(
                                    input.replace(/[.]/g, "")
                                  );
                                  field.onChange(numericValue || 0);
                                }}
                              />
                              <span className="absolute inset-y-0 right-2 flex items-center text-gray-400 pointer-events-none">
                                VND
                              </span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    {/* <Label
                        htmlFor="quantity"
                        className="text-base font-semibold"
                      >
                        Quantity
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            quantity: Number(e.target.value),
                          })
                        }
                        className="mt-1"
                        placeholder="Enter quantity"
                      /> */}

                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                            Quantity
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                              placeholder="Enter Quantity"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(e.target.valueAsNumber)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {storeType === 2 && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        {/* <Label
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
                        /> */}
                        <FormField
                          control={form.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                                Duration
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                                  placeholder="Enter Duration"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div>
                        {/* <Label
                          htmlFor="unit"
                          className="text-base font-semibold"
                        >
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
                        </Select> */}

                        <FormField
                          control={form.control}
                          name="unit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                                Unit
                              </FormLabel>
                              <FormControl>
                                <Select
                                  value={field.value || ""}
                                  onValueChange={(value) =>
                                    // setFormData({ ...formData, unit: value })
                                    field.onChange(value)
                                  }
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select unit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Hour">Hour</SelectItem>
                                    <SelectItem value="Minute">
                                      Minute
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
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
              {storeType === 1 ? (
                // Validate được không update được
                // <Button
                //   type="submit"
                //   className="px-5 bg-blue-500 hover:bg-blue-700"
                //   disabled={isSubmitting}
                // >
                //   {isSubmitting ? (
                //     "Updating..."
                //   ) : (
                //     <>
                //       <Edit /> <p>Update</p>
                //     </>
                //   )}
                // </Button>

                // Update được nhưng không validate được
                <Button
                  onClick={() => handleNone()}
                  className="px-5 bg-blue-500 hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Updating..."
                  ) : (
                    <>
                      <Edit /> <p>Update</p>
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="px-5 bg-blue-500 hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Updating..."
                  ) : (
                    <>
                      <Edit /> <p>Update</p>
                    </>
                  )}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductUpdateDialog;
