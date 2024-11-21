"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  TableHeader,
} from "@/components/ui/table";
import { Loader } from "@/components/loader/Loader";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { GetUserById } from "@/types/user/user";
import { UserServices } from "@/components/services/User/userServices";
import { cn } from "@/lib/utils";
import { GetWalletTypeById } from "@/types/walletType/walletType";
import { WalletTypesServices } from "@/components/services/User/walletTypesServices";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { validImageUrl } from "@/lib/utils/checkValidImageUrl";
import Image from "next/image";
import {
  UserAccountDetail,
  UserAccountGetDetail,
} from "@/types/user/userAccount";
import {
  handleStoreStatusFromBe,
  handleStoreTypeFromBe,
} from "@/types/store/storeOwner";
import { isObject } from "@/lib/isObject";
import { formatDateTime } from "@/lib/utils/dateTimeUtils";
import { formatVNDCurrencyValue } from "@/lib/utils/formatVNDCurrency";

interface UserDetailProps {
  params: { id: string };
}

const UserDetail = ({ params }: UserDetailProps) => {
  const { id: userId } = params;
  const [userDetail, setUserDetail] = useState<UserAccountGetDetail | null>(
    null
  );
  const [walletTypes, setWalletTypes] = useState<GetWalletTypeById[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchUserDetail = async () => {
      setIsLoading(true);
      try {
        //fetch user detail
        const userResponse = await UserServices.getUserById(userId);
        const user: UserAccountGetDetail = userResponse.data.data;

        setUserDetail(user);
        // You can now use walletTypes array for further processing
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load user details",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetail();
  }, [userId]);

  if (isLoading) return <Loader isLoading={isLoading} />;
  if (!userDetail) return <div>No user details found!</div>;

  return (
    <div className="mt-10 space-y-6">
      <Card>
        <CardHeader className="relative flex items-center justify-between">
          <div className="flex w-full justify-between items-center gap-4">
            <Image
              src={validImageUrl(userDetail.imageUrl || null)}
              alt="avatar"
              width={150}
              height={150}
              className="rounded-md"
            />
            <CardTitle className="text-3xl font-semibold text-center flex-1">
              <p>{userDetail.fullName ?? "No Name Available"}</p>
            </CardTitle>
            <Badge
              className={cn(
                userDetail.status === 0
                  ? "bg-green-400 hover:bg-green-500"
                  : "bg-gray-400 hover:bg-gray-400",
                "w-auto absolute top-2 right-2"
              )}
            >
              {userDetail.status === 0 ? (
                <p className="text-xl">Active</p>
              ) : (
                "Inactive"
              )}
            </Badge>
          </div>
          {/* <div className="flex justify-end w-full mr-16"></div> */}
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>
                  <strong>Email:</strong>
                </TableCell>
                <TableCell>
                  <p className="font-semibold">{userDetail.email}</p>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Phone Number:</strong>
                </TableCell>
                <TableCell>{userDetail.phoneNumber}</TableCell>
              </TableRow>
              {/* <TableRow>
                <TableCell>
                  <strong>Birthday:</strong>
                </TableCell>
                <TableCell>{userDetail.birthday ?? "N/A"}</TableCell>
              </TableRow> */}
              <TableRow>
                <TableCell>
                  <strong>Gender:</strong>
                </TableCell>
                <TableCell>
                  {userDetail.gender === 1 ? "Male" : "Female"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Address:</strong>
                </TableCell>
                <TableCell>{userDetail.address}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Created Date:</strong>
                </TableCell>
                <TableCell>{userDetail.crDate}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Last Updated:</strong>
                </TableCell>
                <TableCell>{userDetail.upsDate}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Description:</strong>
                </TableCell>
                <TableCell>
                  {userDetail.description ?? "No description"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Role:</strong>
                </TableCell>
                <TableCell>
                  <Badge className="bg-slate-500 text-white text-lg">
                    {userDetail?.role.name}
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Wallet Information */}
      <Card>
        <CardHeader>
          <CardTitle>User's Wallets</CardTitle>
        </CardHeader>
        <CardContent>
          {userDetail && isObject(userDetail) ? (
            <Table>
              <TableBody>
                {userDetail.wallets.map((wallet, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <p className="font-bold">Wallet</p> {wallet.name}
                    </TableCell>

                    <TableCell>
                      <p className="font-bold">Balance</p>
                      {formatVNDCurrencyValue(wallet.balance)}
                    </TableCell>
                    <TableCell>
                      <p className="font-bold">Initial Balance</p>
                      {formatVNDCurrencyValue(wallet.balanceStart)}
                    </TableCell>
                    <TableCell>
                      <p className="font-bold">History</p>
                      {formatVNDCurrencyValue(wallet.balanceHistory)}
                    </TableCell>
                    <TableCell>
                      <p className="font-bold">Type</p>
                      {wallet.walletType.name}
                    </TableCell>
                    <TableCell>
                      <p className="font-bold">Last Updated</p>
                      {formatDateTime({
                        type: "date",
                        dateTime: wallet.upsDate,
                      })}{" "}
                      -
                      {formatDateTime({
                        type: "time",
                        dateTime: wallet.upsDate,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No wallets found!</p>
          )}
        </CardContent>
      </Card>

      {/* Orders, Reports, Transactions, and other sections can be similarly structured */}
      {/* Example for Reports */}
      <Card>
        <CardHeader>
          <CardTitle>User's Store</CardTitle>
        </CardHeader>
        <CardContent>
          {userDetail.userStoreMappings?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Phone number</TableHead>
                  <TableHead>Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userDetail.userStoreMappings.length > 0 &&
                  userDetail.userStoreMappings.map((userStore, index) => (
                    <TableRow key={index}>
                      <TableCell>Store {index + 1}</TableCell>
                      <TableCell>{userStore.store.name}</TableCell>
                      <TableCell>
                        {handleStoreTypeFromBe(userStore.store.storeType)}
                      </TableCell>
                      <TableCell>
                        {handleStoreStatusFromBe(userStore.store.status)}
                      </TableCell>
                      <TableCell>{userStore.store.phoneNumber}</TableCell>
                      <TableCell>{userStore.store.address}</TableCell>
                      {/* <TableCell>{report.details}</TableCell> */}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <p>No reports available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetail;
