"use client";

import {
  ChevronLeft,
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
  Sparkle,
  Tags,
  LucideProps,
  UserCheck2,
  LogOut,
  Dot,
CheckCheck,
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
  SidebarTrigger,
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
import VegaLogo from "@/img/logo.png";
import { validImageUrl } from "@/lib/utils/checkValidImageUrl";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export function AppSidebar() {
  const [collapsedItem, setCollapsedItem] = useState<Record<string, boolean>>(
    {}
  );
  const router = useRouter();
  const { userRole, loading } = useUserRole();
  const { user } = useAuthUser();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const navigatePage = (routeName: string) => {
    return userRole?.name === "Admin"
      ? `/admin/${routeName}`
      : userRole?.name === "Store"
      ? `/store/${routeName}`
      : `/user/${routeName}`;
  };

  interface MenuItems {
    name: string;
    icon: React.ExoticComponent<
      Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
    >;
    roles: string[];
    href?: string;
    child?: {
      name: string;
      icon: React.ExoticComponent<
        Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
      >;
      href: string;
    }[];
  }

  const menuItems: MenuItems[] = [
    {
      name: "Store Information",
      icon: Store,
      href: navigatePage("info"),
      roles: ["Store"],
    },
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
      roles: ["Admin", "CashierWeb", "Store"],
    },
    {
      name: "ProductCategory",
      icon: LayoutDashboard,
      href: navigatePage("productCategory"),
      roles: ["Store"],
    },
    {
      name: "Menu",
      icon: LayoutDashboard,
      href: navigatePage("menu"),
      roles: ["Store"],
    },
    {
      name: "Reports",
      icon: LayoutDashboard,
      href: navigatePage("report"),
      roles: ["Store"],
    },
    {
      name: "Packages",
      icon: Package,
      href: navigatePage("packages"),
      roles: ["CashierWeb"],
    },
    {
      name: "Manage Packages",
      icon: Package,
      roles: ["Admin"],
      href: navigatePage("packages"),
    },
    {
      name: "Orders",
      icon: Tag,
      href: navigatePage("order"),
      roles: ["Store"],
    },
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
    {
      name: "Reports",
      icon: Wallet,
      href: navigatePage("reports"),
      roles: ["CashierWeb"],
    },
    {
      name: "Issue Report",
      icon: Wallet,
      href: navigatePage("isssue-types"),
      roles: ["CashierWeb"],
    },
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
        {
          name: "User Session",
          icon: UserCheck2,
          href: navigatePage("userSession"),
        },
      ],
    },
    {
      name: "WithDraw",
      icon: ArrowRightLeft,
      href: navigatePage("withdraws"),
      roles: ["CashierWeb"],
    },
    {
      name: "Promotions",
      icon: Sparkle,
      href: navigatePage("promotions"),
      roles: ["Admin"],
    },
    {
      name: "User Deposit Approval",
      icon: CheckCheck,
      href: navigatePage("userDepositApproval"),
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

  // Navigate Account Page
  const handleNavigateAccountPage = () => {
    router.push("/profile");
  };

  // // Check if accessToken is present, if not, log out the user
  // useEffect(() => {
  //   const accessToken = localStorage.getItem("accessToken");
  //   if (!accessToken) {
  //     handleLogout(); // Trigger logout if token is missing
  //   }
  // }, []);

  return (
    <>
      <div className="fixed left-0 top-1">
        <Tooltip>
          <TooltipTrigger>
            <SidebarTrigger size={"lg"} className="hover:bg-hover-button" />
          </TooltipTrigger>
          <TooltipContent side="right">Open Sidebar</TooltipContent>
        </Tooltip>
      </div>
      <Sidebar className="border-customBorder">
        <div className="w-min">
          <Tooltip>
            <TooltipTrigger>
              <SidebarTrigger className="w-12 h-12 hover:text-text-button hover:bg-hover-button" />
            </TooltipTrigger>
            <TooltipContent side="right">Close Sidebar</TooltipContent>
          </Tooltip>
        </div>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="h-20 flex items-center justify-center">
              <img src={VegaLogo.src} width={100} alt="logo" />
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem key={user?.id}>
                  <div className="flex items-center w-full justify-between">
                    <div className="flex items-center">
                      <SidebarMenuButton
                        onClick={handleNavigateAccountPage}
                        className="h-10"
                      >
                        {user ? (
                          <Avatar>
                            <AvatarImage
                              src={validImageUrl(user.imageUrl || "")}
                              alt="userAva"
                              className="h-8 w-8 rounded-full"
                            />
                            <AvatarFallback className="text-white">
                              Avatar
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <Skeleton className="h-10 w-10 rounded-full" />
                        )}
                        {user?.fullName}
                      </SidebarMenuButton>
                    </div>
                    <ThemeToggler />
                  </div>
                </SidebarMenuItem>
                <SidebarSeparator />
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
                              <item.icon size={20} />
                              <span className="text-base">{item.name}</span>
                              {collapsedItem[item.name] ? (
                                <ChevronLeft
                                  className={
                                    "ml-auto transition-transform duration-150"
                                  }
                                />
                              ) : (
                                <ChevronDown
                                  className={
                                    "ml-auto transition-transform duration-150"
                                  }
                                />
                              )}
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            {Array.isArray(item.child) &&
                              item.child.length > 0 &&
                              item.child.map((itemChild, childIndex) => (
                                <SidebarMenuSub>
                                  <SidebarMenuSubItem key={childIndex}>
                                    <Link href={itemChild?.href || ""}>
                                      <SidebarMenuButton>
                                        <div className="flex items-center gap-3">
                                          <itemChild.icon size={20} />
                                          <span className="text-md">
                                            {itemChild?.name}
                                          </span>
                                        </div>
                                      </SidebarMenuButton>
                                    </Link>
                                  </SidebarMenuSubItem>
                                </SidebarMenuSub>
                              ))}
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    ) : (
                      <SidebarMenuItem key={i}>
                        <SidebarMenuButton asChild>
                          <Link href={item.href ?? ""}>
                            <item.icon size={20} />
                            <span className="text-base">{item.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            {/* <SidebarMenuItem key={user?.id}>
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
                <DropdownMenuItem onClick={handleNavigateAccountPage}>
                  <div className="flex flex-row items-center justify-between w-full group hover:bg-gray-100 p-2 rounded">
                    <span className="text-gray-700 group-hover:text-sky-500 dark:text-white">
                      Account
                    </span>
                    <User2
                      size={15}
                      className="text-gray-700 group-hover:text-sky-500 transition-transform duration-200 group-hover:scale-110 dark:text-white"
                    />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <div className="flex flex-row items-center justify-between w-full group hover:bg-gray-100 p-2 rounded">
                    <span className="text-gray-700 group-hover:text-red-500 dark:text-white">
                      Sign out
                    </span>
                    <LogOut
                      size={15}
                      className="text-gray-700 group-hover:text-red-500 transition-transform duration-200 group-hover:scale-110 dark:text-white"
                    />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleLogout}>
                  <div className="flex flex-row items-center justify-between w-full group hover:bg-gray-100 p-2 rounded">
                    <span className="text-gray-700 group-hover:text-red-500 dark:text-white">
                      Sign out
                    </span>
                    <LogOut
                      size={15}
                      className="text-gray-700 group-hover:text-red-500 transition-transform duration-200 group-hover:scale-110 dark:text-white"
                    />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem> */}
            {/* <div className="absolute right-0 bottom-12 flex-col justify-end items-end mb-2">
            <ThemeToggler />
          </div> */}
            <SidebarSeparator />
            {/* <SidebarMenuItem> */}
            <button onClick={handleLogout} className="sign-out-button peer">
              <div className="group hover:bg-red-300 flex items-center justify-end gap-2 w-full p-2 rounded">
                <span className="group-hover:text-red-500 font-bold dark:text-white text-lg">
                  Sign out
                </span>
                <LogOut
                  size={15}
                  className="group-hover:text-red-500 font-bold transition-transform duration-200 group-hover:scale-110 dark:text-white"
                />
              </div>
            </button>
            {/* </SidebarMenuItem> */}
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
