"use client";

import EmptyDataPage from "@/components/emptyData/emptyData";
import { Loader } from "@/components/loader/Loader";
import { PopoverActionTable } from "@/components/popover/PopoverAction";
import { WalletTypesServices } from "@/components/services/User/walletTypesServices";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
import { formatDateTime } from "@/lib/utils/dateTimeUtils";
import { formatSpaceString } from "@/lib/utils/formatSpaceString";
import {
  handleBadgeStoreStatusColor,
  handleBadgeDeflagStatusColor,
} from "@/lib/utils/statusUtils";
import {
  GetWalletType,
  handleWalletTypeFromBe,
} from "@/types/walletType/walletType";
import { Minus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface WalletTypeTableProps {
  limit?: number;
  title?: string;
}

const WalletTypesTable = ({ limit, title }: WalletTypeTableProps) => {
  const [walletTypeList, setWalletTypeList] = useState<GetWalletType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // setIsLoading(true);
    const fetchWalletTypes = async () => {
      try {
        const response = await WalletTypesServices.getWalletTypes({
          page: 1,
          size: 10,
        });
        console.log(response); // Log the response for debugging

        const walletTypes = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setWalletTypeList(walletTypes);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchWalletTypes();
  }, [isLoading, deleteLoading]);

  // const handleZoneDetails = (zoneId: string) => {
  //   try {
  //     router.push(`/admin/zones/detail/${zoneId}`);
  //   } catch {
  //     toast({
  //       title: "Something wrong!",
  //       description: "Try again!",
  //     });
  //   }
  // };

  const handleDeleteWalletType = (walletType: GetWalletType) => {
    setDeleteLoading(true);
    if (walletType.id) {
      WalletTypesServices.deleteWalletTypeById(walletType.id)
        .then((res) => {
          setDeleteLoading(false);
          toast({
            title: res.data.messageResponse,
            description: `Zone name: ${walletType.name}`,
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

  if (isLoading)
    return (
      <div>
        <Loader isLoading={isLoading} />
      </div>
    );
  if (error) return <div>Error: {error}</div>;

  const filteredWalletTypes = limit
    ? walletTypeList.slice(0, limit)
    : walletTypeList;

  return (
    <div className="mt-10">
      <h3 className="text-2xl mb-4 font-semibold border-l-2 pl-4">
        {title || "Wallet Types"}
      </h3>
      {filteredWalletTypes.length > 0 ? (
        <Table>
          <TableCaption>A list of recent Wallet Types</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white">#</TableHead>
              <TableHead className="text-white">Name</TableHead>
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
            {filteredWalletTypes.map((walletType, i) => (
              <TableRow
                // onClick={() =>
                //   router.push(`/admin/walletTypes/detail/${walletType.id}`)
                // }
                key={walletType.id}
              >
                <TableCell>{i + 1}</TableCell>
                <TableCell>{formatSpaceString(walletType.name)}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {/* <div className="flex flex-col items-center"> */}
                  {formatDateTime({
                    type: "date",
                    dateTime: walletType.crDate,
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
                    dateTime: walletType.upsDate,
                  })}
                  {/* <Minus />
                    {formatDateTime({
                      type: "time",
                      dateTime: walletType.upsDate,
                    })} */}
                  {/* </div> */}
                </TableCell>
                <TableCell>
                  <Badge
                    className={handleBadgeDeflagStatusColor(walletType.deflag)}
                  >
                    {handleWalletTypeFromBe(walletType.deflag)}
                  </Badge>
                </TableCell>

                <TableCell>
                  <PopoverActionTable
                    item={walletType}
                    editLink={`/admin/walletTypes/edit/${walletType.id}`}
                    handleDelete={handleDeleteWalletType}
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

export default WalletTypesTable;
