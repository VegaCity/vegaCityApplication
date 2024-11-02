"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { HouseType } from "@/types/house";
import { HouseServices } from "@/components/services/houseServices";
import { PopoverActionTable } from "@/components/popover/PopoverAction";

interface HouseTableProps {
  limit?: number;
  title?: string;
}

interface GetHouse extends HouseType {
  id: string;
}

const HouseTable = ({ limit, title }: HouseTableProps) => {
  const [houseList, setHouseList] = useState<GetHouse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const response = await HouseServices.getHouses({ page: 1, size: 10 });
        console.log(response.data); // Log the response for debugging

        const houses = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setHouseList(houses);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchHouses();
  }, [isLoading, deleteLoading]);

  const handleDeleteHouse = (house: GetHouse) => {
    setDeleteLoading(true);
    if (house.id) {
      HouseServices.deleteHouseById(house.id)
        .then((res) => {
          setDeleteLoading(false);
          toast({
            title: res.data.messageResponse,
            description: `House name: ${house.houseName}`,
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

  const filteredHouses = limit ? houseList.slice(0, limit) : houseList;

  return (
    <div className="mt-10">
      <h3 className="text-2xl mb-4 font-semibold">{title || "Houses"}</h3>
      {filteredHouses.length > 0 ? (
        <Table>
          <TableCaption>A list of recent Houses</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>NO</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Location</TableHead>
              <TableHead className="hidden md:table-cell">Address</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHouses.map((house, i) => (
              <TableRow key={house.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{house.houseName}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {house.location}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {house.address}
                </TableCell>
                <TableCell>
                  <PopoverActionTable
                    item={house}
                    editLink={`/admin/packages/edit/${house.id}`}
                    handleDelete={handleDeleteHouse}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div>Data is fetching... Please wait...</div>
      )}
    </div>
  );
};

export default HouseTable;
