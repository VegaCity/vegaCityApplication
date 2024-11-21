"use client";

import BackButton from "@/components/BackButton";
import { useUserRole } from "@/components/hooks/useUserRole";
import StoresPagination from "@/components/stores/StoresPagination";
import StoresTable from "@/components/stores/StoresTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
        {/* <BackButton text="Go Back" link="/" /> */}
        {/* <Button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-full transition-colors duration-200">
          <Link href="/admin/zones" className="flex items-center">
            <Plus size={15} /> &nbsp; Add New Store
          </Link>
        </Button> */}
      </div>
      <StoresTable />
      <StoresPagination />
    </div>
  );
};

export default PackagesPage;
