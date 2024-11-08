"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Loader } from "@/components/loader/Loader";
import { useToast } from "@/components/ui/use-toast";
import { StoreServices } from "@/components/services/Store/storeServices";
import { useRouter } from "next/navigation";
import { parseMenuJson, Store } from "@/types/store/store";
import { cn } from "@/lib/utils";

interface StoreDetailProps {
  params: { id: string };
}

const StoreDetail = ({ params }: StoreDetailProps) => {
  const { id: storeId } = params;
  const [storeDetail, setStoreDetail] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const router = useRouter();

  const handleBadgeStatusColor = (status: number): string => {
    switch (status) {
      case 0: // Active
        return "bg-green-400 hover:bg-green-500";
      case 1: // Inactive
        return "bg-slate-400 hover:bg-slate-500";
      case 2: // Ban
        return "bg-red-400 hover:bg-red-500";
      case 3: // PendingVerify
        return "bg-blue-400 hover:bg-blue-500";
      default:
        return "bg-gray-400 hover:bg-gray-500"; // Optional: default color
    }
  };

  useEffect(() => {
    const fetchStoreDetail = async () => {
      setIsLoading(true);
      try {
        const response = await StoreServices.getStoreById(storeId);
        setStoreDetail(response.data.data.store);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load store details",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreDetail();
  }, [storeId]);

  if (isLoading) return <Loader isLoading={isLoading} />;
  if (!storeDetail) return <div>No store details found!</div>;

  return (
    <div className="mt-10 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-semibold">
            {storeDetail.name}
          </CardTitle>
          <Badge
            className={cn(handleBadgeStatusColor(storeDetail.status), "w-14")}
          >
            {storeDetail.deflag ? "Inactive" : "Active"}
          </Badge>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>
                  <strong>Store Type:</strong>
                </TableCell>
                <TableCell>{storeDetail.storeType ?? "N/A"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Address:</strong>
                </TableCell>
                <TableCell>{storeDetail.address}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Email:</strong>
                </TableCell>
                <TableCell>{storeDetail.email}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Phone Number:</strong>
                </TableCell>
                <TableCell>{storeDetail.phoneNumber}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Short Name:</strong>
                </TableCell>
                <TableCell>{storeDetail.shortName ?? "N/A"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Status:</strong>
                </TableCell>
                <TableCell>{storeDetail.status}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Created Date:</strong>
                </TableCell>
                <TableCell>{storeDetail.crDate}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Last Updated:</strong>
                </TableCell>
                <TableCell>{storeDetail.upsDate}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Description:</strong>
                </TableCell>
                <TableCell>
                  {storeDetail.description ?? "No description"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Zone:</strong>
                </TableCell>
                <TableCell>{storeDetail.zone ?? "N/A"}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Menu Information Sections */}
      <Card>
        <CardHeader>
          <CardTitle>Store's Menu</CardTitle>
        </CardHeader>
        <CardContent>
          {storeDetail.menus?.length > 0 ? (
            <Table>
              <TableBody>
                {storeDetail.menus.map((menu, index) => (
                  <TableRow key={index}>
                    <TableCell>Report {index + 1}</TableCell>
                    {parseMenuJson(menu.menuJson).map((storeMenu, index) => (
                      <TableRow key={index}>
                        <TableCell>Item: {index + 1}</TableCell>
                        <TableCell>{storeMenu.Name}</TableCell>
                        <TableCell>{storeMenu.ImgUrl}</TableCell>
                        <TableCell>{storeMenu.Price}</TableCell>
                        <TableCell>{storeMenu.ProductCategory}</TableCell>
                      </TableRow>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No menu found!</p>
          )}
        </CardContent>
      </Card>

      {/* Product Information Sections */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Store's Product</CardTitle>
        </CardHeader>
        <CardContent>
          {storeDetail.menus?.length > 0 ? (
            <Table>
              <TableBody>
                {storeDetail.menus.map((menu, index) => (
                  <TableRow key={index}>
                    <TableCell>Report {index + 1}</TableCell>
                    {menu?.products.map((storeMenu, index) => (
                      <TableRow key={index}>
                        <TableCell>Item: {index + 1}</TableCell>
                        <TableCell>{storeMenu.Name}</TableCell>
                        <TableCell>{storeMenu.ImgUrl}</TableCell>
                        <TableCell>{storeMenu.Price}</TableCell>
                        <TableCell>{storeMenu.ProductCategory}</TableCell>
                      </TableRow>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No menu found!</p>
          )}
        </CardContent>
      </Card> */}

      {/* Additional Information Sections */}
      <Card>
        <CardHeader>
          <CardTitle>Dispute Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {storeDetail.disputeReports?.length > 0 ? (
            <Table>
              <TableBody>
                {storeDetail.disputeReports.map((report, index) => (
                  <TableRow key={index}>
                    <TableCell>Report {index + 1}</TableCell>
                    <TableCell>{report.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No dispute reports available</p>
          )}
        </CardContent>
      </Card>

      {/* Repeat similar Card structures for menus, orders, storeServices, transactions, users, and wallets */}
    </div>
  );
};

export default StoreDetail;
