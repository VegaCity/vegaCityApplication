"use client";

import BackButton from "@/components/BackButton";
import { useUserRole } from "@/components/hooks/useUserRole";
import UsersPagination from "@/components/users/UsersPagination";
import UsersTable from "@/components/users/UsersTable";
import Link from "next/link";

const UsersPage = () => {
  const { userRole, loading } = useUserRole(); //userRole is an object so that u should . to value like userRole.name, userRole.id

  // if(userRole && userRole.name !== 'Admin'){
  //   return <div>You have denined to access this Page!</div>
  // }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <BackButton text="Go Back" link="/" />
        <Link
          href="/admin/usersAccount/create"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create New User
        </Link>
      </div>
      <UsersTable />
      <UsersPagination />
    </div>
  );
};

export default UsersPage;
