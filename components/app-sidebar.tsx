"use client";

import {
  ChevronRight,
  ChevronDown,
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  User2,
  ChevronUp,
  Loader2,
  LayoutDashboard,
  Package,
  Tag,
  LandPlot,
  Store,
  MessageSquareWarning,
  ArrowRightLeft,
  Pizza,
  Wallet,
  User,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useSidebar } from "@/components/ui/sidebar";
import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserRole } from "@/components/hooks/useUserRole";
import Link from "next/link";
import { useAuthUser } from "@/components/hooks/useAuthUser";
import ThemeToggler from "@/components/ThemeToggler";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AuthServices } from "@/components/services/authServices";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
// import { useSidebar } from "@/context/SidebarContext";

export function AppSidebar() {
  const [collapsedItem, setCollapsedItem] = useState<Record<string, boolean>>(
    {}
  );
  const router = useRouter();
  const { userRole, loading } = useUserRole();
  const { user } = useAuthUser();
  console.log(userRole, "user roleeee");
  console.log(user?.wallets, "userrrr");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const navigatePage = (routeName: string) => {
    return userRole?.name === "Admin"
      ? `/admin/${routeName}`
      : userRole?.name === "Store"
      ? `/store/${routeName}`
      : `/user/${routeName}`;
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
      roles: ["Admin", "CashierWeb", "Store"],
    },
    {
      name: "Product",
      icon: LayoutDashboard,
      href: navigatePage("product"),
      roles: ["Store"],
    },
    {
      name: "Packages",
      icon: Package,
      href: navigatePage("packages"),
      roles: ["Admin", "CashierWeb"],
    },
    // {
    //   name: "ETagTypes",
    //   icon: Tag,
    //   href: navigatePage("etagtypes"),
    //   roles: ["Admin", "CashierWeb"],
    // },

    // {
    //   name: "Zones",
    //   icon: LandPlot,
    //   href: navigatePage("zones"),
    //   roles: ["Admin"],
    // },
    {
      name: "Manage Stores",
      icon: Store,
      roles: ["Admin"],
      child: [
        {
          name: "Zones",
          icon: LandPlot,
          href: navigatePage("zones"),
        },
        {
          name: "Stores",
          icon: Store,
          href: navigatePage("stores"),
        },
        {
          name: "Services Stores",
          icon: Pizza,
          href: navigatePage("servicesStore"),
        },
      ],
    },
    {
      name: "VCards",
      icon: Tag,
      href: navigatePage("package-items"),
      roles: ["CashierWeb"],
    },
    {
      name: "Orders",
      icon: Tag,
      href: navigatePage("orders"),
      roles: ["CashierWeb"],
    },
    {
      name: "Reports",
      icon: MessageSquareWarning,
      href: navigatePage("reports"),
      roles: ["CashierWeb"],
    },
    {
      name: "Transactions",
      icon: ArrowRightLeft,
      href: navigatePage("transactions"),
      roles: ["CashierWeb"],
    },
    // {
    //   name: "Services Store",
    //   icon: Pizza,
    //   href: navigatePage("servicesStore"),
    //   roles: ["Admin"],
    // },
    // {
    //   name: "Wallet Type",
    //   icon: Wallet,
    //   href: navigatePage("walletTypes"),
    //   roles: ["Admin"],
    // },
    {
      name: "Manage Users",
      icon: User,
      roles: ["Admin"],
      child: [
        {
          name: "User Account",
          icon: User,
          href: navigatePage("usersAccount"),
        },
        {
          name: "Wallet Type",
          icon: Wallet,
          href: navigatePage("walletTypes"),
        },
      ],
    },
    {
      name: "WithDraw",
      icon: ArrowRightLeft,
      href: navigatePage("withdraws"),
      roles: ["CashierWeb"],
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  const handleCollapsedTrigger = (itemName: string) => {
    setCollapsedItem((prevState) => ({
      ...prevState,
      [itemName]: !prevState[itemName],
    }));
  };

  // Logout handler function
  const handleLogout = () => {
    AuthServices.logoutUser(); // Clear tokens and logout
    router.push("/auth"); // Redirect to auth page
  };

  // // Check if accessToken is present, if not, log out the user
  // useEffect(() => {
  //   const accessToken = localStorage.getItem("accessToken");
  //   if (!accessToken) {
  //     handleLogout(); // Trigger logout if token is missing
  //   }
  // }, []);

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(
                (item, i) =>
                  item.roles.includes(userRole?.name || "") &&
                  (item.child && item.child.length > 0 ? (
                    <Collapsible defaultOpen className="group/collapsible">
                      <SidebarMenuItem key={i}>
                        <CollapsibleTrigger
                          onClick={() => handleCollapsedTrigger(item.name)}
                          asChild
                        >
                          <SidebarMenuButton className="transition-transform duration-200">
                            <item.icon />
                            {item.name}
                            {collapsedItem[item.name] ? (
                              <ChevronDown
                                className={
                                  "ml-auto transition-transform duration-150"
                                }
                              />
                            ) : (
                              <ChevronRight
                                className={
                                  "ml-auto transition-transform duration-150"
                                }
                              />
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.child?.map((itemChild, childIndex) => (
                              <SidebarMenuSubItem key={childIndex}>
                                <Link href={itemChild.href}>
                                  <div className="flex items-center gap-3">
                                    <itemChild.icon size={15} />
                                    {itemChild.name}
                                  </div>
                                </Link>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ) : (
                    <SidebarMenuItem key={i}>
                      <SidebarMenuButton asChild>
                        <Link href={item.href ?? ""}>
                          <item.icon />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem key={user?.id}>
            <DropdownMenu>
              <div className="flex items-center w-full justify-between">
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center">
                    <SidebarMenuButton className="h-10">
                      {user ? (
                        <Avatar>
                          <AvatarImage
                            src="https://github.com/shadcn.png"
                            alt="@shadcn"
                            className="h-8 w-8 rounded-full"
                          />
                          <AvatarFallback className="text-white">
                            BT
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <Skeleton className="h-10 w-10 rounded-full" />
                      )}
                      {user?.fullName}

                      <ChevronUp className="ml-auto" />
                    </SidebarMenuButton>
                  </div>
                </DropdownMenuTrigger>
                <ThemeToggler />
              </div>
              <DropdownMenuContent side="top" className="w-10 md:ml-20">
                <DropdownMenuItem>
                  <Link href={"/profile"}>
                    <span>Account</span>
                  </Link>
                </DropdownMenuItem>
                {/* <DropdownMenuItem>
                  <span>Billing</span>
                </DropdownMenuItem> */}
                <DropdownMenuItem onClick={handleLogout}>
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
