"use client";

import BackButton from "@/components/BackButton";
import { useUserRole } from "@/components/hooks/useUserRole";
import StoresPagination from "@/components/stores/StoresPagination";
import StoresTable from "@/components/stores/StoresTable";
import Link from "next/link";

const PackagesPage = () => {
  const { userRole, loading } = useUserRole(); //userRole is an object so that u should . to value like userRole.name, userRole.id
  console.log(userRole?.name, "userRole");

  // if(userRole && userRole.name !== 'Admin'){
  //   return <div>You have denined to access this Page!</div>
  // }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <BackButton text="Go Back" link="/" />
      </div>
      <StoresTable
        params={{
          id: "",
        }}
      />
      <StoresPagination />
    </div>
  );
};

export default PackagesPage;
