"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { HouseServices } from "@/components/services/houseServices";
import { StoreHouseType } from "@/types/house";
import { StoreServices } from "@/components/services/storeServices";
import { StoreInHouse, StoreTypeEnum } from "@/types/storeOwner";
import { isObject } from "@/lib/isObject";

interface StoreTableProps {
  params: { id: string };
}

const StoresTable = ({ params }: StoreTableProps) => {
  const { id: houseId } = params;
  const [house, setHouse] = useState<StoreHouseType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await HouseServices.getHouseById(houseId);
        const house = isObject(response.data.data.house)
          ? response.data.data.house
          : [];

        console.log(house, "house detail");
        setHouse(house);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchStores();
  }, [isLoading, deleteLoading]);

  const handleDeleteHouse = (house: StoreHouseType) => {
    const { id: houseId, houseName } = house;

    setDeleteLoading(true);
    if (houseId) {
      StoreServices.deleteStoreById(houseId)
        .then((res) => {
          setDeleteLoading(false);
          toast({
            title: res.data.messageResponse,
            description: `Store name: ${houseName}`,
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

  return (
    <div className="mt-10">
      <h3 className="text-2xl mb-4 font-semibold">Stores</h3>
      {house && isObject(house) ? (
        <Table>
          <TableCaption>A list of recent stores</TableCaption>
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
                  <div>Not have any store!</div>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      ) : (
        <div>Data is fetching... Please wait...</div>
      )}
    </div>
  );
};

export default StoresTable;
