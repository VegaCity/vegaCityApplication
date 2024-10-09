// "use client";

// import BackButton from "@/components/BackButton";
// import * as z from "zod";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { redirect, useRouter } from "next/navigation";
// // import useSignIn from 'react-auth-kit/hooks/useSignIn';
// import { AuthServices } from "@/components/services/authServices";
// import { LoginAccount } from "@/types/loginAccount";
// import { useEffect, useState } from "react";
// import { toast } from "../ui/use-toast";
// import { AxiosError } from "axios";

// const formSchema = z.object({
//   email: z
//     .string()
//     .min(1, {
//       message: "Email is required",
//     })
//     .email({
//       message: "Please enter a valid email",
//     }),
//   password: z.string().min(1, {
//     message: "Password is required",
//   }),
// });

// const LoginForm = () => {
//   const [accessToken, setAccessToken] = useState<string>("");
//   const [isLoading, setIsLoading] = useState(false);
//   const router = useRouter();

//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       email: "",
//       password: "",
//     },
//   });

//   const handleSubmit = async (data: z.infer<typeof formSchema>) => {
//     if (!isLoading) {
//       toast({
//         title: "Loading",
//         description: "Please wait while we log you in...",
//         duration: 3000,
//       });
//       setIsLoading(true);
//     }
//     try {
//       const res = await AuthServices.loginUser(data);
//       console.log(res.data, "login res");

//       // Store tokens and user ID
//       localStorage.setItem("refreshToken", res.data.data.tokens.refreshToken);
//       localStorage.setItem("accessToken", res.data.data.tokens.accessToken);
//       localStorage.setItem("userId", res.data.data.userId);

//       // Update access token in your state or context
//       setAccessToken(res.data.data.tokens.accessToken);

//       // Show success toast
//       toast({
//         title: "Login Successful",
//         description: "Welcome back!",
//       });

//       // Redirect to home page
//       setTimeout(() => {
//         router.push("/");
//       }, 1000);
//     } catch (error) {
//       if (error instanceof AxiosError) {
//         if (error.response?.status === 401) {
//           await handleUnauthorizedError(data.email);
//         } else {
//           console.error("Login error:", error.response?.data || error.message);
//           // Handle other types of errors (e.g., network issues, server errors)
//           console.log(error.response?.status);
//           // // Show fail toast
//           // toast({
//           //   title: "Login Fail",
//           //   description: error.response?.data || error.message,
//           // });
//         }
//       } else {
//         console.error("Unexpected error:", error);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleUnauthorizedError = async (email: string) => {
//     const storedRefreshToken = localStorage.getItem("refreshToken");
//     const refreshToken =
//       storedRefreshToken ||
//       "eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3ZTk0YzM2ZC0xYjdjLTQzMjgtODczZC03MzhkYjY5MzFmZTgiLCJlbWFpbCI6ImNza2gudmVnYWNpdHkudm5AZ21haWwuY29tIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiQWRtaW4iLCJNYXJrZXRab25lSWQiOiI1ZjcyOGRlYi1iMmMzLTRiYWMtOWQ5Yy00MWExMWUwYWNjY2MiLCJuYmYiOjE3MjgzNzc5MDAsImV4cCI6MTcyODM5NDUxMCwiaXNzIjoiVmVnYUNpdHlBcHAifQ.pFlZr4bbs4ROohI_jHRaeq15lcyR5siH2912vzl3DBM";

//     try {
//       const res = await AuthServices.fetchUser(email, refreshToken);
//       console.log(res.data.data.refreshToken, "Fetch user Ref Token");
//       localStorage.setItem("refreshToken", res.data.data.refreshToken);

//       // Fetch user again with the new refresh token
//       const secondRes = await AuthServices.fetchUser(
//         email,
//         res.data.data.tokens.refreshToken
//       );
//       localStorage.setItem("refreshToken", secondRes.data.tokens.refreshToken);
//     } catch (error) {
//       console.error("Failed to fetch user refresh token:", error);
//       // Handle the error (e.g., redirect to login page, show error message)
//     }
//   };

