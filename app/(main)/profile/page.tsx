"use client";
import React, { useEffect, useState } from "react";
import { UserServices } from "@/components/services/User/userServices";
import { StoreServices } from "@/components/services/Store/storeServices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { toast } from "@/components/ui/use-toast";
import { Loader2, Camera, X } from "lucide-react";
import { Users, ApiResponse } from "@/types/user/user";
import { UserAccountPatch } from "@/types/user/userAccount";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { StoreOwnerPatch, storeTypes } from "@/types/store/storeOwner";
const UserProfileComponent: React.FC = () => {
  const [user, setUser] = useState<Users | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeData, setStoreData] = useState<StoreOwnerPatch | null>(null);
  const [formData, setFormData] = useState<UserAccountPatch>({
    fullName: "",
    address: "",
    description: "",
    phoneNumber: "",
    birthday: "",
    gender: 0,
    cccdPassport: "",
    imageUrl: null,
  });

  const [storeFormData, setStoreFormData] = useState<StoreOwnerPatch>({
    name: "",
    address: "",
    phoneNumber: "",
    shortName: "",
    email: "",
    description: "",
    status: 0,
    storeType: 0,
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchStoreData = async (storeId: string) => {
    try {
      const storeId = localStorage.getItem("storeId");
      const response = await StoreServices.getStoreById(storeId as string);
      const store: StoreOwnerPatch = response.data.data.store;

      setStoreData(store);
      setStoreFormData({
        name: store.name || "",
        address: store.address || "",
        phoneNumber: store.phoneNumber || "",
        shortName: store.shortName || "",
        email: store.email || "",
        description: store.description || "",
        status: store.status,
        storeType: store.storeType,
      });
    } catch (error) {
      handleError(error);
    }
  };

  const validateStoreForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!storeFormData.name?.trim()) {
      errors.storeName = "Store name is required";
    }

    if (!storeFormData.email?.trim()) {
      errors.storeEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(storeFormData.email)) {
      errors.storeEmail = "Invalid email format";
    }

    if (storeFormData.phoneNumber) {
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(storeFormData.phoneNumber)) {
        errors.storePhone = "Invalid phone number format";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleStoreInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setStoreFormData((prev: any) => ({ ...prev, [name]: value }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.fullName?.trim()) {
      errors.fullName = "Full name is required";
    }

    if (formData.phoneNumber) {
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(formData.phoneNumber)) {
        errors.phoneNumber = "Invalid phone number format";
      }
    }

    if (formData.cccdPassport) {
      const cccdRegex = /^[A-Z0-9]{9,12}$/;
      if (!cccdRegex.test(formData.cccdPassport.toUpperCase())) {
        errors.cccdPassport = "Invalid CCCD/Passport format";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const fetchUserData = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("User ID not found. Please login again.");
      }

      const response = await UserServices.getUserById(userId);
      console.log("API Response:", response.data.data);

      if (response.data) {
        const userData = response.data.data;
        console.log("User Data:", userData);
        console.log("role", userData.role.name);

        setUser(userData);
        if (userData.role?.name === "Store") {
          await fetchStoreData(userId);
        }
        setFormData({
          fullName: userData.fullName || "",
          address: userData.address || "",
          description: userData.description || "",
          phoneNumber: userData.phoneNumber || "",
          birthday: userData.birthday ? userData.birthday.split("T")[0] : "", // Xử lý định dạng ngày
          gender: userData.gender || 0,
          cccdPassport: userData.cccdPassport || "",
          imageUrl: userData.imageUrl || null,
        });
        setImagePreview(userData.imageUrl);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      // Preview image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      try {
        setUploading(true);

        // Tạo unique filename với timestamp
        const fileName = `${Date.now()}-${file.name}`;
        const storageRef = ref(storage, `profile-images/${fileName}`);

        // Upload file
        await uploadBytes(storageRef, file);

        // Lấy download URL
        const downloadURL = await getDownloadURL(storageRef);

        // Cập nhật formData
        setFormData((prev) => ({
          ...prev,
          imageUrl: downloadURL,
        }));

        toast({
          title: "Success",
          description: "Image uploaded successfully",
        });
      } catch (error) {
        console.error("Error uploading image:", error);
        handleError(error);
        setImagePreview(null);
      } finally {
        setUploading(false);
      }
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, imageUrl: null }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate based on role
    if (user?.role?.name === "Store") {
      if (!validateStoreForm()) return;
    } else {
      if (!validateForm()) return;
    }

    setUpdating(true);
    try {
      const userId = localStorage.getItem("userId");
      const storeId = localStorage.getItem("storeId");

      if (!userId) throw new Error("User ID not found");

      if (user?.role?.name === "Store" && storeId) {
        // Update store profile
        await StoreServices.editStoreProfile(storeId, storeFormData);
        await fetchStoreData(storeId);
        toast({
          title: "Success",
          description: "Store profile updated successfully",
        });
      } else {
        // Update user profile
        await UserServices.updateUserById(userId, formData);
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      }
      setEditMode(false);
      // window.location.reload();
    } catch (error) {
      handleError(error);
    } finally {
      setUpdating(false);
    }
  };
  const handleError = (error: unknown) => {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  };

  const resetForm = () => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        address: user.address || "",
        description: user.description || "",
        phoneNumber: user.phoneNumber || "",
        birthday: user.birthday
          ? format(new Date(user.birthday), "yyyy-MM-dd")
          : "",
        gender: user.gender || 0,
        cccdPassport: user.cccdPassport || "",
        imageUrl: user.imageUrl || null,
      });
      setImagePreview(user.imageUrl || "");
    }
    setEditMode(false);
    setValidationErrors({});
  };

  const isApiError = (
    error: unknown
  ): error is { response?: { storeStatus: number } } => {
    return typeof error === "object" && error !== null && "response" in error;
  };
  const renderStoreFields = () => {
    if (user?.role?.name !== "Store") return null;

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Store Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">
              Store Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={storeFormData.name}
              onChange={handleStoreInputChange}
              disabled={!editMode}
              className={validationErrors.storeName ? "border-destructive" : ""}
            />
            {validationErrors.storeName && (
              <p className="text-sm text-destructive">
                {validationErrors.storeName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortName">Store Short Name</Label>
            <Input
              id="shortName"
              name="shortName"
              value={storeFormData.shortName || ""}
              onChange={handleStoreInputChange}
              disabled={!editMode}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="storeEmail">
              Store Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={storeFormData.email}
              onChange={handleStoreInputChange}
              disabled={!editMode}
              className={
                validationErrors.storeEmail ? "border-destructive" : ""
              }
            />
            {validationErrors.storeEmail && (
              <p className="text-sm text-destructive">
                {validationErrors.storeEmail}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="storePhone">Store Phone Number</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={storeFormData.phoneNumber}
              onChange={handleStoreInputChange}
              disabled={!editMode}
              className={
                validationErrors.storePhone ? "border-destructive" : ""
              }
            />
            {validationErrors.storePhone && (
              <p className="text-sm text-destructive">
                {validationErrors.storePhone}
              </p>
            )}
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="storeAddress">Store Address</Label>
            <Input
              id="address"
              name="address"
              value={storeFormData.address}
              onChange={handleStoreInputChange}
              disabled={!editMode}
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="storeStatus">Store Status</Label>
            <Select
              value={storeFormData.status?.toString() || "0"}
              onValueChange={(value) =>
                setStoreFormData((prev) => ({
                  ...prev,
                  storeStatus: parseInt(value),
                }))
              }
              disabled={!editMode}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select store status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Opened</SelectItem>
                <SelectItem value="1">Closed</SelectItem>
                <SelectItem value="2">In Active</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="storeStatus">Store Type</Label>
            <Select
              value={storeFormData.storeType?.toString() || "0"}
              onValueChange={(value) =>
                setStoreFormData((prev) => ({
                  ...prev,
                  storeStatus: parseInt(value),
                }))
              }
              disabled={!editMode}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select store status" />
              </SelectTrigger>
              <SelectContent>
                {storeTypes.map((storeType) => (
                  <SelectItem
                    key={storeType.value}
                    value={storeType.value.toString()}
                  >
                    {storeType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="storeDescription">Store Description</Label>
            <Textarea
              id="description"
              name="description"
              value={storeFormData.description || ""}
              onChange={handleStoreInputChange}
              disabled={!editMode}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            {user?.role?.name === "Store" ? "Store Profile" : "User Profile"}
          </span>
          {!editMode && (
            <Button onClick={() => setEditMode(true)}>Edit Profile</Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200">
                <img
                  src={imagePreview || "/api/placeholder/150/150"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>

              {editMode && (
                <div className="absolute -bottom-2 right-0 flex gap-2">
                  <label
                    htmlFor="imageUpload"
                    className={`p-2 bg-primary hover:bg-primary/90 text-white rounded-full cursor-pointer transition-colors ${
                      uploading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                    <input
                      type="file"
                      id="imageUpload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="p-2 bg-destructive hover:bg-destructive/90 text-white rounded-full transition-colors"
                      disabled={uploading}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {user?.role?.name === "Store" ? (
            // For Store role, show only store fields
            renderStoreFields()
          ) : (
            // For other roles, show only personal information
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className={
                      validationErrors.fullName ? "border-destructive" : ""
                    }
                  />
                  {validationErrors.fullName && (
                    <p className="text-sm text-destructive">
                      {validationErrors.fullName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className={
                      validationErrors.phoneNumber ? "border-destructive" : ""
                    }
                  />
                  {validationErrors.phoneNumber && (
                    <p className="text-sm text-destructive">
                      {validationErrors.phoneNumber}
                    </p>
                  )}
                </div>

                {/* Birthday */}
                <div className="space-y-2">
                  <Label htmlFor="birthday">Birthday</Label>
                  <Input
                    id="birthday"
                    name="birthday"
                    type="date"
                    value={formData.birthday ?? ""}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    max={format(new Date(), "yyyy-MM-dd")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender.toString()}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        gender: parseInt(value),
                      }))
                    }
                    disabled={!editMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Not Specified</SelectItem>
                      <SelectItem value="1">Male</SelectItem>
                      <SelectItem value="2">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cccdPassport">CCCD/Passport</Label>
                  <Input
                    id="cccdPassport"
                    name="cccdPassport"
                    value={formData.cccdPassport}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className={
                      validationErrors.cccdPassport ? "border-destructive" : ""
                    }
                  />
                  {validationErrors.cccdPassport && (
                    <p className="text-sm text-destructive">
                      {validationErrors.cccdPassport}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>
          )}

          {editMode && (
            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={updating}>
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default UserProfileComponent;
