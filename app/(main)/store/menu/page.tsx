"use client";

import BackButton from "@/components/BackButton";
import { useUserRole } from "@/components/hooks/useUserRole";
import MenuPagination from "@/components/menu/MenusPagination";
import MenuTable from "@/components/menu/MenusTable";
import PackagesPagination from "@/components/packages/PackagesPagination";
import PackageTable from "@/components/packages/PackagesTable";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import Link from "next/link";

const MenuPage = () => {
  const { userRole, loading } = useUserRole(); //userRole is an object so that u should . to value like userRole.name, userRole.id
  console.log(userRole?.name, "userRole");

  // if(userRole && userRole.name !== 'Admin'){
  //   return <div>You have denined to access this Page!</div>
  // }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        {/* <BackButton text="Go Back" link="/" /> */}
   
      </div>
      <MenuTable />
      <MenuPagination/>
    </div>
  );
};

export default MenuPage;