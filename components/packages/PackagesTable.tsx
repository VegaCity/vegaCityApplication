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
import { useRouter } from "next/navigation";
import { validImageUrl } from "@/lib/utils/checkValidImageUrl";
import { Badge } from "@/components/ui/badge";
import { formatVNDCurrencyValue } from "@/lib/utils/formatVNDCurrency";
import { Card } from "@/components/ui/card";
import EmptyDataPage from "@/components/emptyData/emptyData";
import { Loader } from "@/components/loader/Loader";

interface PackageTableProps {
  limit?: number;
  title?: string;
}

interface GetPackage extends Package {
  id: string;
}

const PackageTable = ({ limit, title }: PackageTableProps) => {
  const router = useRouter();
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
            variant: "success",
            title: res.data.messageResponse,
            description: `Package name: ${pkg.name}`,
          });
        })
        .catch((err) => {
          setDeleteLoading(false);
          toast({
            variant: "destructive",
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

  const filteredPackages = limit ? packageList.slice(0, limit) : packageList;

  return (
    <div className="mt-5">
      <h3 className="text-2xl mb-4 font-semibold border-l-2 pl-4">
        {title || "Packages"}
      </h3>
      {filteredPackages.length > 0 ? (
        <Table>
          <TableCaption>A list of recent packages</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white">#</TableHead>
              <TableHead className="text-white">Name</TableHead>
              <TableHead className="text-white">Type</TableHead>
              <TableHead className="hidden md:table-cell text-white">
                Image
              </TableHead>
              <TableHead className="hidden md:table-cell text-white">
                Description
              </TableHead>
              <TableHead className="hidden md:table-cell text-white">
                Price
              </TableHead>
              <TableHead className="hidden md:table-cell text-white">
                Duration
              </TableHead>
              <TableHead className="text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPackages.map((pkg, i) => (
              <TableRow
                onClick={() => router.push(`/admin/packages/detail/${pkg.id}`)}
                key={pkg.id}
              >
                <TableCell>{i + 1}</TableCell>
                <TableCell>
                  <p className="font-bold">{pkg.name}</p>
                </TableCell>
                <TableCell>
                  <p className="font-semibold">{pkg.type}</p>
                </TableCell>
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
                  {pkg.description ? (
                    <p className="text-muted-foreground">{pkg.description}</p>
                  ) : (
                    <Minus />
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <p className="font-bold">
                    {formatVNDCurrencyValue(pkg.price)}
                  </p>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge className="bg-slate-500 text-white w-full">
                    <div className="flex flex-row items-center justify-center w-full">
                      <p>{pkg.duration}</p> &nbsp;
                      <p>days</p>
                    </div>
                  </Badge>
                </TableCell>
                <TableCell
                  onClick={(event) => event.stopPropagation()} //Prvent onClick from TableRow
                >
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
        <EmptyDataPage />
      )}
    </div>
  );
};

export default PackageTable;
