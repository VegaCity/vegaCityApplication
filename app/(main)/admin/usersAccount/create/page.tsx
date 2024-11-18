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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { UserServices } from "@/components/services/User/userServices";
import {
  SelectItem,
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { roles } from "@/types/role";
import { UserAccountPost } from "@/types/user/userAccount";
import {
  CreateUserAccountFormValues,
  createUserAccountFormSchema,
} from "@/lib/validation";
import { apiKey } from "@/components/services/api";
import { Upload } from "lucide-react";
import { storeTypes } from "@/types/store/storeOwner";

const UserCreatePage = () => {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<CreateUserAccountFormValues>({
    resolver: zodResolver(createUserAccountFormSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      cccdPassport: "",
      address: "",
      email: "",
      description: "",
      roleName: "",
      registerStoreType: 0,
    },
  });

  const { getValues, watch } = form;

  const handleSubmit = (data: CreateUserAccountFormValues) => {
    // Create a new object that includes the apiKey
    const userData: UserAccountPost | null = {
      ...data,
      apiKey: apiKey, // Add the apiKey here
    };

    console.log("New user data:", userData);
    if (userData) {
      UserServices.createUser(userData)
        .then((res) => {
          console.log(res.data, "Create User");
          toast({
            title: "User has been created successfully",
            description: `Created user: ${userData.fullName}`,
          });
          router.push("/admin/usersAccount");
        })
        .catch((err) => {
          if (err.response.status === 400) {
            toast({
              title: "Error when creating!",
              description: `Error: ${err.response.data.messageResponse}`,
            });
          }
          console.error(err, "Error creating user");
        });
    }
  };

  const checkStore = () => {
    const getRole = watch("roleName");

    if (getRole === "Store") {
      return false;
    } else {
      return true;
    }
  };

  return (
    <>
      <BackButton text="Back To Users" link="/admin/usersAccount" />
      <h3 className="text-2xl mb-4">Create New User</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Full Name
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter full name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Phone Number
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter phone number"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cccdPassport"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  cccdPassport
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter cccdPassport"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Address
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="roleName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Role Name
                </FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => field.onChange(value)}
                    defaultValue=""
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="registerStoreType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Store Type
                </FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    disabled={checkStore()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {!checkStore() ? (
                        storeTypes.map((storeType) => (
                          <SelectItem
                            key={storeType.value}
                            value={storeType.value.toString()}
                          >
                            {storeType.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-storeTypes" disabled>
                          Type is not found!
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Description (Optional)
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter description"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end items-end w-full mt-4">
            <Button type="submit" className="bg-blue-500 hover:bg-blue-700">
              <Upload />
              Create
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default UserCreatePage;
