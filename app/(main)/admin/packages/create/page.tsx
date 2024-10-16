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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { PackageServices } from "@/components/services/packageServices";
import { ETagTypeServices } from "@/components/services/etagtypeServices";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EtagType } from "@/types/etagtype";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  imageUrl: z.string().min(1, { message: "Image URL is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  price: z.number().min(0, { message: "Price must be a positive number" }),
  startDate: z
    .string()
    .min(1, { message: "Start date is required" })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid start date",
    }),
  endDate: z
    .string()
    .min(1, { message: "End date is required" })
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid end date" }),
  etagTypeId: z.string().min(1, { message: "ETag Type is required" }),
  quantityEtagType: z
    .number()
    .min(1, { message: "Quantity must be at least 1" }),
});

type FormValues = z.infer<typeof formSchema>;

const PackageCreatePage = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [etagTypes, setEtagTypes] = useState<EtagType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [etagTypeIds, setEtagTypeIds] = useState<string[]>([]);
  const [selectedEtagType, setSelectedEtagType] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
      description: "",
      price: 0,
      startDate: "",
      endDate: "",
      etagTypeId: "",
      quantityEtagType: 1,
    },
  });

  useEffect(() => {
    const fetchETagTypes = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching ETag types...");
        const res = await ETagTypeServices.getETagTypes({ page: 1, size: 50 });
        console.log("ETag types response:", res);

        // Kiểm tra và lưu danh sách ETag Types (bao gồm cả id và name)
        const types = Array.isArray(res.data.data) ? res.data.data : [];
        setEtagTypes(types); // Lưu danh sách ETag Types
        console.log("ETag types set:", types);
      } catch (err) {
        console.error("Error fetching ETag types", err);
        if (err instanceof Error) {
          console.error("Error message:", err.message);
          console.error("Error stack:", err.stack);
        }
        toast({
          title: "Error",
          description: "Failed to fetch ETag types. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchETagTypes();
  }, [toast]);

  const handleEtagTypeChange = async (id: string) => {
    try {
      setIsLoading(true);
      const res = await ETagTypeServices.getETagTypeById(id);
      setSelectedEtagType(res.data);
      form.setValue("etagTypeId", id);
    } catch (err) {
      console.error("Error fetching ETag type details", err);
      toast({
        title: "Error",
        description: "Failed to fetch ETag type details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: FormValues) => {
    try {
      // Tạo package và lấy packageId
      const packageResponse = await PackageServices.uploadPackage(data);
      console.log("Package response:", packageResponse);
      const packageId = packageResponse?.data?.data?.packageId;
      try {
        const etagTypeResponse = await ETagTypeServices.addEtagTypeToPackage({
          etagTypeId: data.etagTypeId,
          packageId: packageId,
          quantityEtagType: data.quantityEtagType,
        });
      } catch (error) {
        console.error("Error adding ETag Type to package:", error);
      }

      toast({
        title: "Success",
        description: `Package "${data.name}" created successfully with ETag Type.`,
      });

      router.push("/admin/packages");
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to create package. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <BackButton text="Back To Packages" link="/admin/packages" />
      <h3 className="text-2xl mb-4">Create New Package</h3>
      {isLoading ? (
        <p>Loading ETag Types...</p>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
            {/* Package Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter package name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image URL */}
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Upload image" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter package description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter price"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e.target.valueAsNumber);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Start Date */}
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* End Date */}
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="etagTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select ETag Type</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleEtagTypeChange(value);
                      }}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an ETag Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading ETag Types...
                          </SelectItem>
                        ) : etagTypes.length > 0 ? (
                          etagTypes.map((etag) => (
                            <SelectItem key={etag.id} value={etag.id}>
                              {etag.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-etags" disabled>
                            No ETag Types available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quantity */}
            <FormField
              control={form.control}
              name="quantityEtagType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter quantity"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e.target.valueAsNumber);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Create Package
            </Button>
          </form>
        </Form>
      )}
    </>
  );
};

export default PackageCreatePage;
