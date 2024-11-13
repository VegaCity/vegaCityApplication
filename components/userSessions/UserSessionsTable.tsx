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

interface UserSessionTableProps {
  limit?: number;
  title?: string;
}

const UserSessionTable = ({ limit, title }: UserSessionTableProps) => {
  const [sessionList, setSessionList] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setIsLoading(true);
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
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, []);

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
            title: res.data.messageResponse,
            description: `Session ID: ${session.id}`,
          });
        })
        .catch((err) => {
          setDeleteLoading(false);
          toast({
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

  // Function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="mt-10">
      <h3 className="text-2xl mb-4 font-semibold">
        {title || "User Sessions"}
      </h3>
      {filteredSessions.length > 0 ? (
        <Table>
          <TableCaption>User session details with actions</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white">#</TableHead>
              <TableHead className="text-white">User ID</TableHead>
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
                onClick={() => handleSessionDetails(session.id)}
                key={session.id}
              >
                <TableCell>{i + 1}</TableCell>
                <TableCell>{session.userId}</TableCell>
                <TableCell>
                  {new Date(session.startDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(session.endDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {formatCurrency(session.totalCashReceive)}
                </TableCell>
                <TableCell>
                  {formatCurrency(session.totalFinalAmountOrder)}
                </TableCell>
                <TableCell>
                  <Badge
                    className={cn(handleBadgeStatusColorString(session.status))}
                  >
                    {session.status}
                  </Badge>
                </TableCell>
                <TableCell onClick={(event) => event.stopPropagation()}>
                  <PopoverActionTable
                    item={session}
                    editLink={`/admin/userSession/edit/${session.id}`}
                    handleDelete={handleDeleteSession}
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

export default UserSessionTable;
