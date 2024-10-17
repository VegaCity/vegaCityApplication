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
import { EtagType } from "@/types/etagtype";
import { ETagTypeServices } from "@/components/services/etagtypeServices";

interface EtagTypeTableProps {
  limit?: number;
  title?: string;
}

interface GetEtagType extends EtagType {
  id: string;
}

const EtagTypeTable = ({ limit, title }: EtagTypeTableProps) => {
  const [etagTypeList, setEtagTypeList] = useState<GetEtagType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // setIsLoading(true);
    const fetchEtagTypes = async () => {
      try {
        const response = await ETagTypeServices.getETagTypes({
          page: 1,
          size: 10,
        });
        console.log(response.data, "Etag Table Data");

        const etagTypes = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setEtagTypeList(etagTypes);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchEtagTypes();
  }, [isLoading, deleteLoading]);

  const handleDeleteEtagType = (etagType: GetEtagType) => {
    setDeleteLoading(true);
    if (etagType.id) {
      ETagTypeServices.deleteEtagTypeById(etagType.id)
        .then((res) => {
          setDeleteLoading(false);
          toast({
            title: res.data.messageResponse,
            description: `Etag type name: ${etagType.name}`,
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

  const filteredEtagTypes = limit ? etagTypeList.slice(0, limit) : etagTypeList;

  // Function to format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="mt-10">
      <h3 className="text-2xl mb-4 font-semibold">{title || "Etag Types"}</h3>
      {filteredEtagTypes.length > 0 ? (
        <Table>
          <TableCaption>A list of recent Etag Types</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>NO</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Image URL</TableHead>
              <TableHead className="hidden md:table-cell">Bonus Rate</TableHead>
              <TableHead className="hidden md:table-cell">Amout</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEtagTypes.map((etag, i) => (
              <TableRow key={etag.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{etag.name}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {etag.imageUrl}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {etag.bonusRate}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {etag.amount}
                </TableCell>
                {/* {etag.houses.map((house) => (
                  <React.Fragment key={house.id}>
                    <TableCell className='hidden md:table-cell'>{house.id}</TableCell>
                    <TableCell className='hidden md:table-cell'>{house.houseName}</TableCell>
                    <TableCell className='hidden md:table-cell'>{house.location}</TableCell>
                  </React.Fragment>
                ))} */}
                <TableCell>
                  <Link href={`/admin/etagtypes/edit/${etag.id}`}>
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
                          Are sure for delete this -{etag?.name}- Etag Type?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will deflag Etag in
                          your Etag list!
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteEtagType(etag)}
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

export default EtagTypeTable;
