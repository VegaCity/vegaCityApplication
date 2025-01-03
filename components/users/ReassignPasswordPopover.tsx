import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { UserServices } from "@/components/services/User/userServices"; // Adjust the import based on your project structure
import {
  UserReAssignEmailValues,
  userReAssignEmailFormSchema,
} from "@/lib/validation";
import React, { SetStateAction, useState } from "react";
import { Loader } from "@/components/loader/Loader";

interface ReassignEmailPopoverProps {
  userId: string;
  setReassignPasswordoading: React.Dispatch<SetStateAction<boolean>>;
}

export const ReassignPasswordPopover: React.FC<ReassignEmailPopoverProps> = ({
  userId,
  setReassignPasswordoading,
}) => {
  const { toast } = useToast();
  const form = useForm<UserReAssignEmailValues>({
    resolver: zodResolver(userReAssignEmailFormSchema),
    defaultValues: { email: "" },
  });

  console.log(userId, "userId");

  const onSubmit = async (data: UserReAssignEmailValues) => {
    console.log(userId, "userId");
    console.log(data.email, "email");
    setReassignPasswordoading(true);
    try {
      await UserServices.userReassignEmail(userId, data); // API call with userId and email
      toast({
        title: "Password re-assigned successfully!",
        description: `New email: ${data.email}`,
      });
    } catch (error) {
      toast({
        title: "Failed to re-assign email",
        description: "Please try again.",
      });
    } finally {
      setReassignPasswordoading(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="font-bold" variant="outline">
          Re-assign Password
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-4 w-64">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full mt-2 bg-blue-500 hover:bg-blue-600"
            >
              Confirm
            </Button>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  );
};
