import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  StoreService,
  ServiceResponse,
  GetServicesStore,
} from "@/types/store/serviceStore";
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
import { PopoverActionTable } from "@/components/popover/PopoverAction";
import { Loader } from "@/components/loader/Loader";
import { toast } from "@/components/ui/use-toast";
import { formatVNDCurrencyValue } from "@/lib/utils/formatVNDCurrency";
import { formatDateTime } from "@/lib/utils/dateTimeUtils";
import { Card } from "@/components/ui/card";
import EmptyDataPage from "@/components/emptyData/emptyData";

interface ServiceStoresTableProps {
  limit?: number;
  title?: string;
}

const ServiceStoresTable = ({ limit, title }: ServiceStoresTableProps) => {
  const [stores, setStores] = useState<GetServicesStore[]>([]);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
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
      const serviceResponse = response.data;
      setStores(serviceResponse.data);
      setTotalPages(serviceResponse.metaData.totalPage);
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  const handleDeleteServiceStore = async (serviceStore: StoreService) => {
    const { id, name } = serviceStore;

    setDeleteLoading(true);
    if (id) {
      ServiceStoreServices.deleteServiceStoreById(id)
        .then((res) => {
          setDeleteLoading(false);
          toast({
            title: res.data.messageResponse,
            description: `Store name: ${name}`,
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

  <Loader isLoading={deleteLoading} />;

  return (
    <div className="mt-5">
      <h3 className="text-2xl mb-4 font-semibold border-l-2 pl-4">
        {title || "Service Stores"}
      </h3>
      {stores.length > 0 ? (
        <Table>
          <TableCaption>List of Service Stores</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>NO</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Updated Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.map((store, i) => (
              <TableRow key={store.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{store.name}</TableCell>
                <TableCell>
                  {formatVNDCurrencyValue(store.price || 0)}
                </TableCell>
                <TableCell>
                  {formatDateTime({ type: "date", dateTime: store.upsDate })}
                </TableCell>
                <TableCell>
                  <PopoverActionTable
                    item={store}
                    editLink={`/admin/servicesStore/edit/${store.id}`}
                    handleDelete={handleDeleteServiceStore}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyDataPage />
      )}

      {/* <AlertDialog
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
              onClick={() =>
                storeToDelete && handleDeleteServiceStore(storeToDelete)
              }
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}
    </div>
  );
};

export default ServiceStoresTable;
