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
import { UserAccountGet } from "@/types/userAccount";
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
import { UserServices } from "@/components/services/userServices";

interface UsersTableProps {
  limit?: number;
  title?: string;
}

const UsersTable = ({ limit, title }: UsersTableProps) => {
  const [userList, setUserList] = useState<UserAccountGet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await UserServices.getUsers({
          page: 1,
          size: 10,
        });
        console.log(response.data); // Log the response for debugging

        const users = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setUserList(users);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [isLoading, deleteLoading]);

  console.log(userList, "users");

  const handleDeleteUser = (user: UserAccountGet) => {
    setDeleteLoading(true);
    if (user.id) {
      UserServices.deleteUserById(user.id)
        .then((res) => {
          setDeleteLoading(false);
          toast({
            title: res.data.messageResponse,
            description: `User name: ${user.fullName}`,
          });
        })
        .catch((err) => {
          setDeleteLoading(false);
          toast({
            title: err.data.messageResponse,
            description: "Some errors have occurred!",
          });
        });
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const filteredUsers = limit ? userList.slice(0, limit) : userList;

  return (
    <div className="mt-10">
      <h3 className="text-2xl mb-4 font-semibold">{title || "Users"}</h3>
      {filteredUsers.length > 0 ? (
        <Table>
          <TableCaption>A list of recent users</TableCaption>
          <TableHeader>
            <TableRow className="bg-slate-300 hover:bg-slate-300">
              <TableHead>NO</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">
                Phone Number
              </TableHead>
              <TableHead className="hidden md:table-cell">Address</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user, i) => (
              <TableRow key={user.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{user.fullName}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {user.email}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {user.phoneNumber}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {user.address}
                </TableCell>
                <TableCell>
                  <Link href={`/admin/usersAccount/edit/${user.id}`}>
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-xs mr-2">
                      Edit
                    </button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger>
                      <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-xs">
                        Delete
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you sure you want to delete this user -{" "}
                          {user?.fullName}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will delete the
                          user from your list!
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteUser(user)}
                        >
                          Confirm
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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

export default UsersTable;
