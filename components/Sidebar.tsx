"use client";

// import React from "react";
// import { Command, CommandList, CommandItem } from "@/components/ui/command";
// import {
//   LayoutDashboard,
//   Package,
//   Tag,
//   Store,
//   WarehouseIcon,
//   StoreIcon,
//   TagIcon,
//   User,
//   PizzaIcon,
// } from "lucide-react";
// import Link from "next/link";
// import { useUserRole } from "@/components/hooks/useUserRole";

// const Sidebar = () => {
//   const { userRole, loading } = useUserRole();

//   const navigatePage = (routeName: string) => {
//     // console.log(userRole, "userRole");
//     if (userRole && userRole.name === "Admin") {
//       return `/admin/${routeName}`;
//     } else {
//       return `/user/${routeName}`;
//     }
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   const menuItems = [
//     {
//       name: "Dashboard",
//       icon: LayoutDashboard,
//       href: "/",
//       roles: ["Admin", "CashierWeb"],
//     },
//     {
//       name: "Packages",
//       icon: Package,
//       href: navigatePage("packages"),
//       roles: ["Admin", "CashierWeb"],
//     },
//     {
//       name: "ETagTypes",
//       icon: Tag,
//       href: navigatePage("etagtypes"),
//       roles: ["Admin", "CashierWeb"],
//     },
//     {
//       name: "ETag",
//       icon: Tag,
//       href: navigatePage("etags"),
//       roles: ["CashierWeb"],
//     },
//     {
//       name: "Zones",
//       icon: Store,
//       href: navigatePage("zones"),
//       roles: ["Admin"],
//     },
//     {
//       name: "Houses",
//       icon: Warehouse,
//       href: navigatePage("houses"),
//       roles: ["Admin"],
//     },
//     {
//       name: "Stores",
//       icon: Store,
//       href: navigatePage("stores"),
//       roles: ["Admin"],
//     },
//     { name: "Etags", icon: Tag, href: navigatePage("etags"), roles: ["Admin"] },
//     {
//       name: "Services Store",
//       icon: Pizza,
//       href: navigatePage("servicesStore"),
//       roles: ["Admin"],
//     },
//     {
//       name: "Wallet Type",
//       icon: Wallet,
//       href: navigatePage("walletTypes"),
//       roles: ["Admin"],
//     },
//     {
//       name: "Users Account",
//       icon: User,
//       href: navigatePage("usersAccount"),
//       roles: ["Admin"],
//     },
//   ];

//   return (
//     <Command className="bg-secondary rounded-none">
//       <CommandList>
//         <Link href="/" className="block">
//           <CommandItem className="hover:hover:bg-hover-button hover:hover:text-cyan-100 transition-colors flex flex-col items-center p-3 cursor-pointer">
//             <LayoutDashboard className="h-6 w-8 mb-3" />
//             Dashboard
//           </CommandItem>
//         </Link>

//         {userRole &&
//           (userRole.name === "Admin" || userRole.name === "CashierWeb") && (
//             <>
//               <Link href={navigatePage("packages")} className="block">
//                 <CommandItem className="hover:hover:bg-hover-button hover:hover:text-cyan-100 transition-colors flex flex-col items-center p-3 cursor-pointer">
//                   <Package className="h-6 w-8 mb-3" />
//                   Packages
//                 </CommandItem>
//               </Link>

//               <Link href={navigatePage("etagtypes")} className="block">
//                 <CommandItem className="hover:hover:bg-hover-button hover:hover:text-cyan-100 transition-colors flex flex-col items-center p-3 cursor-pointer">
//                   <Tag className="h-6 w-8 mb-3" />
//                   ETagTypes
//                 </CommandItem>
//               </Link>
//             </>
//           )}
//         {userRole && userRole.name === "CashierWeb" && (
//           <Link href={navigatePage("etags")} className="block">
//             <CommandItem className="hover:hover:bg-hover-button hover:hover:text-cyan-100 transition-colors flex flex-col items-center p-3 cursor-pointer">
//               <Tag className="h-6 w-8 mb-3" />
//               ETag
//             </CommandItem>
//           </Link>
//         )}
//         {userRole && userRole.name === "Admin" && (
//           <>
//             <Link href={navigatePage("zones")} className="block">
//               <CommandItem className="hover:hover:bg-hover-button hover:hover:text-cyan-100 transition-colors flex flex-col items-center p-3 cursor-pointer">
//                 <Store className="h-6 w-8 mb-3" />
//                 Zones
//               </CommandItem>
//             </Link>
//             <Link href={navigatePage("houses")} className="block">
//               <CommandItem className="hover:hover:bg-hover-button hover:hover:text-cyan-100 transition-colors flex flex-col items-center p-3 cursor-pointer">
//                 <WarehouseIcon className="h-6 w-8 mb-3" />
//                 Houses
//               </CommandItem>
//             </Link>

//             <Link href={navigatePage("stores")} className="block">
//               <CommandItem className="hover:hover:bg-hover-button hover:hover:text-cyan-100 transition-colors flex flex-col items-center p-3 cursor-pointer">
//                 <StoreIcon className="h-6 w-8 mb-3" />
//                 Stores
//               </CommandItem>
//             </Link>
//             <Link href={navigatePage("etags")} className="block">
//               <CommandItem className="hover:hover:bg-hover-button hover:hover:text-cyan-100 transition-colors flex flex-col items-center p-3 cursor-pointer">
//                 <TagIcon className="h-6 w-8 mb-3" />
//                 Etags
//               </CommandItem>
//             </Link>
//             <Link href={navigatePage("servicesStore")} className="block">
//               <CommandItem className="hover:hover:bg-hover-button hover:hover:text-cyan-100 transition-colors flex flex-col items-center p-3 cursor-pointer">
//                 <PizzaIcon className="h-6 w-8 mb-3" />
//                 Services Store
//               </CommandItem>
//             </Link>
//             <Link href={navigatePage("walletTypes")} className="block">
//               <CommandItem className="hover:hover:bg-hover-button hover:hover:text-cyan-100 transition-colors flex flex-col items-center p-3 cursor-pointer">
//                 <TagIcon className="h-6 w-8 mb-3" />
//                 Wallet Type
//               </CommandItem>
//             </Link>
//             <Link href={navigatePage("usersAccount")} className="block">
//               <CommandItem className="hover:hover:bg-hover-button hover:hover:text-cyan-100 transition-colors flex flex-col items-center p-3 cursor-pointer">
//                 <User className="h-6 w-8 mb-3" />
//                 Users Account
//               </CommandItem>
//             </Link>
//           </>
//         )}
//       </CommandList>
//     </Command>
//   );
// };

// export default Sidebar;

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  Package,
  Tag,
  Store,
  Warehouse,
  Pizza,
  User,
  Wallet,
  Loader2,
  LandPlot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useUserRole } from "@/components/hooks/useUserRole";

