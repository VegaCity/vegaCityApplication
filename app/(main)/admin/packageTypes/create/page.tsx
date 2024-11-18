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
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import {
  SelectItem,
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PackageTypePost } from "@/types/packageType/packageType";
import { PackageTypeServices } from "@/components/services/Package/packageTypeServices";
import { apiKey } from "@/components/services/api";
import { useEffect, useState } from "react";
import { Loader } from "@/components/loader/Loader";
import { ZoneServices } from "@/components/services/zoneServices";
import { Zone } from "@/types/zone/zone";
import { AxiosError } from "axios";

// Define form validation schema
const createPackageTypeFormSchema = z.object({
  zoneId: z.string().nonempty("Zone ID is required"),
  name: z.string().nonempty("Package Type Name is required"),
});

// Define form values type
type CreatePackageTypeFormValues = z.infer<typeof createPackageTypeFormSchema>;

const PackageTypeCreatePage = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [zones, setZones] = useState<Zone[]>([]);
  const form = useForm<CreatePackageTypeFormValues>({
    resolver: zodResolver(createPackageTypeFormSchema),
    defaultValues: {
      zoneId: "",
      name: "",
    },
  });

  const handleSubmit = (data: CreatePackageTypeFormValues) => {
    console.log("New package type data:", data);
    PackageTypeServices.uploadPackageType(data)
      .then((res) => {
        toast({
          title: "Package Type has been created successfully",
          description: `Created package type: ${data.name}`,
        });
        router.push("/admin/packageTypes");
      })
      .catch((err) => {
        if (err.response?.status === 400) {
          toast({
            title: "Error when creating!",
            description: `Error: ${err.response.data.messageResponse}`,
          });
        }
        console.error("Error creating package type:", err);
      });
  };

  useEffect(() => {
    const fetchZones = async () => {
      setIsLoading(true);
      try {
        const zoneRes = await ZoneServices.getZones({ page: 1, size: 10 });
        const zones = Array.isArray(zoneRes.data.data) ? zoneRes.data.data : [];

        setZones(zones);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        if (error instanceof AxiosError) {
          setError(
            error.response
              ? error.response?.data.messageResponse
              : "Can't not get zones!"
          );
          console.error(error.message);
        }
      }
    };
    fetchZones();
  }, []);

  if (isLoading) return <Loader isLoading={isLoading} />;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <BackButton text="Back To Package Types" link="/admin/packageTypes" />
      <h3 className="text-2xl mb-4">Create New Package Type</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Package Type Name
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter package type name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Zones */}
          <FormField
            control={form.control}
            name="zoneId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Wallet Type</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                    value={field.value}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an Wallet Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading Wallet Types...
                        </SelectItem>
                      ) : zones.length > 0 ? (
                        zones.map((zone) => (
                          <SelectItem key={zone.id} value={zone.id}>
                            {zone.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-wallets" disabled>
                          No Wallet Types available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end items-end w-full mt-4">
            <Button className="bg-blue-500 hover:bg-blue-700">
              Create Package Type
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default PackageTypeCreatePage;
