"use client";

import BackButton from "@/components/BackButton";
import { useUserRole } from "@/components/hooks/useUserRole";
import PackagesPagination from "@/components/packages/PackagesPagination";
import PackageTable from "@/components/packages/PackagesTable";
import { Button } from "@/components/ui/button";
import UserDepositApprovalPagination from "@/components/userDepositApproval/UserDepositeApprovalPagination";
import UserDepositApprovalTable from "@/components/userDepositApproval/UsersDepositApprovalTable";
import { Upload, Plus } from "lucide-react";
import Link from "next/link";

const UserDepositApprovalPage = () => {
  const { userRole, loading } = useUserRole(); //userRole is an object so that u should . to value like userRole.name, userRole.id
  console.log(userRole?.name, "userRole");

  // if(userRole && userRole.name !== 'Admin'){
  //   return <div>You have denined to access this Page!</div>
  // }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-7xl px-10">
        <UserDepositApprovalTable />
        <UserDepositApprovalPagination />
      </div>
    </div>
  );
};

export default UserDepositApprovalPage;
