"use client";

import { ComboboxCustom } from "@/components/ComboboxCustomize/ComboboxCustom";
import { UserServices } from "@/components/services/User/userServices";
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
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { validImageUrl } from "@/lib/utils/checkValidImageUrl";
import {
  handleUserStatusFromBe,
  UserAccountGet,
  UserStatus,
} from "@/types/userAccount";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { CheckIcon, PenLine, SearchIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface UsersTableProps {
  limit?: number;
  title?: string;
}

const UsersTable = ({ limit, title }: UsersTableProps) => {
  const { toast } = useToast();
  const [userList, setUserList] = useState<UserAccountGet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //fitler user by status
  const [open, setOpen] = useState<boolean>(false);
  const [userStatusValue, setUserStatusValue] = useState<string>("");

  //search user by email, cccdPassport, phone number
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [userSearch, setUserSearch] = useState<UserAccountGet | null>(null);
  const [isUserFound, setIsUserFound] = useState<boolean>(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await UserServices.getUsers({
          page: 1,
          size: 100,
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

  const filterUserStatusList: { value: string; label: string }[] = [
    {
      value: "all",
      label: "All",
    },
    {
      value: "active",
      label: "Active",
    },
    {
      value: "pendingVerify",
      label: "Pending",
    },
    {
      value: "inactive",
      label: "Inactive",
    },
    {
      value: "ban",
      label: "Ban",
    },
  ];

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const filterUserStatus = (): UserAccountGet[] | undefined => {
    switch (userStatusValue) {
      case "active":
        return userList.filter((user) => user.status === 0);
      case "inactive":
        return userList.filter((user) => user.status === 1);
      case "ban":
        return userList.filter((user) => user.status === 2);
      case "pendingVerify":
        return userList.filter((user) => user.status === 3);
      default:
        return userList;
    }
  };
  const filteredUsersWithStatus = filterUserStatus();

  const filteredUsers = limit
    ? filteredUsersWithStatus?.slice(0, limit)
    : filteredUsersWithStatus;
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value); //handle email, cccdPassport, phone number change
    console.log(event.target.value);
  };
  const handleSearch = (searchEmail: string) => {
    console.log(searchEmail, "email searchhhh");
  };

  const UserFound = (userData: UserAccountGet) => {
    return (
      <TableRow key={userData.id}>
        <TableCell>
          <PenLine />
        </TableCell>
        <TableCell>
          <div className="flex items-center">
            <Image
              src={validImageUrl(userData?.imageUrl ?? "")} // Use the URL from the user object
              alt={userData.fullName} // Provide an appropriate alt text
              width={100} // Specify a width
              height={100} // Specify a height
              className="w-12 h-12 rounded-full object-cover" // Add any additional classes if needed
            />
            <p className="ml-4">{userData.fullName}</p>
          </div>
        </TableCell>
        <TableCell className="hidden md:table-cell">{userData.email}</TableCell>
        <TableCell className="hidden md:table-cell">
          {userData.phoneNumber}
        </TableCell>
        <TableCell className="hidden md:table-cell">
          {userData.address}
        </TableCell>
        <TableCell className="hidden md:table-cell">
          {userData.cccdPassport}
        </TableCell>
        <TableCell>
          <Badge className={cn(handleBadgeStatusColor(userData.status))}>
            {handleUserStatusFromBe(userData.status)}
          </Badge>
        </TableCell>
        <TableCell>
          <Link href={`/admin/usersAccount/edit/${userData.id}`}>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-xs mr-2 transition-colors duration-200">
              Edit
            </button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger>
              <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-xs transition-colors duration-200">
                Delete
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you sure you want to delete this user -{" "}
                  {userData?.fullName}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will delete the user from
                  your list!
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDeleteUser(userData)}>
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TableCell>
      </TableRow>
    );
  };

  console.log(filteredUsers, "userfilter list");

  useEffect(() => {
    const filtered = userList.find(
      (user) =>
        user.phoneNumber.includes(searchTerm) ||
        user.cccdPassport.includes(searchTerm) ||
        user.email.includes(searchTerm)
    );
    console.log(filtered, "user filter");
    setUserSearch(filtered || null);
  }, [searchTerm, userList]);

  return (
    <div className="mt-10">
      <h3 className="text-2xl mb-4 font-semibold">{title || "Users"}</h3>
      <>
        <div className="mb-3">
          <div className="flex items-center space-x-2">
            <ComboboxCustom
              open={open}
              setOpen={setOpen}
              value={userStatusValue}
              setValue={setUserStatusValue}
              filterList={filterUserStatusList}
            />

            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                type="text"
                placeholder="Search by Email | Phone | cccdPassport"
                value={searchTerm}
                onChange={handleInputChange}
              />
              <Button type="button" onClick={() => handleSearch(searchTerm)}>
                <SearchIcon size={15} /> &nbsp; Search
              </Button>
            </div>
          </div>
        </div>
        <Table>
          <TableCaption>A list of recent users</TableCaption>
          <TableHeader>
            <TableRow className="bg-slate-300 hover:bg-slate-300">
              <TableHead>No.</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">
                Phone Number
              </TableHead>
              <TableHead className="hidden md:table-cell">Address</TableHead>
              <TableHead className="hidden md:table-cell">
                CCCD/Passport
              </TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userSearch
              ? UserFound(userSearch)
              : filteredUsers?.map((user, i) => (
                  <TableRow key={user.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Image
                          src={validImageUrl(user?.imageUrl ?? "")} // Use the URL from the user object
                          alt={user.fullName} // Provide an appropriate alt text
                          width={100} // Specify a width
                          height={100} // Specify a height
                          className="w-12 h-12 rounded-full object-cover" // Add any additional classes if needed
                        />
                        <p className="ml-4">{user.fullName}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {user.email}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {user.phoneNumber}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {user.address}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {user.cccdPassport}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(handleBadgeStatusColor(user.status))}
                      >
                        {handleUserStatusFromBe(user.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/usersAccount/edit/${user.id}`}>
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-xs mr-2 transition-colors duration-200">
                          Edit
                        </button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger>
                          <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-xs transition-colors duration-200">
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
      </>
    </div>
  );
};

export default UsersTable;