const Sidebar = () => {
  const { userRole, loading } = useUserRole();

  const navigatePage = (routeName: string) => {
    return userRole?.name === "Admin"
      ? `/admin/${routeName}`
      : `/user/${routeName}`;
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
      roles: ["Admin", "CashierWeb"],
    },
    {
      name: "Packages",
      icon: Package,
      href: navigatePage("packages"),
      roles: ["Admin", "CashierWeb"],
    },
    {
      name: "ETagTypes",
      icon: Tag,
      href: navigatePage("etagtypes"),
      roles: ["Admin", "CashierWeb"],
    },
    {
      name: "ETag",
      icon: Tag,
      href: navigatePage("etags"),
      roles: ["CashierWeb"],
    },
    {
      name: "Zones",
      icon: LandPlot,
      href: navigatePage("zones"),
      roles: ["Admin"],
    },
    {
      name: "Houses",
      icon: Warehouse,
      href: navigatePage("houses"),
      roles: ["Admin"],
    },
    {
      name: "Stores",
      icon: Store,
      href: navigatePage("stores"),
      roles: ["Admin"],
    },
    { name: "Etags", icon: Tag, href: navigatePage("etags"), roles: ["Admin"] },
    {
      name: "Services Store",
      icon: Pizza,
      href: navigatePage("servicesStore"),
      roles: ["Admin"],
    },
    {
      name: "Wallet Type",
      icon: Wallet,
      href: navigatePage("walletTypes"),
      roles: ["Admin"],
    },
    {
      name: "Users Account",
      icon: User,
      href: navigatePage("usersAccount"),
      roles: ["Admin"],
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 h-full w-28 bg-secondary shadow-lg z-50">
      <TooltipProvider>
        <div className="flex flex-col h-full py-4 space-y-4 overflow-y-auto">
          {menuItems.map(
            (item) =>
              item.roles.includes(userRole?.name || "") && (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    <Link href={item.href}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "w-full h-12 flex flex-col items-center justify-center",
                          "hover:bg-primary hover:text-primary-foreground",
                          "transition-colors duration-200"
                        )}
                      >
                        <item.icon className="h-6 w-6" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.name}</p>
                  </TooltipContent>
                </Tooltip>
              )
          )}
        </div>
      </TooltipProvider>
    </div>
  );
};

export default Sidebar;
