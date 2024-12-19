"use client";

import { AppSidebar } from "@/components/app-sidebar";
import Breadcrumb from "@/components/Breadcrumb";

import { useAuthUser } from "@/components/hooks/useAuthUser";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { redirect, usePathname } from "next/navigation";
import storeProductBackground from "@/img/storeProductBackground.jpg";
import { AuthServices } from "@/components/services/authServices";
import { AxiosError } from "axios";
import { toast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { Loader } from "@/components/loader/Loader";
import { Button } from "@/components/ui/button";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const auth = useAuthUser;
  const [isLoading, setIsLoading] = useState(false);
  if (!auth) {
    redirect("/auth");
  }
  const storeType: string | null = localStorage.getItem("storeType"); //storeType is a string
  const isSession = localStorage.getItem("isSession") === "true";

  const disableUI = !isSession
    ? "pointer-events-none opacity-50 filter grayscale blur-sm relative before:absolute before:inset-0 before:bg-black/10 before:content-['']"
    : "";

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

  if (isLoading) return <Loader isLoading={isLoading} />;

  return (
    <SidebarProvider>
      {/* <Navbar /> */}
      <div
        style={
          Number(storeType) === 1
            ? { backgroundImage: "var(--fixed-background-store-product)" }
            : Number(storeType) === 2
            ? { backgroundImage: "var(--fixed-background-store-service)" }
            : { backgroundImage: "" }
        }
        className="flex w-full items-start justify-center bg-cover bg-center bg-no-repeat"
      >
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
