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
import { ZoneType } from "@/types/zone";
import { ZoneServices } from "@/components/services/zoneServices";
import { useRouter } from "next/navigation";

interface ZoneTableProps {
  limit?: number;
  title?: string;
}

const ZoneTable = ({ limit, title }: ZoneTableProps) => {
  const [zoneList, setZoneList] = useState<ZoneType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // setIsLoading(true);
    const fetchZones = async () => {
      try {
        const response = await ZoneServices.getZones({ page: 1, size: 10 });
        console.log(response); // Log the response for debugging

        const zones = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setZoneList(zones);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchZones();
  }, [isLoading, deleteLoading]);

  const handleZoneDetails = (zoneId: string) => {
    try {
      router.push(`/admin/zones/detail/${zoneId}`);
    } catch {
      toast({
        title: "Something wrong!",
        description: "Try again!",
      });
    }
  };

  const handleDeleteZone = (zone: ZoneType) => {
    setDeleteLoading(true);
    if (zone.id) {
      ZoneServices.deleteZoneById(zone.id)
        .then((res) => {
          setDeleteLoading(false);
          toast({
            title: res.data.messageResponse,
            description: `Zone name: ${zone.name}`,
          });
        })
        .catch((err) => {
          setDeleteLoading(false);
          toast({
            title: err.data.messageResponse,
            description: "Some errors have been occured!",
          });
        });
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const filteredZones = limit ? zoneList.slice(0, limit) : zoneList;

  // Function to format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="mt-10">
      <h3 className="text-2xl mb-4 font-semibold">{title || "Zones"}</h3>
      {filteredZones.length > 0 ? (
        <Table>
          <TableCaption>A list of recent Zones</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>NO</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Location</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredZones.map((zns, i) => (
              <TableRow key={zns.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell
                  className="hover:bg-blue-300 hover:text-cyan-50 hover:underline cursor-pointer transition-colors"
                  onClick={() => handleZoneDetails(zns.id)}
                >
                  {zns.name}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {zns.location}
                </TableCell>
                {/* {zns.houses.map((house) => (
                  <React.Fragment key={house.id}>
                    <TableCell className='hidden md:table-cell'>{house.id}</TableCell>
                    <TableCell className='hidden md:table-cell'>{house.houseName}</TableCell>
                    <TableCell className='hidden md:table-cell'>{house.location}</TableCell>
                  </React.Fragment>
                ))} */}
                <TableCell>
                  <Link href={`/admin/zones/edit/${zns.id}`}>
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
                          Are sure for delete this -{zns?.name}- ZONE?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will deflag Zone in
                          your Zone list!
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteZone(zns)}
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

export default ZoneTable;