//   return (
//     <Card className="max-w-lg mx-auto p-6">
//       <CardHeader>
//         <CardTitle className="text-center text-xl">Login</CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         <Form {...form}>
//           <form
//             onSubmit={form.handleSubmit(handleSubmit)}
//             className="space-y-8"
//           >
//             <FormField
//               control={form.control}
//               name="email"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="uppercase text-sm font-bold text-zinc-500 dark:text-white">
//                     Email
//                   </FormLabel>
//                   <FormControl>
//                     <Input
//                       className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible: ring-offset-0"
//                       placeholder="Enter Email"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="password"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="uppercase text-sm font-bold text-zinc-500 dark:text-white">
//                     Password
//                   </FormLabel>
//                   <FormControl>
//                     <Input
//                       type="password"
//                       className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible: ring-offset-0"
//                       placeholder="Enter Password"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <Button className="w-full bg-sky-600 text-lg ">Sign In</Button>
//           </form>
//         </Form>
//       </CardContent>
//     </Card>
//   );
// };

// export default LoginForm;

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "../ui/use-toast";
import { AxiosError } from "axios";
import { AuthServices } from "@/components/services/authServices";

const formSchema = z.object({
  email: z
    .string()
    .min(1, {
      message: "Email is required",
    })
    .email({
      message: "Please enter a valid email",
    }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

const LoginForm = () => {
  const [accessToken, setAccessToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Function to calculate expiration time (20 hours from now)
  const calculateExpirationTime = () => {
    const now = new Date().getTime();
    return now + 20 * 60 * 60 * 1000; // 20 hours in milliseconds
  };

  // Function to handle token refresh
  const refreshToken = async (email: string, refreshToken: string) => {
    try {
      const res = await AuthServices.fetchUser(email, refreshToken);
      localStorage.setItem("refreshToken", res.data.data.tokens.refreshToken);
      localStorage.setItem("accessToken", res.data.data.tokens.accessToken);
      localStorage.setItem(
        "refreshTokenExp",
        calculateExpirationTime().toString()
      );

      // Update state with new access token
      setAccessToken(res.data.data.tokens.accessToken);
      toast({
        title: "Token Refreshed!",
        description: "Tokens have been refreshed!",
      });
    } catch (error) {
      console.error("Failed to refresh token:", error);
      toast({
        title: "Token Refresh Failed!",
        description: "Please log in again!",
      });
      router.push("/auth");
    }
  };

  // Automatically refresh token if expiration time is near
  const checkTokenExpiration = () => {
    const refreshTokenExp = localStorage.getItem("refreshTokenExp");
    const newRefreshToken = localStorage.getItem("refreshToken");
    const email = localStorage.getItem("userEmail");

    if (refreshTokenExp && email && newRefreshToken) {
      const expTime = parseInt(refreshTokenExp);
      const currentTime = new Date().getTime();

      // If less than 1 hour remains, refresh the token
      if (currentTime > expTime - 60 * 60 * 1000) {
        refreshToken(email, newRefreshToken);
      }
    }
  };

  useEffect(() => {
    // Check token expiration every 10 minutes
    const interval = setInterval(checkTokenExpiration, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!isLoading) {
      toast({
        title: "Loading",
        description: "Please wait while we log you in...",
        duration: 3000,
      });
      setIsLoading(true);
    }
    try {
      const res = await AuthServices.loginUser(data);
      console.log(res.data, "login res");

      // Store tokens and set expiration time
      const refreshToken = res.data.data.tokens.refreshToken;
      const accessToken = res.data.data.tokens.accessToken;

      const userId = res.data.data.userId;
      console.log(userId, "userId");
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("userId", userId);
      localStorage.setItem(
        "refreshTokenExp",
        calculateExpirationTime().toString()
      );

      // Update state with access token
      setAccessToken(accessToken);

      // Show success toast
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });

      // Redirect to home page
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          toast({ title: "Login Failed", description: "Unauthorized access" });
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
    <Card className="max-w-lg mx-auto p-6">
      <CardHeader>
        <CardTitle className="text-center text-xl">Login</CardTitle>
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
                  <FormLabel className="uppercase text-sm font-bold text-zinc-500 dark:text-white">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible: ring-offset-0"
                      placeholder="Enter Email"
                      {...field}
                    />
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
                  <FormLabel className="uppercase text-sm font-bold text-zinc-500 dark:text-white">
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible: ring-offset-0"
                      placeholder="Enter Password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="w-full bg-sky-600 text-lg ">Sign In</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
