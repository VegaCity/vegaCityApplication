"use client";

import BackButton from "@/components/BackButton";
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
import { redirect, useRouter } from "next/navigation";
// import useSignIn from 'react-auth-kit/hooks/useSignIn';
import { AuthServices } from "@/components/services/authServices";
import { LoginAccount } from "@/types/loginAccount";
import { useEffect, useState } from "react";
import { toast } from "../ui/use-toast";
import { AxiosError } from "axios";

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

      // Store tokens and user ID
      localStorage.setItem("refreshToken", res.data.data.tokens.refreshToken);
      localStorage.setItem("accessToken", res.data.data.tokens.accessToken);
      localStorage.setItem("userId", res.data.data.userId);

      // Update access token in your state or context
      setAccessToken(res.data.data.tokens.accessToken);

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
          await handleUnauthorizedError(data.email);
        } else {
          console.error("Login error:", error.response?.data || error.message);
          // Handle other types of errors (e.g., network issues, server errors)
          console.log(error.response?.status);
          // // Show fail toast
          // toast({
          //   title: "Login Fail",
          //   description: error.response?.data || error.message,
          // });
        }
      } else {
        console.error("Unexpected error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnauthorizedError = async (email: string) => {
    const storedRefreshToken = localStorage.getItem("refreshToken");
    const refreshToken =
      storedRefreshToken ||
      "eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3ZTczNWQyYy1iZDNkLTQ2MGItYTA1Ni1iZWFiNjJjODgyNTYiLCJlbWFpbCI6ImNza2gudmVnYWNpdHkudm5AZ21haWwuY29tIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiQWRtaW4iLCJNYXJrZXRab25lSWQiOiI1ZjcyOGRlYi1iMmMzLTRiYWMtOWQ5Yy00MWExMWUwYWNjY2MiLCJuYmYiOjE3MjgwMjkwNDUsImV4cCI6MTcyODAzNjIyMiwiaXNzIjoiVmVnYUNpdHlBcHAifQ.DSrHphY8LPardcK5Qfyd_GEMuOzZDXsDMQkI1B-y2ZQ";

    try {
      const res = await AuthServices.fetchUser(email, refreshToken);
      console.log(res.data.data.refreshToken, "Fetch user Ref Token");
      localStorage.setItem("refreshToken", res.data.data.refreshToken);

      // Fetch user again with the new refresh token
      const secondRes = await AuthServices.fetchUser(
        email,
        res.data.data.tokens.refreshToken
      );
      localStorage.setItem("refreshToken", secondRes.data.tokens.refreshToken);
    } catch (error) {
      console.error("Failed to fetch user refresh token:", error);
      // Handle the error (e.g., redirect to login page, show error message)
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
