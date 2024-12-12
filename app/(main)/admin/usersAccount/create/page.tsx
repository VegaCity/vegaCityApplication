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
import { useState } from "react";
import { Card } from "@/components/ui/card";

const UserCreatePage = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    setIsSubmitting(true);
    if (userData) {
      UserServices.createUser(userData)
        .then((res) => {
          console.log(res.data, "Create User");
          toast({
            variant: "success",
            title: "User has been created successfully",
            description: `Created user: ${userData.fullName}`,
          });
          router.push("/admin/usersAccount");
        })
        .catch((err) => {
          if (err.response.status === 400) {
            toast({
              variant: "destructive",
              title: "Error when creating!",
              description: `Error: ${
                err.response.data.messageResponse || err.response.data.Error
              }`,
            });
          }
          console.error(err, "Error creating user");
        })
        .finally(() => setIsSubmitting(false));
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
      {/* Body Container */}
      <div className="max-w-7xl px-10">
        <div className="mb-2">
          <h4 className="text-2xl font-semibold text-zinc-700 dark:text-white">
            User Account Information
          </h4>
          <p className="text-md text-zinc-500 dark:text-zinc-400">
            Provide details User Account.
          </p>
        </div>
        <Card className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-lg border-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-8"
            >
              {/* Div Container */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md space-y-4">
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
                </Card>
                <Card className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md space-y-4">
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
                              {roles
                                .filter(({ name }) => name !== "Admin")
                                .map((role) => (
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
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
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
                </Card>
              </div>
              <div className="flex justify-end items-end w-full mt-4">
                <Button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Creating..."
                  ) : (
                    <>
                      <Upload /> <p>Create</p>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </>
  );
};

export default UserCreatePage;
