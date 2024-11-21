"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHeader,
  TableHead,
} from "@/components/ui/table";
import { Loader } from "@/components/loader/Loader";
import { useToast } from "@/components/ui/use-toast";
import { StoreServices } from "@/components/services/Store/storeServices";
import { useRouter } from "next/navigation";
import { Store } from "@/types/store/store";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { validImageUrl } from "@/lib/utils/checkValidImageUrl";
import {
  handleBadgeStatusColor,
  handleBadgeStoreStatusColor,
} from "@/lib/utils/statusUtils";
import {
  handleStoreStatusFromBe,
  handleStoreTypeFromBe,
  StoreOwnerDetail,
} from "@/types/store/storeOwner";
import { Minus } from "lucide-react";
import { formatDateTime } from "@/lib/utils/dateTimeUtils";

interface StoreDetailProps {
  params: { id: string };
}

const StoreDetail = ({ params }: StoreDetailProps) => {
  const { id: storeId } = params;
  const [storeDetail, setStoreDetail] = useState<StoreOwnerDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchStoreDetail = async () => {
      setIsLoading(true);
      try {
        const response = await StoreServices.getStoreById(storeId);
        setStoreDetail(response.data.data);
        console.log(response.data.data, "storeeee");
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load store details",
        });
        console.error(err);
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
        <CardHeader className="relative flex items-center justify-between">
          <div className="flex w-full justify-between items-center gap-4">
            <Image
              src={validImageUrl(null)}
              alt="avatar"
              width={150}
              height={150}
              className="rounded-md"
            />
            <CardTitle className="text-3xl font-semibold text-center flex-1">
              <p>{storeDetail.store.name ?? "No Name Available"}</p>
            </CardTitle>
            <Badge
              className={cn(
                handleBadgeStoreStatusColor(storeDetail.store.status),
                "w-auto absolute top-2 right-2"
              )}
            >
              <p className="text-xl">
                {handleStoreStatusFromBe(storeDetail.store.status)}
              </p>
            </Badge>
          </div>
          {/* <div className="flex justify-end w-full mr-16"></div> */}
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>
                  <strong>Store Type:</strong>
                </TableCell>
                <TableCell>
                  {
                    <Badge className="text-xl">
                      {handleStoreTypeFromBe(storeDetail.store.storeType)}
                    </Badge>
                  }
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Address:</strong>
                </TableCell>
                <TableCell>{storeDetail.store.address}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Email:</strong>
                </TableCell>
                <TableCell>{storeDetail.store.email}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Phone Number:</strong>
                </TableCell>
                <TableCell>{storeDetail.store.phoneNumber}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Short Name:</strong>
                </TableCell>
                <TableCell>{storeDetail.store.shortName ?? "None"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Created Date:</strong>
                </TableCell>
                <TableCell>
                  <div className="flex flex-row">
                    {formatDateTime({
                      type: "date",
                      dateTime: storeDetail.store.crDate,
                    })}
                    <Minus />
                    {formatDateTime({
                      type: "time",
                      dateTime: storeDetail.store.crDate,
                    })}
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Last Updated:</strong>
                </TableCell>
                <TableCell>
                  <div className="flex flex-row">
                    {formatDateTime({
                      type: "date",
                      dateTime: storeDetail.store.upsDate,
                    })}
                    <Minus />
                    {formatDateTime({
                      type: "time",
                      dateTime: storeDetail.store.upsDate,
                    })}
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Description:</strong>
                </TableCell>
                <TableCell>
                  {storeDetail.store.description ?? "No description"}
                </TableCell>
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
          {storeDetail.store.menus && storeDetail.store.menus?.length > 0 ? (
            <Table>
              <TableBody>
                {storeDetail.store.menus.map((menu, index) => (
                  <TableRow key={index}>
                    <TableCell>Menu {index + 1}</TableCell>
                    <TableCell>{menu.name}</TableCell>
                    <TableCell>
                      <Image
                        src={validImageUrl(menu.imageUrl)}
                        width={200}
                        height={150}
                        alt="menuImage"
                      />
                    </TableCell>
                    <TableCell>
                      Start:{" "}
                      <strong>
                        {formatDateTime({
                          type: "date",
                          dateTime: menu.crDate,
                        })}
                      </strong>
                    </TableCell>
                    <TableCell>
                      Update:{" "}
                      <strong>
                        {formatDateTime({
                          type: "date",
                          dateTime: menu.upsDate,
                        })}
                      </strong>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No menu found!</p>
          )}
        </CardContent>
      </Card>

      {/* Additional Information Sections */}
      <Card>
        <CardHeader>
          <CardTitle>Store's Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          {storeDetail.store.wallets &&
          storeDetail.store.wallets?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableHead>Name</TableHead>
                <TableHead>Wallet Type</TableHead>
                <TableHead>Initial Balance</TableHead>
                <TableHead>Balance History</TableHead>
                <TableHead>Transactions</TableHead>
              </TableHeader>
              <TableBody>
                {storeDetail.store.wallets.map((wallet, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Badge>{wallet.walletType.name}</Badge>
                    </TableCell>
                    <TableCell>{wallet.balance}</TableCell>
                    <TableCell>{wallet.balanceStart}</TableCell>
                    <TableCell>{wallet.balanceHistory}</TableCell>
                    <TableCell>
                      {wallet.transactions.length > 0
                        ? wallet.transactions
                        : "Nothing"}
                    </TableCell>
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
