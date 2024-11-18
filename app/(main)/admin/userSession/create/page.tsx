"use client";

import BackButton from "@/components/BackButton";
import { UserServices } from "@/components/services/User/userServices"; // Assuming UserServices and ZoneServices exist
import { ZoneServices } from "@/components/services/zoneServices";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect, useState } from "react";
import { UserSessionServices } from "@/components/services/User/userSessionServices";
import { Users } from "@/types/user/user";
import { Zone } from "@/types/zone/zone";

const userSessionSchema = z.object({
  startDate: z.string().min(1, { message: "Start Date is required" }),
  endDate: z.string().min(1, { message: "End Date is required" }),
  userId: z.string().min(1, { message: "User is required" }),
  zoneId: z.string().min(1, { message: "Zone is required" }),
});

const UserSessionPage = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [users, setUsers] = useState<Users[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);

  const form = useForm<z.infer<typeof userSessionSchema>>({
    resolver: zodResolver(userSessionSchema),
    defaultValues: {
      startDate: "",
      endDate: "",
      userId: "",
      zoneId: "",
    },
  });

  type FormValues = z.infer<typeof userSessionSchema>;

  useEffect(() => {
    const fetchUsersAndZones = async () => {
      try {
        const [userResponse, zoneResponse] = await Promise.all([
          UserServices.getUsers({ page: 1, size: 100 }), // Fetching users
          ZoneServices.getZones({ page: 1, size: 10 }), // Fetching zones
        ]);

        setUsers(userResponse.data.data || []);
        setZones(zoneResponse.data.data || []);
        console.log(userResponse.data.data, "UserResponseee");
        console.log(zoneResponse.data.data, "ZoneResponseee");
      } catch (err) {
        console.error("Failed to fetch Users or Zones", err);
      }
    };

    fetchUsersAndZones();
  }, []);

  const handleSubmit = (data: FormValues) => {
    const { userId, ...userSessionData } = data;

    console.log("New User Session data:", data);

    if (data) {
      // Assuming UserSessionServices.uploadUserSession exists
      UserSessionServices.createUserSessionById(userId, userSessionData).then(
        (res) => {
          toast({
            title: "User Session created successfully",
            description: `Session for User ID: ${data.userId} in Zone ID: ${data.zoneId}`,
          });
          router.push("/admin/userSession");
        }
      );
    }
  };

  return (
    <>
      <BackButton text="Back To User Sessions" link="/admin/user-sessions" />
      <h3 className="text-2xl mb-4">Create New User Session</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    placeholder="Enter start date"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type="date" placeholder="Enter end date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.fullName}
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
            name="zoneId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zone</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {zones.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id}>
                          {zone.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end items-end w-full mt-4">
            <Button type="submit" className="bg-blue-500 hover:bg-blue-700">
              Create Session
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default UserSessionPage;
