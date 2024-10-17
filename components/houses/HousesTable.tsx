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
                  <Link href={`/admin/houses/edit/${house.id}`}>
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-xs mr-2">
                      Edit
                    </button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger>
                      <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-xs">
                        Delete
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you sure you want to delete this house -{" "}
                          {house.houseName}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will remove the
                          house from your list!
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteHouse(house)}
                        >
                          Confirm
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
