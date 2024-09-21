'use client';

import {
  Command,
  CommandList,
  CommandItem,
  CommandSeparator,
  CommandGroup,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  Newspaper,
  Folders,
  Settings,
  User,
  Tag,
  Store,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';

const Sidebar = () => {
  return (
    <Command className="bg-secondary rounded-none">
      <CommandList>
        <CommandItem className="hover:hover:bg-hover-button hover:hover:text-cyan-100 transition-colors flex flex-col items-center p-3">
          <LayoutDashboard className="h-6 w-8 mb-3" />
          <Link href="/">Dashboard</Link>
        </CommandItem>
        <CommandItem className="hover:hover:bg-hover-button hover:hover:text-cyan-100 transition-colors flex flex-col items-center p-3">
          <Newspaper className="h-6 w-8 mb-3" />
          <Link href="/packages">Packages</Link>
        </CommandItem>
        {/* <CommandItem className="hover:hover:bg-hover-button hover:hover:text-cyan-100 transition-colors flex flex-col items-center p-3">
          <Folders className="h-6 w-8 mb-3" />
          <Link href="/categories">Categories</Link>
        </CommandItem> */}
        <CommandItem className="hover:hover:bg-hover-button hover:hover:text-cyan-100 transition-colors flex flex-col items-center p-3">
          <Tag className="h-6 w-8 mb-3" />
          <Link href="/e-tag">E-Tag</Link>
        </CommandItem>
        <CommandItem className="hover:hover:bg-hover-button hover:hover:text-cyan-100 transition-colors flex flex-col items-center p-3">
          <MapPin className="h-6 w-8 mb-3" />
          <Link href="/market-zone">Market Zone</Link>
        </CommandItem>
        <CommandItem className="hover:hover:bg-hover-button hover:hover:text-cyan-100 transition-colors flex flex-col items-center p-3">
          <Store className="h-6 w-8 mb-3" />
          <Link href="/store">Store</Link>
        </CommandItem>
        <CommandItem className="hover:hover:bg-hover-button hover:hover:text-cyan-100 transition-colors flex flex-col items-center p-3">
          <User className="h-6 w-8 mb-3" />
          <Link href="/users">Users</Link>
        </CommandItem>
        {/* <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem className="hover:bg-hover-button hover:text-cyan-100 transition-colors flex flex-col items-center p-3">
            <User className="h-6 w-6 mb-3" />
            <Link href="/profile">Profile</Link>
          </CommandItem>
          <CommandItem className="hover:bg-hover-button hover:text-cyan-100 transition-colors flex flex-col items-center p-3">
            <Settings className="h-6 w-6 mb-3" />
            <Link href="/settings">Settings</Link>
          </CommandItem>
        </CommandGroup> */}
      </CommandList>
    </Command>
  );
};

export default Sidebar