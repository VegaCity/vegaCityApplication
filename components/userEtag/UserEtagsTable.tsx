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
import { ETag } from "@/types/etag";
import { ETagServices } from "../services/etagService";

interface ETagTableProps {
  limit?: number;
  title?: string;
}

const ETagTable = ({ limit, title }: ETagTableProps) => {
  const [etagList, setEtagList] = useState<ETag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEtags = async () => {
      try {
        const response = await ETagServices.getETags({ page: 1, size: 10 });
        console.log(response); // Log the response for debugging

        const etags = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setEtagList(etags);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchEtags();
  }, [isLoading, deleteLoading]);

  const handleDeleteEtag = (etag: ETag) => {
    setDeleteLoading(true);
    if (etag.cccd) {
      ETagServices.deleteEtagById(etag.cccd)
        .then((res) => {
          setDeleteLoading(false);
          toast({
            title: res.data.messageResponse,
            description: `Etag name: ${etag.fullName}`,
          });
        })
        .catch((err) => {
          setDeleteLoading(false);
          toast({
            title: err.data.messageResponse,
            description: "Some errors have been occurred!",
          });
        });
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const filteredEtags = limit ? etagList.slice(0, limit) : etagList;

  return (
    <div className="mt-10">
      <h3 className="text-2xl mb-4 font-semibold">{title || "Etags"}</h3>
      {filteredEtags.length > 0 ? (
        <Table>
          <TableCaption>A list of recent Etags</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>NO</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead className="hidden md:table-cell">Phone</TableHead>
              <TableHead className="hidden md:table-cell">CCCD</TableHead>
              <TableHead className="hidden md:table-cell">Etag Code</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEtags.map((etag, i) => (
              <TableRow key={etag.cccd}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{etag.fullName}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {etag.phoneNumber}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {etag.cccd}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {etag.etagCode}
                </TableCell>
                <TableCell>
                  <Link href={`/admin/etags/edit/${etag.cccd}`}>
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
                          Are sure you want to delete this Etag -{" "}
                          {etag?.fullName}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will delete the
                          Etag from your list!
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteEtag(etag)}
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

export default ETagTable;
