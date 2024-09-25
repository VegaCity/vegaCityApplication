'use client';

import BackButton from '@/components/BackButton';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { redirect, useRouter } from 'next/navigation';
import useSignIn from 'react-auth-kit/hooks/useSignIn';
import { AuthServices } from '@/components/services/authServices';
import { LoginAccount } from '@/types/loginAccount';
import { useEffect, useState } from 'react';
import { toast } from '../ui/use-toast';


const formSchema = z.object({
  email: z
    .string()
    .min(1, {
      message: 'Email is required',
    })
    .email({
      message: 'Please enter a valid email',
    }),
  password: z.string().min(1, {
    message: 'Password is required',
  }),
});

const LoginForm = () => {
  const router = useRouter();
  const signIn = useSignIn();
  const [accessToken, setAccessToken] = useState<string>('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    const {email, password} = data;
    console.log(data, "data");
    if (data !== null) {
      AuthServices.loginUser(data)
      .then((res) => {
          router.push("/")
          console.log(res.data, "login res")
          localStorage.setItem("refreshToken", res.data.data.refreshToken);
          localStorage.setItem("accessToken", res.data.data.accessToken);
          localStorage.setItem("userId",res.data.data.userId);
          setAccessToken(res.data.data.accessToken);
          //login success
          if (
            signIn({
              auth: {
                // expiresIn: 3600,
                token: res.data.data.accessToken,
                type: "Bearer",
              },
              // refresh: res.data.refreshToken,
              userState: {
                accessToken: res.data?.data.accessToken,
                userId: res.data?.data.userId,
                refreshToken: res.data?.data.refreshToken,
              },
              // expiresIn: 3600,
            })
          ) {
            router.push("/");
            // Redirect or do-something
          } else {
            console.log("Đăng nhập thất bại!");
            
            //Throw error
          }
        })
        .catch((err) => {
          // setIsLoading(false);
          // console.log(isLoading);
          console.log(err);
          // if(err.status === 401){
          //   AuthServices.fetchUser(email, 'eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyM2EwZjhkNS00MjhjLTQ2ODItOTEzZS0zNTkzOTVlYmZlZjAiLCJlbWFpbCI6ImNza2gudmVnYWNpdHkudm5AZ21haWwuY29tIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiQWRtaW4iLCJNYXJrZXRab25lSWQiOiI1ZjcyOGRlYi1iMmMzLTRiYWMtOWQ5Yy00MWExMWUwYWNjY2MiLCJuYmYiOjE3MjcwNzk3OTQsImV4cCI6MTcyNzE2NjE5NCwiaXNzIjoiVmVnYUNpdHlBcHAifQ.KmymhFKvDwl-6JJ3QWnDXaoYO2v-uSlB1cHNd7pdUf0')
          //   .then((res) => {
          //     console.log(res.data.refreshToken, "fetch user res");
          //     const newRefreshToken = res.data.refreshToken;
          //     localStorage.setItem('refreshToken', newRefreshToken);
          //     AuthServices.fetchUser(email, newRefreshToken).then((res) => {
          //       const refreshToken2 = res.data.refreshToken;
          //       localStorage.setItem('refreshToken', refreshToken2);
          //     })
          //   })
          // }
        })
        .finally(() => {
          // setIsLoading(false);
        });
    }
  };

  

  return (
    <Card className="max-w-lg mx-auto p-6">
    <CardHeader>
      <CardTitle className="text-center text-xl">Login</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
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
