"use client";

import { ComboboxCustom } from "@/components/ComboboxCustomize/ComboboxCustom";
import { PopoverActionTable } from "@/components/popover/PopoverAction";
import { HouseServices } from "@/components/services/houseServices";
import { UserServices } from "@/components/services/User/userServices";
import { ZoneServices } from "@/components/services/zoneServices";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ReassignEmailPopover } from "@/components/users/ReassignEmailPopover";
import { cn } from "@/lib/utils";
import { validImageUrl } from "@/lib/utils/checkValidImageUrl";
import { handleBadgeStatusColor } from "@/lib/utils/statusUtils";
import {
  userApproveFormSchema,
  UserApproveFormValues,
  userReAssignEmailFormSchema,
  UserReAssignEmailValues,
} from "@/lib/validation";
import {
  handleUserStatusFromBe,
  UserAccountGet,
  UserApprove,
  UserApproveSubmit,
  UserStatus,
} from "@/types/user/userAccount";
import { Zone } from "@/types/zone/zone";
import { zodResolver } from "@hookform/resolvers/zod";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { AxiosError } from "axios";
import { CheckIcon, PenLine, SearchIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface UsersTableProps {
  limit?: number;
  title?: string;
}

const UsersTable = ({ limit, title }: UsersTableProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [userList, setUserList] = useState<UserAccountGet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //fitler user by status
  const [open, setOpen] = useState<boolean>(false);
  const [userStatusValue, setUserStatusValue] = useState<string>("");

  //search user by email, cccdPassport, phone number
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [userSearch, setUserSearch] = useState<UserAccountGet[]>([]);
  const [isUserFound, setIsUserFound] = useState<boolean>(false);

  //get zone api for approve user pending verify
  const [zoneList, setZoneList] = useState<Zone[]>([]);

  //User approve form
  const userApproveForm = useForm<UserApproveFormValues>({
    resolver: zodResolver(userApproveFormSchema),
    defaultValues: {
      locationZone: "",
      storeName: "",
      storeAddress: "",
      phoneNumber: "",
      storeEmail: "",
      approvalStatus: "APPROVED",
    },
  });

  //get location house selection
  const [selectionZone, setSelectionZone] = useState<string>("");

  const handleApproveUser = async (data: UserApproveSubmit) => {
    console.log(data, "data approveee");
    setApproveLoading(true);
    try {
      const { approvalStatus, ...restData } = data;
      const response = await UserServices.approveUser(data.id, {
        ...restData,
        approvalStatus: "APPROVED",
      });

      console.log(response, "Approve user successfully!");
      toast({
        title: "User is approved!",
        description: `User - Store ${data.storeName} has been approved successfully.`,
      });
      setApproveLoading(false);
    } catch (error) {
      if (error instanceof AxiosError) {
        setApproveLoading(false);
        if (error.status === 500) {
          toast({
            title: "Error",
            description: "Email was existed!",
          });
        }
        console.error(error, "error approve user");
      }
    }
  };

  useEffect(() => {
    const fetchUsersAndHouses = async () => {
      try {
        const [userResponse, zoneResponse] = await Promise.all([
          UserServices.getUsers({ page: 1, size: 100 }),
          ZoneServices.getZones({ page: 1, size: 100 }),
        ]);
        // console.log(response.data, "get users list"); // Log the response for debugging
        // console.log(zoneResponse.data, "response zonessss"); // Log the response for debugging

        const users: UserAccountGet[] = Array.isArray(userResponse.data.data)
          ? userResponse.data.data
          : [];
        const zones: Zone[] = Array.isArray(zoneResponse.data.data)
          ? zoneResponse.data.data
          : [];
        setUserList(users);
        setZoneList(zones);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsersAndHouses();
  }, [isLoading, deleteLoading, approveLoading]);

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
      value: "disable",
      label: "Disable",
    },
    {
      value: "ban",
      label: "Ban",
    },
  ];

  const filterUserStatus = (): UserAccountGet[] | undefined => {
    switch (userStatusValue) {
      case "active":
        return userList.filter((user) => user.status === 0);
      case "disable":
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
  console.log(handleUserStatusFromBe(2), "status");

  const UserFound = () => {
    return userSearch?.map((userFound: UserAccountGet, i) => (
      <TableRow key={userFound.id}>
        <TableCell>
          <div className="flex items-center">
            <PenLine size={20} />.{i}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center">
            <Image
              src={validImageUrl(userFound?.imageUrl ?? "")} // Use the URL from the user object
              alt={userFound.fullName} // Provide an appropriate alt text
              width={100} // Specify a width
              height={100} // Specify a height
              className="w-12 h-12 rounded-full object-cover" // Add any additional classes if needed
            />
            <p className="ml-4">{userFound.fullName}</p>
          </div>
        </TableCell>
        <TableCell className="hidden md:table-cell">
          {userFound.email}
        </TableCell>
        <TableCell className="hidden md:table-cell">
          {userFound.phoneNumber}
        </TableCell>
        <TableCell className="hidden md:table-cell">
          {userFound.address}
        </TableCell>
        <TableCell className="hidden md:table-cell">
          {userFound.cccdPassport}
        </TableCell>
        <TableCell>
          <Badge className={cn(handleBadgeStatusColor(userFound.status))}>
            {handleUserStatusFromBe(userFound.status)}
          </Badge>
        </TableCell>
        <TableCell>
          {userFound.status !== 3 ? (
            <PopoverActionTable
              item={userFound}
              editLink={`/admin/usersAccount/edit/${userFound.id}`}
              handleDelete={handleDeleteUser}
            />
          ) : (
            <>
              {UserPendingVerifyPopUp(userFound)}
              <AlertDialog>
                <AlertDialogTrigger>
                  <Button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-xs transition-colors duration-200">
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you sure you want to delete this user -{" "}
                      {userFound?.fullName} -?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will delete the user
                      from your list!
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteUser(userFound)}
                    >
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </TableCell>
      </TableRow>
    ));
  };

  console.log(zoneList, "Houses List");

  const UserPendingVerifyPopUp = (userData: UserAccountGet) => {
    // const userApproveForm = useForm<UserApproveFormValues>({
    //   defaultValues: {
    //     approvalStatus: "APPROVED",
    //   },
    // });

    const onSubmit = (userApprove: UserApprove) => {
      const completeData = { ...userApprove, id: userData.id }; // Combine form values with userData.id
      handleApproveUser(completeData);
    };

    const handleOpenChange = (isOpen: boolean) => {
      if (isOpen) {
        userApproveForm.reset({
          locationZone: "",
          storeName: "",
          storeAddress: "",
          phoneNumber: "",
          storeEmail: userData.email,
          approvalStatus: "APPROVED",
        }); // Reset form fields when the popup is reopened
      }
    };

    // Disbale zone if isRent true
    // const disableIfNoHouse = (house: HouseType): boolean => {
    //   if (house.isRent) return true;
    //   else return false;
    // };

    return (
      <AlertDialog onOpenChange={handleOpenChange}>
        <AlertDialogTrigger>
          <Button className="w-20 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-xs transition-colors duration-200">
            Approve
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="space-y-2">
          <Form {...userApproveForm}>
            <form onSubmit={userApproveForm.handleSubmit(onSubmit)}>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Approve this user - {userData?.fullName}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Enter the approval details below.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="my-3 space-y-6">
                <FormField
                  control={userApproveForm.control}
                  name="locationZone"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectionZone(value);
                          }}
                          {...field}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select location zone" />
                          </SelectTrigger>
                          <SelectContent>
                            {zoneList
                              // ?.filter((zone) => !zone.isRent)
                              .map((zone, i) => (
                                <SelectItem
                                  key={i}
                                  value={zone.location || "-"}
                                >
                                  {zone.location || "-"}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={userApproveForm.control}
                  name="storeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                          placeholder="Enter Store's Name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={userApproveForm.control}
                  name="storeEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0 pointer-events-none"
                          placeholder="Enter Store's Email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={userApproveForm.control}
                  name="storeAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                          placeholder="Enter Store's Address"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={userApproveForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                          placeholder="Enter Phone Number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* <FormField
                  control={userApproveForm.control}
                  name="approvalStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                          placeholder="Enter Approval Status"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
                {/* <Button type="submit">Confirm</Button> */}
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button type="submit">Confirm</Button>
              </AlertDialogFooter>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  useEffect(() => {
    const filtered = userList.filter(
      (user) =>
        user.phoneNumber.includes(searchTerm) ||
        user.cccdPassport.includes(searchTerm) ||
        user.email.includes(searchTerm)
    );
    console.log(filtered, "user filter");
    setUserSearch(filtered);
  }, [searchTerm, userList]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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
              placeholder="Select User Status..."
            />

            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon size={15} className="text-gray-400" />
              </span>
              <Input
                type="text"
                placeholder="Search by Email | Phone | cccdPassport"
                value={searchTerm}
                onChange={handleInputChange}
                className="pl-10" // Adds padding for the icon
              />
              {/* <Button type="button" onClick={() => handleSearch(searchTerm)}>
                <SearchIcon size={15} /> &nbsp; Search
              </Button> */}
            </div>
          </div>
        </div>
        <Table>
          <TableCaption>A list of recent users</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white">#</TableHead>
              <TableHead className="text-white">Full Name</TableHead>
              <TableHead className="hidden md:table-cell text-white">
                Email
              </TableHead>
              <TableHead className="hidden md:table-cell text-white">
                Phone Number
              </TableHead>
              <TableHead className="hidden md:table-cell text-white">
                Address
              </TableHead>
              <TableHead className="hidden md:table-cell text-white">
                CCCD/Passport
              </TableHead>
              <TableHead className="hidden md:table-cell text-white">
                Status
              </TableHead>
              <TableHead className="text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <>
              {searchTerm && userSearch
                ? UserFound()
                : filteredUsers?.map((user, i) => (
                    <TableRow
                      onClick={() =>
                        router.push(`/admin/usersAccount/detail/${user.id}`)
                      }
                      key={user.id}
                    >
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
                        <p className="text-slate-500">{user.email}</p>
                        {user.status === 3 && (
                          <ReassignEmailPopover userId={user.id} />
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {user.phoneNumber}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <p className="text-slate-500">{user.address}</p>
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
                      <TableCell
                        onClick={(event) => event.stopPropagation()} //Prvent onClick from TableRow
                      >
                        {user.status !== 3 && (
                          <PopoverActionTable
                            item={user}
                            editLink={`/admin/usersAccount/edit/${user.id}`}
                            handleDelete={handleDeleteUser}
                          />
                        )}
                        {/* Approve user button and Re-assign email button */}
                        {user.status === 3 && (
                          <div className="flex items-center justify-between w-min gap-2">
                            <div className="flex-row items-end justify-end">
                              {UserPendingVerifyPopUp(user)}
                              <Button className="w-auto bg-red-500 hover:bg-red-700 text-white font-bold">
                                Delete
                              </Button>
                            </div>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
            </>
          </TableBody>
        </Table>
      </>
    </div>
  );
};

export default UsersTable;
