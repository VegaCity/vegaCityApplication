"use client";

import BackButton from "@/components/BackButton";
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
import { PackageTypeServices } from "@/components/services/Package/packageTypeServices";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Loader } from "@/components/loader/Loader";

interface PackagePatch {
  name: string;
  zoneId: string;
}

interface PackageTypePageProps {
  params: {
    id: string;
  };
}

const PackageTypePage = ({ params }: PackageTypePageProps) => {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [packageData, setPackageData] = useState<PackagePatch | null>(null);
  const router = useRouter();

  const form = useForm<PackagePatch>({
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    const fetchPackageData = async () => {
      setIsLoading(true);
      try {
        const response = await PackageTypeServices.getPackageTypeById(
          params.id
        );
        const packageData = response.data.data;
        if (packageData) {
          setPackageData(packageData);
          form.reset({
            name: packageData.name,
          });
        } else {
          throw new Error("Package data is missing in the response");
        }
      } catch (err) {
        console.error("Error fetching package data:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        toast({
          title: "Error",
          description: "Failed to load package data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPackageData();
  }, [params.id, toast]);

  const handleSubmit = async (data: PackagePatch) => {
    try {
      const packageUpdated = await PackageTypeServices.editPackageType(
        params.id,
        data
      );
      toast({
        title: "Package has been updated successfully",
        description: `Package ${data.name} was updated.`,
      });
      if (packageUpdated) {
        router.back();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    }
  };

  if (isLoading) return <Loader isLoading={isLoading} />;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <BackButton text="Back To Package Types" link="/admin/packageTypes" />
      <h3 className="text-2xl mb-4">Edit Package</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Package Name
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter Package Name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="w-full dark:bg-slate-800 dark:text-white">
            Update Package
          </Button>
        </form>
      </Form>
    </>
  );
};

export default PackageTypePage;
