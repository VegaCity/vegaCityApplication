'use client';

import React from 'react';
import {
  Command,
  CommandList,
  CommandItem
} from '@/components/ui/command';
import {
  LayoutDashboard,
  Package,
  Tag,
  Store,
  User,
  WarehouseIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useUserRole } from '@/components/hooks/useUserRole';

const Sidebar = () => {
  const { userRole, loading } = useUserRole();

  const navigatePage = (routeName: string) => {
    if (userRole && userRole.name === 'Admin') {
      return `/admin/${routeName}`;
    } else {
      return `/user/${routeName}`;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Command className="bg-secondary rounded-none">
      <CommandList>
        <Link href="/" className="block">
          <CommandItem className="hover:hover:bg-hover-button hover:hover:text-cyan-100 transition-colors flex flex-col items-center p-3 cursor-pointer">
            <LayoutDashboard className="h-6 w-8 mb-3" />
            Dashboard
          </CommandItem>
        </Link>

        {userRole && (userRole.name === 'Admin' || userRole.name === 'CashierWeb') && (
          <>
            <Link href={navigatePage('packages')} className="block">
              <CommandItem className="hover:hover:bg-hover-button hover:hover:text-cyan-100 transition-colors flex flex-col items-center p-3 cursor-pointer">
                <Package className="h-6 w-8 mb-3" />
                Packages
              </CommandItem>
            </Link>

            <Link href={navigatePage('etagtypes')} className="block">
              <CommandItem className="hover:hover:bg-hover-button hover:hover:text-cyan-100 transition-colors flex flex-col items-center p-3 cursor-pointer">
                <Tag className="h-6 w-8 mb-3" />
                ETagTypes
              </CommandItem>
            </Link>
          </>
        )}
        {userRole && userRole.name === 'CashierWeb' && (
          <Link href={navigatePage('etags')} className="block">
            <CommandItem className="hover:hover:bg-hover-button hover:hover:text-cyan-100 transition-colors flex flex-col items-center p-3 cursor-pointer">
              <Tag className="h-6 w-8 mb-3" />
              ETag
            </CommandItem>
          </Link>

        )}
        {/* {userRole && userRole.name === 'Admin' && ( */}
          <>
            <Link href={('/admin/zones')} className="block">
              <CommandItem className="hover:hover:bg-hover-button hover:hover:text-cyan-100 transition-colors flex flex-col items-center p-3 cursor-pointer">
                <Store className="h-6 w-8 mb-3" />
                Zones
              </CommandItem>
            </Link>
            <Link href={('/admin/houses')} className="block">
              <CommandItem className="hover:hover:bg-hover-button hover:hover:text-cyan-100 transition-colors flex flex-col items-center p-3 cursor-pointer">
                <WarehouseIcon className="h-6 w-8 mb-3" />
                Houses
              </CommandItem>
            </Link>

            <Link href="/users" className="block">
              <CommandItem className="hover:hover:bg-hover-button hover:hover:text-cyan-100 transition-colors flex flex-col items-center p-3 cursor-pointer">
                <User className="h-6 w-8 mb-3" />
                Users
              </CommandItem>
            </Link>
          </>
        {/* )} */}
      </CommandList>
    </Command>
  );
};

export default Sidebar;