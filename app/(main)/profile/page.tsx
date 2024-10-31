"use client";
import React, { useEffect, useState } from "react";
import { UserServices } from "@/components/services/User/userServices";
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
import { Users, ApiResponse } from "@/types/user";
import { UserAccountPost } from "@/types/userAccount";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

const UserProfileComponent: React.FC = () => {
  const [user, setUser] = useState<Users | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const [formData, setFormData] = useState<UserAccountPost>({
    fullName: "",
    address: "",
    description: "",
    phoneNumber: "",
    birthday: "",
    gender: 0,
    cccdPassport: "",
    imageUrl: null,
  });

  useEffect(() => {
    fetchUserData();
  }, []);

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
      console.log("API Response:", response);

      if (response.data) {
        const userData = response.data.data.user;
        console.log("User Data:", userData);

        setUser(userData);
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

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      try {
        // Implement your image upload logic here
        // const uploadedUrl = await UserServices.uploadImage(file);
        // setFormData(prev => ({ ...prev, imageUrl: uploadedUrl }));
      } catch (error) {
        handleError(error);
      }
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, imageUrl: null }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setUpdating(true);
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("User ID not found");

      await UserServices.updateUserById(userId, formData);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setEditMode(false);
      await fetchUserData();
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
      setImagePreview(user.imageUrl);
    }
    setEditMode(false);
    setValidationErrors({});
  };

  const isApiError = (
    error: unknown
  ): error is { response?: { status: number } } => {
    return typeof error === "object" && error !== null && "response" in error;
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
          <span>User Profile</span>
          {!editMode && (
            <Button onClick={() => setEditMode(true)}>Edit Profile</Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image */}
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
                    className="p-2 bg-primary hover:bg-primary/90 text-white rounded-full cursor-pointer transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      id="imageUpload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="p-2 bg-destructive hover:bg-destructive/90 text-white rounded-full transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
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

            {/* Phone Number */}
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
                value={formData.birthday}
                onChange={handleInputChange}
                disabled={!editMode}
                max={format(new Date(), "yyyy-MM-dd")}
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender.toString()}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, gender: parseInt(value) }))
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

            {/* CCCD/Passport */}
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

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!editMode}
              />
            </div>
          </div>

          {/* Description */}
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

          {/* Action Buttons */}
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
