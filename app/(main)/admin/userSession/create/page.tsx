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
import { CircleCheck, CircleX, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { UserSessionFormValues, userSessionFormSchema } from "@/lib/validation";

const UserSessionPage = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [users, setUsers] = useState<Users[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UserSessionFormValues>({
    resolver: zodResolver(userSessionFormSchema),
    defaultValues: {
      startDate: "",
      endDate: "",
      userId: "",
      zoneId: "",
    },
  });

  useEffect(() => {
    const fetchUsersAndZones = async () => {
      setIsSubmitting(true);
      try {
        const [userResponse, zoneResponse] = await Promise.all([
          UserServices.getUsersNoneSession({ page: 1, size: 100 }), // Fetching users none session
          ZoneServices.getZones({ page: 1, size: 10 }), // Fetching zones
        ]);

        setUsers(userResponse.data.data || []);
        setZones(zoneResponse.data.data || []);
        console.log(userResponse.data.data, "UserResponseee");
        console.log(zoneResponse.data.data, "ZoneResponseee");
      } catch (err) {
        console.error("Failed to fetch Users or Zones", err);
      } finally {
        setIsSubmitting(false);
      }
    };

    fetchUsersAndZones();
  }, []);

  const handleSubmit = (data: UserSessionFormValues) => {
    const { userId, ...userSessionData } = data;

    console.log("New User Session data:", data);
    if (data) {
      // Assuming UserSessionServices.uploadUserSession exists
      UserSessionServices.createUserSessionById(userId, userSessionData)
        .then((res) => {
          toast({
            variant: "success",
            title: "User Session created successfully",
            description: `Session for User ID: ${data.userId} in Zone ID: ${data.zoneId}`,
          });
          router.push("/admin/userSession");
        })
        .catch((e) => {
          console.error("Error creating User Session:", e);
          toast({
            variant: "destructive",
            title: "User Session delete failed",
            description: `Session for User ID: ${data.userId} in Zone ID: ${data.zoneId}`,
          });
        });
    }
  };

  return (
    <>
      <BackButton text="Back To User Sessions" link="/admin/userSession" />

      <div className="mb-2 ml-4">
        <h4 className="text-2xl font-semibold text-zinc-700 dark:text-white">
          User Session Information
        </h4>
        <p className="text-md text-zinc-500 dark:text-zinc-400">
          Provide details User Session.
        </p>
      </div>
      <Card className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-lg border-2">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
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
                      <Input
                        type="datetime-local"
                        placeholder="Enter end date"
                        {...field}
                      />
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
                              {user.fullName} - {user.email}
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
            </div>
            <div className="flex justify-end items-end w-full mt-4">
              <Button type="submit" className="bg-blue-500 hover:bg-blue-700">
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
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </>
  );
};

export default UserSessionPage;
