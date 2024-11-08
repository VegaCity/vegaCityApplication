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
import { PackageServices } from "@/components/services/Package/packageServices";
import { Package } from "@/types/packageType/package";
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
import { PopoverActionTable } from "@/components/popover/PopoverAction";
import { Minus } from "lucide-react";
import Image from "next/image";
import { validImageUrl } from "@/lib/utils/checkValidImageUrl";

interface PackageTableProps {
  limit?: number;
  title?: string;
}

interface GetPackage extends Package {
  id: string;
}

const PackageTable = ({ limit, title }: PackageTableProps) => {
  const [packageList, setPackageList] = useState<GetPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // setIsLoading(true);
    const fetchPackages = async () => {
      try {
        const response = await PackageServices.getPackages({
          page: 1,
          size: 10,
        });
        console.log(response.data); // Log the response for debugging

        const packages = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setPackageList(packages);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackages();
  }, [isLoading, deleteLoading]);

  console.log(packageList, "packages");

  const handleDeletePackage = (pkg: GetPackage) => {
    setDeleteLoading(true);
    if (pkg.id) {
      PackageServices.deletePackageById(pkg.id)
        .then((res) => {
          setDeleteLoading(false);
          toast({
            title: res.data.messageResponse,
            description: `Package name: ${pkg.name}`,
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

  const filteredPackages = limit ? packageList.slice(0, limit) : packageList;

  // Function to format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="mt-5">
      <h3 className="text-2xl mb-4 font-semibold">{title || "Packages"}</h3>
      {filteredPackages.length > 0 ? (
        <Table>
          <TableCaption>A list of recent packages</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>NO</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Image</TableHead>
              <TableHead className="hidden md:table-cell">
                Description
              </TableHead>
              <TableHead className="hidden md:table-cell">Price</TableHead>
              <TableHead className="hidden md:table-cell">Duration</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPackages.map((pkg, i) => (
              <TableRow key={pkg.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{pkg.name}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <Image
                    src={validImageUrl(pkg?.imageUrl || null)}
                    alt={pkg.name}
                    width={150}
                    height={100}
                    className="object-cover"
                  />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {pkg.description ? pkg.description : <Minus />}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {formatPrice(pkg.price)}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {pkg.duration} days
                </TableCell>
                <TableCell>
                  <PopoverActionTable
                    item={pkg}
                    editLink={`/admin/packages/edit/${pkg.id}`}
                    handleDelete={handleDeletePackage}
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

export default PackageTable;
