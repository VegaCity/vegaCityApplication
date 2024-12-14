"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { UserSession } from "@/types/user/userSession";
import { UserSessionServices } from "@/components/services/User/userSessionServices";
import { PopoverActionTable } from "@/components/popover/PopoverAction";
import { Loader } from "@/components/loader/Loader";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  handleBadgeStatusColor,
  handleBadgeStatusColorString,
} from "@/lib/utils/statusUtils";
import { formatDateTime } from "@/lib/utils/dateTimeUtils";
import { formatVNDCurrencyValue } from "@/lib/utils/formatVNDCurrency";
import EmptyDataPage from "@/components/emptyData/emptyData";
import { Button } from "@/components/ui/button";
import { Trash, Minus, Info } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useAuthUser } from "@/components/hooks/useAuthUser";
import { UserServices } from "@/components/services/User/userServices";
import { AxiosError } from "axios";

interface UserSessionTableProps {
  limit?: number;
  title?: string;
}

const UserSessionTable = ({ limit, title }: UserSessionTableProps) => {
  const [userRole, setUserRole] = useState<string>("");
  const [sessionList, setSessionList] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await UserSessionServices.getUserSessions({
          page: 1,
          size: 10,
        });

        setSessionList(
          Array.isArray(response.data.data) ? response.data.data : []
        );
        console.log(response.data.data, "UserSession");
      } catch (err) {
        setError(
          err instanceof AxiosError
            ? err.response?.data.messageResponse || err.response?.data.Error
            : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [isLoading, deleteLoading]);

  console.log(userRole, "role");
  const handleSessionDetails = (sessionId: string) => {
    router.push(`/admin/userSession/detail/${sessionId}`);
  };

  const handleDeleteSession = (session: UserSession) => {
    setDeleteLoading(true);
    if (session.id) {
      UserSessionServices.deleteUserSessionById(session.id)
        .then((res) => {
          setDeleteLoading(false);
          toast({
            variant: "success",
            title: res.data.messageResponse,
            description: `Session ID: ${session.id}`,
          });
        })
        .catch((err) => {
          setDeleteLoading(false);
          toast({
            variant: "destructive",
            title: "Error",
            description: "An error occurred while deleting the session.",
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

  const filteredSessions = limit ? sessionList.slice(0, limit) : sessionList;

  console.log(filteredSessions, "filteredSessions");
  return (
    <div className="mt-10">
      <h3 className="text-2xl mb-4 font-semibold border-l-2 pl-4">
        {title || "User Sessions"}
      </h3>
      {filteredSessions.length > 0 ? (
        <Table>
          <TableCaption>User session details with actions</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white">#</TableHead>
              <TableHead className="text-white">User Email</TableHead>
              <TableHead className="hidden md:table-cell text-white">
                User Name
              </TableHead>
              <TableHead className="hidden md:table-cell text-white">
                Start Date
              </TableHead>
              <TableHead className="hidden md:table-cell text-white">
                End Date
              </TableHead>
              <TableHead className="hidden md:table-cell text-white">
                Total Cash Received
              </TableHead>
              <TableHead className="text-white">
                Total Final Amount Order
              </TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSessions.map((session, i) => (
              <TableRow
                // onClick={() => handleSessionDetails(session.id)}
                key={session.id}
              >
                <TableCell>{i + 1}</TableCell>
                <TableCell>
                  <strong>{session.email ?? "User Email"}</strong>
                </TableCell>
                <TableCell>
                  <div className="flex flex-row gap-2">
                    <Tooltip>
                      <TooltipTrigger>
                        <Info color="blue" size={12} />
                      </TooltipTrigger>
                      <TooltipContent>UserId: {session.userId}</TooltipContent>
                    </Tooltip>
                    <strong>{session.userName}</strong>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-center">
                    {formatDateTime({
                      type: "date",
                      dateTime: session.startDate,
                    })}
                    <Minus />
                    {formatDateTime({
                      type: "time",
                      dateTime: session.startDate,
                    })}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-center">
                    {formatDateTime({
                      type: "date",
                      dateTime: session.endDate,
                    })}
                    <Minus />
                    {formatDateTime({
                      type: "time",
                      dateTime: session.endDate,
                    })}
                  </div>
                </TableCell>
                <TableCell>
                  {formatVNDCurrencyValue(session.totalCashReceive)}
                </TableCell>
                <TableCell>
                  {formatVNDCurrencyValue(session.totalFinalAmountOrder)}
                </TableCell>
                <TableCell>
                  <Badge
                    className={cn(handleBadgeStatusColorString(session.status))}
                  >
                    {session.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    {/* <Label htmlFor="maxWidth">Delete</Label> */}
                    {session.email !== "lethaikhoa0109@gmail.com" ? (
                      <AlertDialog>
                        <AlertDialogTrigger>
                          <Button
                            variant={"ghost"}
                            className="text-red-500 hover:text-red-600 font-bold rounded text-xs"
                          >
                            <Trash />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are sure for delete this -{session.email}-?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will deflag in
                              list!
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteSession(session)}
                            >
                              Confirm
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <></>
                    )}
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

export default UserSessionTable;
