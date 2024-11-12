"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { PackageType } from "@/types/packageType/packageType";
import { useToast } from "@/components/ui/use-toast";
import { PopoverActionTable } from "@/components/popover/PopoverAction";
import { PackageTypeServices } from "@/components/services/Package/packageTypeServices";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { handleUserStatusFromBe } from "@/types/user/userAccount";
import { useRouter } from "next/navigation";
import { handleBadgeStatusColor } from "@/lib/utils/statusUtils";

interface PackageTypeTableProps {
  limit?: number;
  title?: string;
}

const PackageTypesTable = ({ limit, title }: PackageTypeTableProps) => {
  const router = useRouter();
  const [packageTypeList, setPackageTypeList] = useState<PackageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPackageTypes = async () => {
      try {
        const response = await PackageTypeServices.getPackageTypes({
          page: 1,
          size: 10,
        });
        const packageTypes = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setPackageTypeList(packageTypes);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackageTypes();
  }, [isLoading, deleteLoading]);

  const handleDeletePackageType = (packageType: PackageType) => {
    setDeleteLoading(true);
    if (packageType.id) {
      PackageTypeServices.deletePackageTypeById(packageType.id)
        .then((res) => {
          setDeleteLoading(false);
          toast({
            title: res.data.messageResponse,
            description: `Package Type: ${packageType.name}`,
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

  const filteredPackageTypes = limit
    ? packageTypeList.slice(0, limit)
    : packageTypeList;

  return (
    <div className="mt-5">
      <h3 className="text-2xl mb-4 font-semibold">
        {title || "Package Types"}
      </h3>
      {filteredPackageTypes.length > 0 ? (
        <Table>
          <TableCaption>A list of recent package types</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>NO</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Updated Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPackageTypes.map((packageType, i) => (
              <TableRow
                onClick={() =>
                  router.push(`/admin/packageTypes/detail/${packageType.id}`)
                }
                className="cursor-pointer hover:outline hover:outline-1 hover:outline-blue-500"
                key={packageType.id}
              >
                <TableCell>{i + 1}</TableCell>
                <TableCell>{packageType.name}</TableCell>
                <TableCell>
                  {new Date(packageType.crDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(packageType.upsDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge
                    className={cn(
                      handleBadgeStatusColor(packageType.statusCode)
                    )}
                  >
                    {handleUserStatusFromBe(packageType.statusCode)}
                  </Badge>
                </TableCell>
                <TableCell
                  onClick={(event) => event.stopPropagation()} //Prvent onClick from TableRow
                >
                  <PopoverActionTable
                    item={packageType}
                    editLink={`/admin/packageTypes/edit/${packageType.id}`}
                    handleDelete={handleDeletePackageType}
                  />
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

export default PackageTypesTable;
