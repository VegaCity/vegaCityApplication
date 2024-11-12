"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
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

interface UserDetailProps {
  params: { id: string };
}

const UserDetail = ({ params }: UserDetailProps) => {
  const { id: userId } = params;
  const [userDetail, setUserDetail] = useState<GetUserById | null>(null);
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
        const user: GetUserById = userResponse.data.data;

        //fetch walletType
        const walletTypePromises = user.wallets.map((wallet) =>
          WalletTypesServices.getWalletTypeById(wallet.walletTypeId)
        );
        const walletTypeResponses = await Promise.all(walletTypePromises);
        const walletTypes = walletTypeResponses.map(
          (response) => response.data.data
        );
        console.log(walletTypes, "walletTypes");

        // const walletType: GetWalletTypeById = walletTypeResponse.data.data;

        setUserDetail(user);
        // You can now use walletTypes array for further processing
        setWalletTypes(walletTypes);
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
          {walletTypes && walletTypes.length > 0 ? (
            <Table>
              <TableBody>
                {walletTypes.map((wallet, index) => (
                  <TableRow key={index}>
                    <TableCell>Wallet {index + 1}</TableCell>
                    <TableCell>{wallet.name}</TableCell>
                    {/* {userDetail.wallets.map((wallet, index) => (
                      <>
                        <TableCell>Balance: {wallet.balance}</TableCell>
                        <TableCell>Balance: {wallet.balanceHistory}</TableCell>
                      </>
                    ))} */}
                    <TableCell>Last Updated: {wallet.upsDate}</TableCell>
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
          <CardTitle>User's Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {userDetail.reports?.length > 0 ? (
            <Table>
              <TableBody>
                {userDetail.reports.length > 0 &&
                  userDetail.reports.map((report, index) => (
                    <TableRow key={index}>
                      <TableCell>Report {index + 1}</TableCell>
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
