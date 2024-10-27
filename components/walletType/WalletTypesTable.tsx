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
import { GetWalletType } from "@/types/walletType/walletType";
import { WalletTypesServices } from "@/components/services/User/walletTypesServices";

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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const filteredWalletTypes = limit
    ? walletTypeList.slice(0, limit)
    : walletTypeList;

  return (
    <div className="mt-10">
      <h3 className="text-2xl mb-4 font-semibold">{title || "Zones"}</h3>
      {filteredWalletTypes.length > 0 ? (
        <Table>
          <TableCaption>A list of recent Zones</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWalletTypes.map((walletType, i) => (
              <TableRow key={walletType.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell
                  className="hover:bg-blue-300 hover:text-cyan-50 hover:underline cursor-pointer transition-colors"
                  // onClick={() => handleZoneDetails(walletType.id)}
                >
                  {walletType.name}
                </TableCell>
                {/* {zns.houses.map((house) => (
                  <React.Fragment key={house.id}>
                    <TableCell className='hidden md:table-cell'>{house.id}</TableCell>
                    <TableCell className='hidden md:table-cell'>{house.houseName}</TableCell>
                    <TableCell className='hidden md:table-cell'>{house.location}</TableCell>
                  </React.Fragment>
                ))} */}
                <TableCell>
                  <Link href={`/admin/walletTypes/edit/${walletType.id}`}>
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-xs mr-2 transition-colors duration-200">
                      Edit
                    </button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger>
                      <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-xs mr-2 transition-colors duration-200">
                        Delete
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are sure for delete this -{walletType?.name}- wallet
                          type?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will delete
                          permanently!
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteWalletType(walletType)}
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

export default WalletTypesTable;
