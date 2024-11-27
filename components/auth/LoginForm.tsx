"use client";

import * as z from "zod";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "../ui/use-toast";
import { AxiosError } from "axios";
import { AuthServices } from "@/components/services/authServices";
import { useAuthUser } from "@/components/hooks/useAuthUser";
import { loginFormSchema, loginFormValues } from "@/lib/validation";
import Image from "next/image";
import VegaLogo from "@/img/logo.png";
import VegaImage from "@/img/banner-vega-city-nha-trang.jpg";
import { Eye, EyeOff, LogIn } from "lucide-react";
import Link from "next/link";
import { Loader } from "@/components/loader/Loader";

interface UserRefreshToken {
  email: string;
  refreshToken: string;
}

interface UserLogin {
  email: string;
  password: string;
}

const LoginForm: any = () => {
  const [emailLogin, setEmailLogin] = useState<string>("");
  const user = useAuthUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const router = useRouter();

  const form = useForm<loginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  //Form Focus State
  const [focusedFields, setFocusedFields] = useState<Record<string, boolean>>(
    {}
  );

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    const fieldName = event.target.name;
    setFocusedFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const fieldName = event.target.name;
    setFocusedFields((prev) => ({ ...prev, [fieldName]: false }));
  };

  //Show password button
  const [showPassword, setShowPassword] = useState(false);

  // Function to calculate expiration time (20 hours from now)
  const calculateExpirationTime = () => {
    const now = new Date().getTime();
    return now + 20 * 60 * 60 * 1000; // 20 hours in milliseconds
  };

  // Function to handle token refresh
  const refreshToken = async (userData: UserRefreshToken) => {
    try {
      const res = await AuthServices.fetchUser(
        userData.email,
        userData.refreshToken
      );
      console.log(res, "response refreshToken");
      console.log("RefreshToken sucessful!");

      // toast({
      //   title: "Token Refreshed!",
      //   description: "Tokens have been refreshed!",
      // });
      return "Token Refreshed";
    } catch (error) {
      console.error("Failed to refresh token:", error);
      toast({
        variant: "destructive",
        title: "Token Refresh Failed!",
        description: "Please log in again!",
      });
      router.push("/auth");
    }
  };

  // Login function
  const loginUser = async (data: UserLogin) => {
    setIsLogin(true);
    try {
      const res = await AuthServices.loginUser(data);
      console.log(res.data, "login res");

      // Store tokens and set expiration time
      const newRefreshToken = res.data.data.tokens.refreshToken;
      const accessToken = res.data.data.tokens.accessToken;
      const userId = res.data.data.userId;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("userId", userId);
      localStorage.setItem("userEmail", data.email);
      localStorage.setItem(
        "refreshTokenExp",
        calculateExpirationTime().toString()
      );

      // Update refreshTokenArray in localStorage
      let refreshTokenArray: UserRefreshToken[] = JSON.parse(
        localStorage.getItem("refreshTokenArray") || "[]"
      );

      // Check if the email already exists in the array
      const existingIndex = refreshTokenArray.findIndex(
        (item: UserRefreshToken) => item.email === data.email
      );

      if (existingIndex !== -1) {
        // Update existing entry
        refreshTokenArray[existingIndex].refreshToken = newRefreshToken;
      } else {
        // Add new entry
        refreshTokenArray.push({
          email: data.email,
          refreshToken: newRefreshToken,
        });
      }

      // Save updated array back to localStorage
      localStorage.setItem(
        "refreshTokenArray",
        JSON.stringify(refreshTokenArray)
      );

      // Show success toast
      toast({
        // variant: "success",
        title: "✅ Login Successful",
        description: "Welcome back!",
      });

      // Redirect to home page
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response && error.response.status === 401) {
          // Server responded with a status other than 2xx
          try {
            const res = await AuthServices.fetchUserByEmail(data.email);
            console.log(res.data, "Fetch User By Email res");

            // Store tokens and userEmail
            const newRefreshToken = res.data.data.refreshToken;
            const userEmail = res.data.data.userEmail;

            localStorage.setItem("refreshToken", newRefreshToken);
            localStorage.setItem("userEmail", userEmail);
            localStorage.setItem(
              "refreshTokenExp",
              calculateExpirationTime().toString()
            );

            // Update refreshTokenArray in localStorage
            let refreshTokenArray: UserRefreshToken[] = JSON.parse(
              localStorage.getItem("refreshTokenArray") || "[]"
            );

            // Check if the email already exists in the array
            const existingIndex = refreshTokenArray.findIndex(
              (item: UserRefreshToken) => item.email === data.email
            );

            if (existingIndex !== -1) {
              // Update existing entry
              refreshTokenArray[existingIndex].refreshToken = newRefreshToken;
            } else {
              // Add new entry
              refreshTokenArray.push({
                email: data.email,
                refreshToken: newRefreshToken,
              });
            }

            // Save updated array back to localStorage
            localStorage.setItem(
              "refreshTokenArray",
              JSON.stringify(refreshTokenArray)
            );

            if (userEmail) {
              try {
                const res = await AuthServices.loginUser(data);
                // console.log(
                //   res.data,
                //   "login after fetch user refreshToken by email res"
                // );

                // Store tokens and set expiration time
                const newRefreshToken = res.data.data.tokens.refreshToken;
                const accessToken = res.data.data.tokens.accessToken;
                const userId = res.data.data.userId;

                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("userId", userId);
                localStorage.setItem("userEmail", data.email);
                localStorage.setItem(
                  "refreshTokenExp",
                  calculateExpirationTime().toString()
                );

                // Update refreshTokenArray in localStorage
                let refreshTokenArray: UserRefreshToken[] = JSON.parse(
                  localStorage.getItem("refreshTokenArray") || "[]"
                );

                // Check if the email already exists in the array
                const existingIndex = refreshTokenArray.findIndex(
                  (item: UserRefreshToken) => item.email === data.email
                );

                if (existingIndex !== -1) {
                  // Update existing entry
                  refreshTokenArray[existingIndex].refreshToken =
                    newRefreshToken;
                } else {
                  // Add new entry
                  refreshTokenArray.push({
                    email: data.email,
                    refreshToken: newRefreshToken,
                  });
                }

                // Save updated array back to localStorage
                localStorage.setItem(
                  "refreshTokenArray",
                  JSON.stringify(refreshTokenArray)
                );

                // Show success toast
                toast({
                  title: "✅ Login Successful",
                  description: "Hi! Long time no see ha!",
                });

                // Redirect to home page
                setTimeout(() => {
                  router.push("/");
                }, 1000);
                return;
              } catch {
                console.log("Token expired");
                await refreshToken({
                  email: data.email,
                  refreshToken: newRefreshToken,
                });
                // Show status login again in order to get refreshToken
                toast({
                  variant: "destructive",
                  title: "Login Again!",
                  description: "Error is busy, login again!",
                });
                const res = await AuthServices.loginUser(data);
                console.log(res.data, "login res");

                // Store tokens and set expiration time
                const newFetchRefreshToken = res.data.data.tokens.refreshToken;
                const accessToken = res.data.data.tokens.accessToken;
                const userId = res.data.data.userId;

                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("userId", userId);
                localStorage.setItem("userEmail", data.email);
                localStorage.setItem(
                  "refreshTokenExp",
                  calculateExpirationTime().toString()
                );

                // Update refreshTokenArray in localStorage
                let refreshTokenArray: UserRefreshToken[] = JSON.parse(
                  localStorage.getItem("refreshTokenArray") || "[]"
                );

                // Check if the email already exists in the array
                const existingIndex = refreshTokenArray.findIndex(
                  (item: UserRefreshToken) => item.email === data.email
                );

                if (existingIndex !== -1) {
                  // Update existing entry
                  refreshTokenArray[existingIndex].refreshToken =
                    newFetchRefreshToken;
                } else {
                  // Add new entry
                  refreshTokenArray.push({
                    email: data.email,
                    refreshToken: newFetchRefreshToken,
                  });
                }

                // Save updated array back to localStorage
                localStorage.setItem(
                  "refreshTokenArray",
                  JSON.stringify(refreshTokenArray)
                );

                // Show success toast
                toast({
                  variant: "success",
                  title: "Login Successful",
                  description: "Hi! Long time no see ha!",
                });

                // Redirect to home page
                setTimeout(() => {
                  router.push("/");
                }, 1000);
              }
            }
            return;
          } catch {
            console.log("wait2"); //does not handle anything
            // Show success toast
            toast({
              variant: "destructive",
              title: "Login Again!",
              description: "Server is busy now, try again!",
            });
          }
        } else if (error.response && error.response.status === 400) {
          // Request was made but no response was received
          toast({
            variant: "destructive",
            title: "Login Failed!",
            description: "Invalid email or password!",
          });
          setIsLogin(false);
        } else {
          // Something went wrong
          toast({
            variant: "destructive",
            title: "Login Failed!",
            description: "Something went wrong in the server!",
          });
          setIsLogin(false);
        }
      }
    }
  };

  // Automatically refresh token if expiration time is near
  const checkTokenExpiration = () => {
    const refreshTokenExp = localStorage.getItem("refreshTokenExp");
    const checkNewRefreshToken = localStorage.getItem("refreshToken");
    const email = localStorage.getItem("userEmail");

    if (refreshTokenExp && email && checkNewRefreshToken) {
      const expTime = parseInt(refreshTokenExp);
      const currentTime = new Date().getTime();

      // If less than 1 hour remains, refresh the token
      if (currentTime > expTime - 60 * 60 * 1000) {
        refreshToken({ email: email, refreshToken: checkNewRefreshToken });
      }
    }
  };

  // Automatically refresh token if expiration time is near
  const checkSessionExpired = () => {
    if (!user) {
      // If user is not logged in, redirect to login page
      router.push("/auth");
      toast({
        title: "Session expired",
        description: "Please login again!",
      });
    }
  };

  useEffect(() => {
    // Check token expiration every 10 minutes
    const runBothFunctions = () => {
      checkSessionExpired();
      checkTokenExpiration();
    };

    const interval = setInterval(runBothFunctions, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (data: z.infer<typeof loginFormSchema>) => {
    console.log("a");
    console.log(data, "login account");
    if (!isLoading) {
      toast({
        title: "Loading",
        description: "Please wait while we log you in...",
        duration: 3000,
      });
      setIsLoading(true);
    }
    try {
      console.log("b");
      loginUser(data);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log("c");
        if (error.response?.status === 400) {
          toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Wrong password!",
          });
        }
        if (error.response?.status === 401) {
          console.log("d");
          //lấy token gần nhất
          console.log("Session Expired!");
          const userEmailForm: string = data.email;

          const userRefreshTokenArray = JSON.parse(
            localStorage.getItem("refreshTokenArray") || ""
          );

          if (userEmailForm) {
            const findUserByEmail: UserRefreshToken =
              userRefreshTokenArray.find(
                (userEmail: UserRefreshToken) =>
                  userEmailForm === userEmail.email
              );

            console.log(findUserByEmail, "user from local storage");
            const message = await refreshToken({
              email: findUserByEmail.email,
              refreshToken: findUserByEmail.refreshToken,
            });
            if (message) {
              console.log("e");
              loginUser(data);
            } else {
              console.log("Hệ thống lỗi thiếu Message");
            }
          } else {
            //Nếu user bị session expired, mà mảng refreshTokenArray trong localStorage rỗng, không có refreshToken trước đó, thì sử dụng api getRefreshTokenByEmail để lấy Token
            //Sau đó có email và refreshToken rồi thì cấp lại refreshToken mới trong refreshTokenArray trong localStorage và cập nhật lại login
            //Xử lý như unauthorized
            console.log("User không có refreshToken");
          }
          // const refreshFromLocal = localStorage.getItem("refreshToken");
          // const latestRefreshToken = refreshFromLocal || "";
          // const userEmail = emailLogin || "";
          // if (!userEmail) {
          //   console.log("Email does not exist!");
          // }
          // const message = await refreshToken(userEmail, latestRefreshToken);
          console.log("e");

          // if (message) {
          //   console.log("e");
          //   loginUser(data);
          // } else {
          //   console.log("Hệ thống lỗi thiếu Message");
          // }
        } else {
          console.error("Login error:", error.response?.data || error.message);
        }
      } else {
        console.error("Unexpected error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="max-w-lg mx-auto p-6 form-gradient dark:bg-black/30 backdrop-blur-sm bg-opacity-20 border-none">
        <img
          className="mt-2"
          width={110}
          height={100}
          src={VegaLogo.src}
          alt="VegaLogo"
        />
        <div className="form-content">
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-white text-center uppercase dark:text-white">
              Login
            </CardTitle>
            <CardDescription>
              <p className="text-sm text-white text-center dark:text-white">
                Welcome to Vega
              </p>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            className="h-14 pt-4 pb-1 px-4 w-full rounded-md bg-black/30 placeholder-transparent focus:border-transparent transition-all duration-200"
                          />
                          <label
                            htmlFor="email"
                            className={`absolute left-4 transition-all duration-200 pointer-events-none
                    ${
                      focusedFields.email || field.value
                        ? "text-xs text-blue-500 top-2"
                        : "text-base text-slate-500 top-4"
                    }`}
                          >
                            Email
                          </label>
                        </div>
                        {/* <Input
                      className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible: ring-offset-0"
                      placeholder="Enter Email"
                      {...field}
                    /> */}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            className="h-14 pt-4 pb-1 px-4 w-full rounded-md bg-black/30 placeholder-transparent focus:border-transparent transition-all duration-200"
                          />
                          <label
                            htmlFor="password"
                            className={`absolute left-4 transition-all duration-200 pointer-events-none
                    ${
                      focusedFields.password || field.value
                        ? "text-xs text-blue-500 top-2"
                        : "text-base text-slate-500 top-4"
                    }`}
                          >
                            Password
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-500" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <p className="text-sm text-white text-end dark:text-white mb-2">
                  <Link
                    className="hover:text-blue-500 hover:underline transition-colors duration-200"
                    href={"https://vega-city-landing-page.vercel.app/register"}
                    target="_blank"
                  >
                    Don't have account?
                  </Link>
                </p>
                <Button
                  type="submit"
                  className="w-full p-2 rounded hover-gradient"
                >
                  {isLogin ? (
                    <Loader
                      className="text-success-foreground text-2xl"
                      isLoading={isLogin}
                    />
                  ) : (
                    <div className="flex flex-row items-center group justify-center w-full gap-2">
                      <span className="text-white text-lg group-hover:text-blue-800 transition-transform duration-200 dark:text-white">
                        Sign In
                      </span>
                      <LogIn
                        size={20}
                        className="text-white group-hover:text-blue-800 transition-transform duration-200 group-hover:scale-120 dark:text-white"
                      />
                    </div>
                  )}
                </Button>
                <p className="text-sm text-white text-center dark:text-white">
                  <Link
                    className="hover:text-blue-500 hover:underline transition-colors duration-200"
                    href="/change-password"
                  >
                    Forget Password?
                  </Link>
                </p>
              </form>
            </Form>
          </CardContent>
        </div>
      </Card>
      <div
        className="loginImage"
        style={{ backgroundImage: `url(${VegaImage.src})` }}
      />
    </div>
  );
};

export default LoginForm;
