"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Loader } from "@/components/loader/Loader";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { PackageDetailType } from "@/types/packageType/package";
import { PackageServices } from "@/components/services/Package/packageServices";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { validImageUrl } from "@/lib/utils/checkValidImageUrl";
import { formatVNDCurrencyValue } from "@/lib/utils/formatVNDCurrency";

interface PackageDetailProps {
  params: { id: string };
}

const PackageDetail = ({ params }: PackageDetailProps) => {
  const { id: packageId } = params;
  const [packageDetail, setPackageDetail] = useState<PackageDetailType | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchPackageDetail = async () => {
      setIsLoading(true);
      try {
        const packageResponse = await PackageServices.getPackageById(packageId);
        const packageData: PackageDetailType = packageResponse.data.data;

        setPackageDetail(packageData);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load package details",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackageDetail();
  }, [packageId]);

  if (isLoading) return <Loader isLoading={isLoading} />;
  if (!packageDetail) return <div>No package details found!</div>;

  return (
    <div className="mt-10 space-y-6">
      {/* Package Information */}
      <Card>
        <CardHeader className="relative flex items-center justify-between">
          <div className="flex w-full justify-between items-center gap-4">
            <Image
              src={validImageUrl(packageDetail.imageUrl || "")}
              alt="Package Image"
              width={150}
              height={150}
              className="rounded-md"
            />
            <CardTitle className="text-3xl font-semibold text-center flex-1">
              <p>{packageDetail.name}</p>
            </CardTitle>
            <Badge
              className={cn(
                packageDetail.deflag
                  ? "bg-gray-400 hover:bg-gray-400"
                  : "bg-green-400 hover:bg-green-500",
                "w-auto absolute top-2 right-2"
              )}
            >
              {packageDetail.deflag ? "Inactive" : "Active"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>
                  <strong>Type:</strong>
                </TableCell>
                <TableCell>{packageDetail.type}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Price:</strong>
                </TableCell>
                <TableCell>{packageDetail.price} VND</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Duration:</strong>
                </TableCell>
                <TableCell>{packageDetail.duration} days</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Zone ID:</strong>
                </TableCell>
                <TableCell>{packageDetail.zoneId}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Description:</strong>
                </TableCell>
                <TableCell>
                  {packageDetail.description ?? "No description available"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Created Date:</strong>
                </TableCell>
                <TableCell>
                  {new Date(packageDetail.crDate).toLocaleString("vi-VN")}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Last Updated:</strong>
                </TableCell>
                <TableCell>
                  {new Date(packageDetail.upsDate).toLocaleString("vi-VN")}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Package Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Package Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {packageDetail.packageOrders?.length > 0 ? (
            <Table>
              <TableBody>
                {packageDetail.packageOrders.map((order, index) => (
                  <TableRow key={index}>
                    <TableCell>Details Order: {index + 1}</TableCell>
                    <TableCell> {order.cusName}</TableCell>
                    <TableCell> {order.cusEmail}</TableCell>
                    <TableCell> {order.cusCccdpassport}</TableCell>
                    <TableCell>{order.customerMoneyTransfers}</TableCell>
                    <TableCell> {order.phoneNumber}</TableCell>
                    <TableCell>{order.isAdult ? "Adult" : "Child"}</TableCell>
                    <TableCell> {order.vcard}</TableCell>
                    <TableCell> {order.vcardId}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No orders available!</p>
          )}
        </CardContent>
      </Card>

      {/* Additional Package Details */}
      <Card>
        <CardHeader>
          <CardTitle>Package Details</CardTitle>
        </CardHeader>
        <CardContent>
          {packageDetail.packageDetails?.length > 0 ? (
            <Table>
              <TableBody>
                {packageDetail.packageDetails.map((detail, index) => (
                  <TableRow key={index}>
                    <TableCell>Package Detail: {index + 1}</TableCell>
                    <TableCell>
                      Package Money Start:{" "}
                      {formatVNDCurrencyValue(detail.startMoney)}
                    </TableCell>
                    <TableCell>Wallet Name: {detail.walletType.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No additional details available!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PackageDetail;
