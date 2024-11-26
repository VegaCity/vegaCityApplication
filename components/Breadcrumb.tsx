// "use client";

// import { Slash } from "lucide-react";
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb";
// import { ReactNode, useEffect, useState } from "react";
// import { usePathname, useSearchParams } from "next/navigation";
// import { useUserRole } from "@/components/hooks/useUserRole";

// export default function BreadCrumbCustomize() {
//   const pathname = usePathname();
//   const searchParams = useSearchParams();
//   const { userRole } = useUserRole();
//   const authRouteName = userRole?.name.toLowerCase() as string;

//   useEffect(() => {
//     console.log("Pathname:", pathname);
//   }, [pathname]);

//   const splitPathnameFunc = (pathname: string): (string | null)[] => {
//     const splitName = pathname.split("/");

//     if (splitName.length >= 4) {
//       return [splitName[2], splitName[3]];
//     }

//     return [null, null];
//   };

//   const pathnameSplit = splitPathnameFunc(pathname);

//   const addSlashToPathname = (pathname: string | null): string | null => {
//     if (pathname) {
//       const slashPathname = "/" + authRouteName + "/" + pathname;
//       return slashPathname;
//     } else {
//       return null;
//     }
//   };

//   console.log(pathnameSplit, "splitname");
//   return (
//     <div className="mt-3">
//       <Breadcrumb>
//         <BreadcrumbList>
//           <BreadcrumbItem>
//             <BreadcrumbLink href="/">Home</BreadcrumbLink>
//           </BreadcrumbItem>
//           <BreadcrumbSeparator>
//             <Slash />
//           </BreadcrumbSeparator>
//           <BreadcrumbItem>
//             <BreadcrumbLink href={addSlashToPathname(pathnameSplit) || "/"}>
//               {pathnameSplit}
//             </BreadcrumbLink>
//           </BreadcrumbItem>
//         </BreadcrumbList>
//       </Breadcrumb>
//     </div>
//   );
// }

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";

// interface BreadcrumbProps {
//   items: { label: string; href: string; isLast: boolean }[];
// }
interface BreadcrumbProps {
  label: string;
  href: string;
  isLast: boolean;
}
[];

const Breadcrumb = () => {
  const pathname = usePathname();

  const breadcrumbItems = pathname
    .split("/")
    .filter(Boolean) // Exclude 'admin'
    .reduce((acc: BreadcrumbProps[], segment, index, arr) => {
      const href = "/" + arr.slice(0, index + 1).join("/");
      const isLast = index === arr.length - 1;

      // Combine dynamic segments like 'Package/Detail'
      if (segment === "detail" && index > 0) {
        const previousSegment = arr[index - 1];
        const combinedLabel = `${previousSegment}_detail`;
        acc.pop(); // Remove the last breadcrumb (previousSegment)
        acc.push({ label: combinedLabel, href, isLast });
      } else {
        acc.push({ label: segment, href, isLast });
      }

      return acc;
    }, []);

  return (
    <nav className="flex items-center space-x-2">
      {breadcrumbItems.map((item, index) => (
        <div
          key={item.href}
          className="flex items-center bg-black/15 p-2 rounded-lg"
        >
          {item.isLast ? (
            <span className="text-muted-foreground">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className="text-sky-500 hover:underline hover:text-sky-600 transition-colors"
            >
              {item.label}
            </Link>
          )}

          {index < breadcrumbItems.length - 1 && (
            <span className="mx-0.5">
              <ChevronRight size={15} />
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;
