import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  StoreService,
  ServiceResponse,
} from "@/types/serviceStore/serviceStore";
import Link from "next/link";
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
import { ServiceStoreServices } from "@/components/services/Store/servicesStoreServices";

const ServiceStoresTable = () => {
  const [stores, setStores] = useState<StoreService[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [storeToDelete, setStoreToDelete] = useState<StoreService | null>(null);

  useEffect(() => {
    fetchStores();
  }, [currentPage]);

  const fetchStores = async () => {
    try {
      const response = await ServiceStoreServices.getServiceStores({
        page: currentPage,
        size: 10,
      });
      const serviceResponse: ServiceResponse = response.data;
      setStores(serviceResponse.data);
      setTotalPages(serviceResponse.metaData.totalPage);
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await ServiceStoreServices.deleteServiceStoreById(id);
      fetchStores();
      setStoreToDelete(null);
    } catch (error) {
      console.error("Error deleting store:", error);
    }
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>NO</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead>Updated Date</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stores.map((store, i) => (
            <TableRow key={store.id}>
              <TableCell>{i + 1}</TableCell>
              <TableCell>{store.name}</TableCell>
              <TableCell>{new Date(store.crDate).toLocaleString()}</TableCell>
              <TableCell>{new Date(store.upsDate).toLocaleString()}</TableCell>
              <TableCell>{store.deflag ? "No" : "Yes"}</TableCell>
              <TableCell>
                <Link href={`/admin/servicesStore/edit/${store.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-xs mr-2 transition-colors duration-200"
                  >
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-xs mr-2 transition-colors duration-200"
                  onClick={() => setStoreToDelete(store)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog
        open={!!storeToDelete}
        onOpenChange={() => setStoreToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete {storeToDelete?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will deflag the store in your
              store list!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => storeToDelete && handleDelete(storeToDelete.id)}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ServiceStoresTable;
