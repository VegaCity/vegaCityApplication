"use client";

import { ComboboxCustom } from "@/components/ComboboxCustomize/ComboboxCustom";
import EmptyDataPage from "@/components/emptyData/emptyData";
import { Loader } from "@/components/loader/Loader";
import { PopoverActionTable } from "@/components/popover/PopoverAction";
import { StoreServices } from "@/components/services/Store/storeServices";
import { UserServices } from "@/components/services/User/userServices";
import StoreCloseRequestList from "@/components/stores/StoreCloseRequest";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { isObject } from "@/lib/isObject";
import { cn } from "@/lib/utils";
import { formatSpaceString } from "@/lib/utils/formatSpaceString";
import { handleBadgeStoreStatusColor } from "@/lib/utils/statusUtils";
import {
  handleStoreStatusFromBe,
  handleStoreTypeFromBe,
  StoreOwner,
  StoreTypeEnum,
} from "@/types/store/storeOwner";
import { AxiosError } from "axios";
import { Minus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface StoresTableProps {
  params?: { id?: string }; // Optional for fetching all stores
  limit?: number;
  title?: string;
}

interface StoreClosingRequest {
  storeName: string;
  phoneNumber: string;
  status: string;
}

const StoresTable = ({ limit, title }: StoresTableProps) => {
  const [stores, setStores] = useState<StoreOwner[]>([]); // For handling all stores
  const [storesClosingRequest, setStoresClosingRequest] = useState<
    StoreOwner[]
  >([]); // For handling all stores
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  //Count store closing request
  const [storeClosingCount, setStoreClosingCount] = useState<number>(0);

  //fitler stores by status
  const [open, setOpen] = useState<boolean>(false);
  const [storeStatusValue, setStoreStatusValue] = useState<string>("");

  const handleDeleteStore = (store: StoreOwner) => {
    const { id, name } = store;

    setDeleteLoading(true);
    if (id) {
      StoreServices.deleteStoreById(id)
        .then((res) => {
          setDeleteLoading(false);
          toast({
            title: res.data.messageResponse,
            description: `Store name: ${name}`,
          });
        })
        .catch((err) => {
          setDeleteLoading(false);
          toast({
            title: err.data.messageResponse || err.data.Error,
            description: "Some errors have occurred!",
          });
        });
    }
  };

  const filterStoreStatus = (): StoreOwner[] | undefined => {
    switch (storeStatusValue) {
      case "all":
        return stores;
      case "closingRequest":
        return storesClosingRequest;
      default:
        return stores;
    }
  };
  const filteredStoresWithStatus = filterStoreStatus();

  const filteredStores = limit
    ? filteredStoresWithStatus?.slice(0, limit)
    : filteredStoresWithStatus;

  console.log(filteredStores, "filtered");

  useEffect(() => {
    const fetchStores = async () => {
      setIsLoading(true);
      try {
        // Fetch all stores
        const response = await StoreServices.getStores({ page: 1, size: 10 });
        const stores = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setStores(stores);

        console.log(response.data.data, "all store");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchStores();
  }, [storeStatusValue, isSubmitting]);

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
      <div className="mt-5">
        <h3 className="text-2xl mb-4 font-semibold border-l-2 pl-4">
          All Stores
        </h3>
        {/* Tabs Stores */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">Stores</TabsTrigger>
            <TabsTrigger className="relative" value="storeCloseRequest">
              <p>Stores Close Request</p>
              <Badge className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 text-[0.6rem] bg-gray-400 text-white rounded-full h-4 w-4 flex items-center justify-center">
                {storeClosingCount}
              </Badge>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            {filteredStores && filteredStores?.length > 0 ? (
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
                  {filteredStores.map((store, index) => (
                    <TableRow
                      onClick={() =>
                        router.push(`/admin/stores/detail/${store.id}`)
                      }
                      key={store.id}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{store.name}</TableCell>
                      <TableCell>
                        {store.storeType ? (
                          formatSpaceString(
                            handleStoreTypeFromBe(store.storeType)
                          )
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
                        <Badge
                          className={handleBadgeStoreStatusColor(store.status)}
                        >
                          {handleStoreStatusFromBe(store.status)}
                        </Badge>
                      </TableCell>
                      <TableCell
                        onClick={(event) => event.stopPropagation()} //Prvent onClick from TableRow
                      >
                        <PopoverActionTable
                          item={store}
                          editLink={`/admin/stores/edit/${store.id}`}
                          handleDelete={handleDeleteStore}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyDataPage />
            )}
          </TabsContent>
          <TabsContent value="storeCloseRequest">
            <StoreCloseRequestList
              storeClosingCount={storeClosingCount}
              setStoreClosingCount={setStoreClosingCount}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default StoresTable;
