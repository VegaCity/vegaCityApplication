"use client";

import { Badge } from "@/components/ui/badge";
import { handleBadgeStoreStatusColor } from "@/lib/utils/statusUtils";
import { UserServices } from "@/components/services/User/userServices";
import EmptyDataPage from "@/components/emptyData/emptyData";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  handleStoreStatusFromBe,
  handleStoreTypeFromBe,
  StoreOwner,
  StoreTypeEnum,
} from "@/types/store/storeOwner";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { formatSpaceString } from "@/lib/utils/formatSpaceString";
import { useRouter } from "next/navigation";
import { SetStateAction, useEffect, useState } from "react";
import { Minus } from "lucide-react";
import { AxiosError } from "axios";
import { toast } from "@/components/ui/use-toast";
import { Loader } from "@/components/loader/Loader";

interface StoreClosingRequest {
  storeName: string;
  phoneNumber: string;
  status: string;
}

interface StoreClosingRequestProps {
  storeClosingCount: number;
  setStoreClosingCount: React.Dispatch<React.SetStateAction<number>>;
}

const StoreCloseRequestList: React.FC<StoreClosingRequestProps> = ({
  storeClosingCount,
  setStoreClosingCount,
}) => {
  const router = useRouter();
  const [storesClosingRequest, setStoresClosingRequest] = useState<
    StoreOwner[]
  >([]); // For handling all stores
  //   const [storeClosingCount, setStoreClosingCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  //Form request closing store
  const form = useForm({
    defaultValues: {
      storeName: "",
      phoneNumber: "",
      status: "",
    },
  });

  const handleSubmitClosingRequest = async (
    data: StoreClosingRequest,
    store: StoreOwner
  ) => {
    // Here you would typically send this data to your API
    console.log("Store data:", data);
    setIsSubmitting(true);
    const { status, ...rest } = data;

    form.reset({
      storeName: store.name,
      phoneNumber: store.phoneNumber,
      status: status,
    });

    const formSubmit = form.getValues();

    try {
      const res = await UserServices.resolveClosingRequest(formSubmit);
      toast({
        variant: "success",
        title: "Store closing successfully",
        description: `Store closed: ${data.storeName}`,
      });
      router.push("/admin/stores");
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Closing Store Failed",
          description: error.response?.data.Error || error.response?.data.Error,
        });
      }
    } finally {
      setIsSubmitting(false);
    } // Handle form submission logic here
  };

  const popoverStoreClosingRequest = (store: StoreOwner) => {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="destructive">Request Close</Button>
        </PopoverTrigger>
        <PopoverContent className="p-4 w-[300px]">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) =>
                handleSubmitClosingRequest(data, store)
              )}
              className="space-y-6 max-w-md mx-auto"
            >
              {/* Store Name */}
              <FormField
                control={form.control}
                name="storeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                      Store Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                        placeholder="Enter store name"
                        value={store.name}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Store Name */}
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
                        placeholder="Enter phonenumber"
                        value={store.phoneNumber}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                      Status
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value) => field.onChange(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="APPROVED">Approve</SelectItem>
                          <SelectItem value="REJECTED">Reject</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              {/* Submit Button */}
              {isSubmitting ? (
                "Request closing..."
              ) : (
                <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                  Confirm
                </Button>
              )}
            </form>
          </Form>
        </PopoverContent>
      </Popover>
    );
  };

  useEffect(() => {
    const fetchStores = async () => {
      setIsLoading(true);
      try {
        // Fetch store close request

        //Set Store closing request list

        const closingRequestStoresResponse =
          await UserServices.usersClosingRequest({
            page: 1,
            size: 10,
          });
        const storesClosing = Array.isArray(
          closingRequestStoresResponse.data.data
        )
          ? closingRequestStoresResponse.data.data
          : [];
        setStoresClosingRequest(storesClosing);
        setStoreClosingCount(
          storesClosing.length > 0 ? storesClosing.length : 0
        );
        console.log(storesClosing, "closingggg");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchStores();
  }, [isSubmitting]);

  if (isLoading)
    return (
      <div>
        <Loader isLoading={isLoading} />
      </div>
    );
  if (error) return <div>Error: {error}</div>;
  <Loader isLoading={deleteLoading} />;

  return (
    <>
      {storesClosingRequest && storesClosingRequest.length > 0 ? (
        <Table>
          <TableCaption>A list of all stores</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white">#</TableHead>
              <TableHead className="text-white">Store Name</TableHead>
              <TableHead className="text-white">Store Type</TableHead>
              <TableHead className="hidden md:table-cell text-white">
                Email
              </TableHead>
              <TableHead className="hidden md:table-cell text-white">
                PhoneNumber
              </TableHead>
              <TableHead className="hidden md:table-cell text-white">
                Zone Name
              </TableHead>
              <TableHead className="hidden md:table-cell text-white">
                Address
              </TableHead>
              <TableHead className="hidden md:table-cell text-white">
                Description
              </TableHead>
              <TableHead className=" text-white">Status</TableHead>

              <TableHead className="text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {storesClosingRequest.map((store, index) => (
              <TableRow
                onClick={() => router.push(`/admin/stores/detail/${store.id}`)}
                key={store.id}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>{store.name}</TableCell>
                <TableCell>
                  {store.storeType ? (
                    formatSpaceString(handleStoreTypeFromBe(store.storeType))
                  ) : (
                    <Minus />
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {store.email}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {store.phoneNumber}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {store.zoneName ? store.zoneName : <Minus />}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {store.address}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {store.description ? store.description : <Minus />}
                </TableCell>
                <TableCell>
                  <Badge className={handleBadgeStoreStatusColor(store.status)}>
                    {handleStoreStatusFromBe(store.status)}
                  </Badge>
                </TableCell>
                <TableCell
                  onClick={(event) => event.stopPropagation()} //Prvent onClick from TableRow
                >
                  {popoverStoreClosingRequest(store)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyDataPage />
      )}
    </>
  );
};

export default StoreCloseRequestList;
