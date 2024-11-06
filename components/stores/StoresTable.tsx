"use client";

import { Loader } from "@/components/loader/Loader";
import { PopoverActionTable } from "@/components/popover/PopoverAction";
import { HouseServices } from "@/components/services/houseServices";
import { StoreServices } from "@/components/services/Store/storeServices";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { isObject } from "@/lib/isObject";
import { StoreHouseType } from "@/types/house";
import { StoreOwner, StoreTypeEnum } from "@/types/store/storeOwner";
import { Minus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface StoreTableProps {
  params?: { id?: string }; // Optional for fetching all stores
}

const StoresTable = ({ params }: StoreTableProps) => {
  const houseId = params?.id;
  const [house, setHouse] = useState<StoreHouseType | null>(null);
  const [stores, setStores] = useState<StoreOwner[]>([]); // For handling all stores
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchStores = async () => {
      setIsLoading(true);
      try {
        if (houseId) {
          // Fetch store by house ID
          const response = await HouseServices.getHouseById(houseId);
          const house = isObject(response.data.data.house)
            ? response.data.data.house
            : null;
          setHouse(house);
        } else {
          // Fetch all stores
          const response = await StoreServices.getStores({ page: 1, size: 10 });
          const stores = Array.isArray(response.data.data)
            ? response.data.data
            : [];
          setStores(stores);
          console.log(response.data.data, "all store");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchStores();
  }, [houseId]);

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
            title: err.data.messageResponse,
            description: "Some errors have occurred!",
          });
        });
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  <Loader isLoading={deleteLoading} />;

  return (
    <div className="mt-10">
      <h3 className="text-2xl mb-4 font-semibold">
        {houseId ? "Stores by House" : "All Stores"}
      </h3>
      {houseId && house && isObject(house) ? (
        <Table>
          <TableCaption>Stores associated with the house</TableCaption>
          <TableHeader>
            <TableRow className="bg-slate-300 hover:bg-slate-300">
              <TableHead>House Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Stores</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow key={house.id}>
              <TableCell>{house.houseName}</TableCell>
              <TableCell>{house.location}</TableCell>
              <TableCell>{house.address}</TableCell>
              <TableCell>
                {house?.stores?.length > 0 ? (
                  house?.stores?.map((store, index) => (
                    <div key={store.id} className="mb-2">
                      <p>
                        <strong>
                          {index + 1}. {store.name}
                        </strong>{" "}
                        <br />
                        Description: {store.description} <br />
                        Email: {store.email} <br />
                        Status:{" "}
                        {store.status === StoreTypeEnum.Clothing
                          ? "Clothing"
                          : store.status === StoreTypeEnum.Food
                          ? "Food"
                          : "Other"}
                      </p>
                    </div>
                  ))
                ) : (
                  <div>No stores available!</div>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      ) : stores?.length > 0 ? (
        <Table>
          <TableCaption>A list of all stores</TableCaption>
          <TableHeader>
            <TableRow className="bg-slate-300 hover:bg-slate-300">
              <TableHead>No.</TableHead>
              <TableHead>Store Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>PhoneNumber</TableHead>
              <TableHead>ShortName</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>StoreType</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.map((store, index) => (
              <TableRow key={store.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{store.name}</TableCell>
                <TableCell>{store.email}</TableCell>
                <TableCell>{store.phoneNumber}</TableCell>
                <TableCell>
                  {store.shortName ? store.shortName : <Minus />}
                </TableCell>
                <TableCell>{store.address}</TableCell>
                <TableCell>
                  {store.description ? store.description : <Minus />}
                </TableCell>
                <TableCell>
                  {store.storeType ? store.storeType : <Minus />}
                </TableCell>
                <TableCell>
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
        <div>No stores found!</div>
      )}
    </div>
  );
};

export default StoresTable;
