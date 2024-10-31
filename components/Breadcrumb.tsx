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

interface BreadcrumbProps {
  items: { label: string; href: string; isLast: boolean }[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav aria-label="breadcrumb" className="flex items-center space-x-2">
      {items.slice(1).map(
        //use slice to delete /admin href
        (item, index) => (
          <div key={index} className="flex items-center">
            {/* {!item.isLast ? (
              <Link
                href={item.href}
                className="text-sky-500 hover:underline hover:text-sky-600 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )} */}
            <span className="p-2 rounded-full bg-slate-100 text-sky-500 hover:text-sky-600 transition-colors">
              {item.label}
            </span>

            {index < items.length - 1 && (
              <span className="mx-0.5">
                <ChevronRight size={15} />
              </span>
            )}
          </div>
        )
      )}
    </nav>
  );
};

export default Breadcrumb;
