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
import { Zone } from "@/types/zone/zone";
import { ZoneServices } from "@/components/services/zoneServices";
import { useRouter } from "next/navigation";
import { PopoverActionTable } from "@/components/popover/PopoverAction";
import { Card } from "@/components/ui/card";
import EmptyDataPage from "@/components/emptyData/emptyData";
import { formatDateTime } from "@/lib/utils/dateTimeUtils";
import { Badge } from "@/components/ui/badge";
import { handleBadgeDeflagStatusColor } from "@/lib/utils/statusUtils";

interface ZoneTableProps {
  limit?: number;
  title?: string;
}

const ZoneTable = ({ limit, title }: ZoneTableProps) => {
  const [zoneList, setZoneList] = useState<Zone[]>([]);
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

  const handleDeleteZone = (zone: Zone) => {
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
      <h3 className="text-2xl mb-4 font-semibold border-l-2 pl-4">
        {title || "Zones"}
      </h3>
      {filteredZones.length > 0 ? (
        <Table>
          <TableCaption>A list of recent zones</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white">#</TableHead>
              <TableHead className="text-white">Name</TableHead>
              <TableHead className="hidden md:table-cell text-white">
                Location
              </TableHead>
              <TableHead className="hidden md:table-cell text-white">
                Create Date
              </TableHead>
              <TableHead className="hidden md:table-cell text-white">
                Update Date
              </TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredZones.map((zns, i) => (
              <TableRow key={zns.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{zns.name}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {zns.location}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {/* <div className="flex flex-col items-center"> */}
                  {formatDateTime({
                    type: "date",
                    dateTime: zns.crDate,
                  })}
                  {/* <Minus />
                    {formatDateTime({
                      type: "time",
                      dateTime: walletType.crDate,
                    })} */}
                  {/* </div> */}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {/* <div className="flex flex-col items-center"> */}
                  {formatDateTime({
                    type: "date",
                    dateTime: zns.upsDate,
                  })}
                  {/* <Minus />
                    {formatDateTime({
                      type: "time",
                      dateTime: walletType.upsDate,
                    })} */}
                  {/* </div> */}
                </TableCell>
                <TableCell>
                  <Badge className={handleBadgeDeflagStatusColor(zns.deflag)}>
                    {zns.deflag ? "In Active" : "Active"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <PopoverActionTable
                    item={zns}
                    editLink={`/admin/zones/edit/${zns.id}`}
                    handleDelete={handleDeleteZone}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyDataPage />
      )}
    </div>
  );
};

export default ZoneTable;
