"use client";

import { AppSidebar } from "@/components/app-sidebar";
import Breadcrumb from "@/components/Breadcrumb";

import { useAuthUser } from "@/components/hooks/useAuthUser";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { redirect, usePathname } from "next/navigation";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const auth = useAuthUser;
  if (!auth) {
    redirect("/auth");
  }

  // const breadcrumbItems = pathname
  //   .split("/")
  //   .filter(Boolean)
  //   .map((segment, index, arr) => {
  //     const isLast = index === arr.length - 1;
  //     return {
  //       label: segment,
  //       href: "/" + arr.slice(0, index + 1).join("/"),
  //       isLast,
  //     };
  //   });

  // console.log(breadcrumbItems, "breadcrumbItems");

  return (
    <SidebarProvider>
      {/* <Navbar /> */}
      <div className="flex w-full items-start justify-center">
        {/* Sidebar on the left */}
        <div className="hidden sm:block h-screen w-auto">
          <AppSidebar />
        </div>

        {/* Main content area */}
        <div className="p-5 w-full">
          {/* Breadcrumb */}
          <div className="my-4">
            <Breadcrumb />
          </div>

          {/* Centered children content */}
          <div className="flex p-5 items-center justify-center">
            <div className="w-full max-w-full">{children}</div>
            {/* Adjust the max-width to your preference */}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
