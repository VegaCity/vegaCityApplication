"use client";

import { AppSidebar } from "@/components/app-sidebar";
import Breadcrumb from "@/components/Breadcrumb";

import { useAuthUser } from "@/components/hooks/useAuthUser";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { redirect, usePathname } from "next/navigation";
import { useEffect } from "react";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const auth = useAuthUser;
  if (!auth) {
    redirect("/auth");
  }

  const breadcrumbItems = pathname
    .split("/")
    .filter(Boolean)
    .map((segment, index, arr) => {
      const isLast = index === arr.length - 1;
      return {
        label: segment,
        href: "/" + arr.slice(0, index + 1).join("/"),
        isLast,
      };
    });

  console.log(breadcrumbItems, "breadcrumbItems");

  return (
    <SidebarProvider>
      <>
        {/* <Navbar /> */}
        <div className="flex w-full">
          <div className="hidden md:block h-screen w-18">
            {/* <Sidebar /> */}
            <AppSidebar />
          </div>
          <div className="p-5 w-full md:block">
            <div className="fixed left-29 top-1">
              <SidebarTrigger />
            </div>
            <div className="overflow-y-auto">
              <>
                <div className="my-4">
                  <Breadcrumb items={breadcrumbItems} />
                </div>
                {children}
              </>
            </div>
          </div>
          {/* <Toaster /> */}
        </div>
      </>
    </SidebarProvider>
  );
};

export default MainLayout;
