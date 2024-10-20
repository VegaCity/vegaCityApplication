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
import { ServiceStoreServices } from "@/components/services/Store/servicesStoreServices"; // Assuming you defined the type for stores
import { GetServicesStore } from "@/types/serviceStore/serviceStore";

interface ServiceStoreTableProps {
  limit?: number;
  title?: string;
}

const ServiceStoresTable = ({ limit, title }: ServiceStoreTableProps) => {
  const [storeList, setStoreList] = useState<GetServicesStore[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await ServiceStoreServices.getServiceStores({
          page: 1,
          size: 10,
        });
        console.log(response.data); // Log the response for debugging

        const stores = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setStoreList(stores);
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

  console.log(storeList, "stores");

  const handleDeleteStore = (store: GetServicesStore) => {
    setDeleteLoading(true);
    if (store.storeId) {
      ServiceStoreServices.deleteServiceStoreById(store.storeId)
        .then((res) => {
          setDeleteLoading(false);
          toast({
            title: res.data.messageResponse,
            description: `Store name: ${store.name}`,
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

  const filteredStores = limit ? storeList.slice(0, limit) : storeList;

  return (
    <div className="mt-10">
      <h3 className="text-2xl mb-4 font-semibold">
        {title || "Service Stores"}
      </h3>
      {filteredStores.length > 0 ? (
        <Table>
          <TableCaption>A list of recent stores</TableCaption>
          <TableHeader>
            <TableRow className="bg-slate-300 hover:bg-slate-300">
              <TableHead>NO</TableHead>
              <TableHead>Store Name</TableHead>
              <TableHead>Store ID</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStores.map((store, i) => (
              <TableRow key={store.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{store.name}</TableCell>
                <TableCell>{store.storeId}</TableCell>
                <TableCell>
                  <Link href={`/admin/servicesStore/edit/${store.id}`}>
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
                          Are you sure you want to delete this store -{" "}
                          {store.name}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will delete the
                          store from your list!
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteStore(store)}
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

export default ServiceStoresTable;
