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
import { useToast } from "@/components/ui/use-toast";
import { PopoverActionTable } from "@/components/popover/PopoverAction";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/loader/Loader";
import { formatVNDCurrencyValue } from "@/lib/utils/formatVNDCurrency";
import EmptyDataPage from "@/components/emptyData/emptyData";

// Services for User Deposit Approval (You'll need to create this)
import { AxiosError } from "axios";
import { UserServices } from "../services/User/userServices";
import { UserDepositApproval } from "@/types/user/user";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
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
import { Button } from "@/components/ui/button";

interface UserDepositTableProps {
  limit?: number;
  title?: string;
}

const UserDepositApprovalTable = ({ limit, title }: UserDepositTableProps) => {
  const router = useRouter();
  const [depositList, setDepositList] = useState<UserDepositApproval[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserDeposits = async () => {
      try {
        setIsLoading(true);
        const response = await UserServices.getDepositApproval({
          page: 1,
          size: 10,
        });

        const deposits = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setDepositList(deposits);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDeposits();
  }, [approvalLoading]);

  const handleApproveDeposit = (deposit: UserDepositApproval) => {
    setApprovalLoading(true);
    if (deposit.transactionId) {
      UserServices.updateStatusDepositApproval(
        deposit.transactionId,
        "APPROVED"
      )
        .then((res) => {
          toast({
            variant: "success",
            title: res.data.messageResponse || "User approved!",
            description: `Deposit for ${deposit.userName} approved`,
          });
        })
        .catch((err) => {
          toast({
            variant: "destructive",
            title:
              err?.response?.data.messageResponse || err?.response?.data.Error,
            description: "Some errors have occurred!",
          });
        })
        .finally(() => {
          setApprovalLoading(false);
        });
    }
  };

  const handleRejectDeposit = (deposit: UserDepositApproval) => {
    setApprovalLoading(true);
    if (deposit.transactionId) {
      UserServices.updateStatusDepositApproval(
        deposit.transactionId,
        "REJECTED"
      )
        .then((res) => {
          toast({
            variant: "destructive",
            title: res?.data.messageResponse || "User rejected!",
            description: `Deposit for ${deposit.userName} rejected`,
          });
        })
        .catch((err) => {
          if (err instanceof AxiosError) {
            toast({
              variant: "destructive",
              title:
                err?.response?.data.messageResponse ||
                err?.response?.data.Error,
              description: "Some errors have occurred!",
            });
          }
        })
        .finally(() => {
          setApprovalLoading(false);
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

  const filteredDeposits = limit ? depositList.slice(0, limit) : depositList;

  return (
    <div className="mt-5">
      <h3 className="text-2xl mb-4 font-semibold border-l-2 pl-4">
        {title || "User Deposit Approvals"}
      </h3>
      {filteredDeposits && filteredDeposits.length > 0 ? (
        <Table>
          <TableCaption>A list of user deposit requests</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white">#</TableHead>
              <TableHead className="text-white">User Name</TableHead>
              <TableHead className="text-white">User Email</TableHead>
              <TableHead className="text-white">Current Balance</TableHead>
              {/* <TableHead className="text-white">Deposit Amount</TableHead> */}
              <TableHead className="text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDeposits.map((deposit, i) => (
              <TableRow key={deposit.transactionId}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <p className="font-semibold">{deposit.userName}</p>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info color="blue" className="w-3 h-3" />
                      </TooltipTrigger>
                      <TooltipContent>
                        TransactionId:{" "}
                        <p className="font-bold">{deposit.transactionId}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-muted-foreground">{deposit.userEmail}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {formatVNDCurrencyValue(deposit.balance)}
                  </Badge>
                </TableCell>
                {/* <TableCell>
                  <Badge variant="outline">
                    {formatVNDCurrencyValue(deposit.balanceHistory)}
                  </Badge>
                </TableCell> */}
                {/* <TableCell>
                  <div className="flex space-x-2">
                    <Badge
                      onClick={() => handleApproveDeposit(deposit)}
                      className="cursor-pointer bg-green-500 hover:bg-green-600"
                    >
                      Approve
                    </Badge>
                    <Badge
                      variant="destructive"
                      onClick={() => handleRejectDeposit(deposit)}
                      className="cursor-pointer bg-red-600 hover:bg-red-700"
                    >
                      Reject
                    </Badge>
                  </div>
                </TableCell> */}
                <TableCell>
                  <div className="flex space-x-2">
                    {/* Approve Button */}
                    <AlertDialog>
                      <AlertDialogTrigger>
                        <Badge className="cursor-pointer bg-green-500 hover:bg-green-600">
                          Approve
                        </Badge>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are sure for delete this user -{deposit.userEmail}-?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will deflag in
                            list!
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleApproveDeposit(deposit)}
                            className="cursor-pointer bg-blue-500 hover:bg-blue-600"
                          >
                            Confirm
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    {/* Reject Button */}
                    <AlertDialog>
                      <AlertDialogTrigger>
                        <Badge
                          variant="destructive"
                          className="cursor-pointer bg-red-600 hover:bg-red-700"
                        >
                          Reject
                        </Badge>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are sure for delete this user -{deposit.userEmail}-?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will deflag in
                            list!
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRejectDeposit(deposit)}
                            className="cursor-pointer bg-red-600 hover:bg-red-700"
                          >
                            Confirm
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
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

export default UserDepositApprovalTable;
