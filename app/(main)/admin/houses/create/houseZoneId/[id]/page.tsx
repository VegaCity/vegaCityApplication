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
import { HouseServices } from "@/components/services/houseServices";
import { useRouter } from "next/navigation";
import { HouseType } from "@/types/house";

const formSchema = z.object({
  houseName: z.string().min(1, { message: "House name is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  address: z.string().min(1, { message: "Address is required" }),
  zoneId: z.string().min(1, { message: "Zone ID is required" }),
  deflag: z.boolean().default(false),
  isRent: z.boolean().default(false),
});

interface HouseCreatePageByZoneIdProps {
  params: { id: string };
  house: HouseType;
}

const HouseCreatePageByZoneId = ({ params }: HouseCreatePageByZoneIdProps) => {
  const zoneId = params.id;
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      houseName: "",
      location: "",
      address: "",
      zoneId: zoneId,
      deflag: false,
      isRent: false,
    },
  });

  const handleBackToPreviousPage = () => {
    router.back();
  };

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    console.log("New house data:", data);
    if (data) {
      HouseServices.uploadHouse(data)
        .then((res) => {
          console.log(res.data, "Upload House");
          toast({
            title: "House has been created successfully",
            description: `Created house: ${data.houseName}`,
          });
          router.push("/admin/houses");
        })
        .catch((error) => {
          console.error("Error creating house:", error);
          toast({
            title: "Error creating house",
            description:
              "An error occurred while creating the house. Please try again.",
            variant: "destructive",
          });
        });
    }
  };

  return (
    <>
      <BackButton />
      <h3 className="text-2xl mb-4">Create New House</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="houseName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  House Name
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter house name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Location
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter location"
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
                  <Textarea
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* <FormField
            control={form.control}
            name='zoneId'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
                  Zone ID
                </FormLabel>
                <FormControl>
                  <Input
                    className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                    placeholder='Enter Zone ID'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}

          <Button className="w-full dark:bg-slate-800 dark:text-white">
            Create House
          </Button>
        </form>
      </Form>
    </>
  );
};

export default HouseCreatePageByZoneId;
