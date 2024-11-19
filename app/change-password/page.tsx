"use client";
import React, { useState, useEffect } from "react";
import { AuthServices } from "@/components/services/authServices";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff } from "lucide-react";
import VegaLogo from "@/img/logo.png";

const ChangePasswordForm = () => {
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  //Email Focus State
  const [isFocused, setIsFocused] = useState(false);
  const [focusedFields, setFocusedFields] = React.useState<
    Record<string, boolean>
  >({});

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    const fieldName = event.target.name;
    setFocusedFields((prev) => ({ ...prev, [fieldName]: true }));
    console.log(fieldName, "focus");
  };
  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const fieldName = event.target.name;
    setFocusedFields((prev) => ({ ...prev, [fieldName]: false }));
    console.log(fieldName, "blur");
  };

  console.log(focusedFields, "focusField");

  const { toast } = useToast();

  const validateEmail = (email: string) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!email || !oldPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New password and confirm password do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "New password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      await AuthServices.changePassword({
        email,
        oldPassword,
        newPassword,
      });

      toast({
        title: "Success",
        description: "Change Passwork Successfully",
      });

      // Clear form
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Change Password Failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-lg mx-auto p-6 bg-transparent dark:bg-black/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-sky-400 text-center uppercase dark:text-white">
          <img width={70} height={70} src={VegaLogo.src} alt="VegaLogo" />
          Change Password
        </CardTitle>
        <CardDescription className="text-center text-sky-500 text-sm">
          Please enter your email and password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="h-14 pt-4 pb-2 px-4 w-full rounded-md border border-slate-200 bg-white peer placeholder-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <label
                htmlFor="email"
                className={`absolute left-4 transition-all duration-200 pointer-events-none
          ${
            isFocused || email
              ? "text-xs text-blue-500 top-2"
              : "text-base text-slate-500 top-4"
          }`}
              >
                Email
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Input
                id="oldPassword"
                name="oldPassword"
                type="oldPassword"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="h-14 pt-4 pb-2 px-4 w-full rounded-md border border-slate-200 bg-white peer placeholder-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <label
                htmlFor="oldPassword"
                className={`absolute left-4 transition-all duration-200 pointer-events-none
          ${
            isFocused || oldPassword
              ? "text-xs text-blue-500 top-2"
              : "text-base text-slate-500 top-4"
          }`}
              >
                Old Password
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                type="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="h-14 pt-4 pb-2 px-4 w-full rounded-md border border-slate-200 bg-white peer placeholder-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <label
                htmlFor="newPassword"
                className={`absolute left-4 transition-all duration-200 pointer-events-none
          ${
            isFocused || newPassword
              ? "text-xs text-blue-500 top-2"
              : "text-base text-slate-500 top-4"
          }`}
              >
                New Password
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="h-14 pt-4 pb-2 px-4 w-full rounded-md border border-slate-200 bg-white peer placeholder-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <label
                htmlFor="confirmPassword"
                className={`absolute left-4 transition-all duration-200 pointer-events-none
          ${
            isFocused || confirmPassword
              ? "text-xs text-blue-500 top-2"
              : "text-base text-slate-500 top-4"
          }`}
              >
                Confirm Password
              </label>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full text-base bg-sky-500 hover:bg-sky-600"
            disabled={loading}
          >
            {loading ? "Processing..." : "Change Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChangePasswordForm;
