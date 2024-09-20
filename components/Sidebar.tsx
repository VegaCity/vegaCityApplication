// 'use client';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  Newspaper,
  Folders,
  CreditCard,
  Settings,
  User,
  Tag,
  Store,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import { useState } from 'react';
import clsx from 'clsx';

const Sidebar = () => {

  return (
    <Command className='bg-secondary rounded-none'>
      {/* <CommandInput placeholder='Type a command or search...' /> */}
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading='Suggestions'>
          <CommandItem className='hover:hover:bg-hover-button hover:hover:text-cyan-100 transition-colors flex flex-col items-start p-3'>
            <LayoutDashboard className='h-8 w-8 mb-3' /> 
            <Link href='/'>Dashboard</Link>
          </CommandItem>
          <CommandItem className='hover:hover:bg-hover-button hover:hover:text-cyan-100 transition-colors flex flex-col items-start p-3'>
            <Newspaper className='h-8 w-8 mb-3' />
            <Link href='/posts'>Packages</Link>
          </CommandItem>
          <CommandItem className='hover:hover:bg-hover-button hover:hover:text-cyan-100 transition-colors flex flex-col items-start p-3'>
            <Folders className='h-8 w-8 mb-3' />
            <Link href='#'>Categories</Link>
          </CommandItem>
          <CommandItem className='hover:hover:bg-hover-button hover:hover:text-cyan-100 transition-colors flex flex-col items-start p-3'>
            <Tag className='h-8 w-8 mb-3' />
            <Link href='#'>E-Tag</Link>
          </CommandItem>
          <CommandItem className='hover:hover:bg-hover-button hover:hover:text-cyan-100 transition-colors flex flex-col items-start p-3'>
            <MapPin className='h-8 w-8 mb-3' />
            <Link href='#'>Market Zone</Link>
          </CommandItem>
          <CommandItem className='hover:hover:bg-hover-button hover:hover:text-cyan-100 transition-colors flex flex-col items-start p-3'>
            <Store className='h-8 w-8 mb-3' />
            <Link href='#'>Store</Link>
          </CommandItem>
          <CommandItem className='hover:hover:bg-hover-button hover:hover:text-cyan-100 transition-colors flex flex-col items-start p-3'>
            <User className='h-8 w-8 mb-3' />
            <Link href='#'>Users</Link>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading='Settings'>
          <CommandItem className='hover:hover:bg-hover-button hover:hover:text-cyan-100 transition-colors flex flex-col items-start p-3'>
            <User className='h-6 w-6 mb-3' />
            <span>Profile</span>
            <CommandShortcut><PersonIcon/></CommandShortcut>
          </CommandItem>
          {/* <CommandItem>
            <CreditCard className='h-8 w-8 mb-3' />
            <span>Billing</span>
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem> */}
          <CommandItem className='hover:hover:bg-hover-button hover:hover:text-cyan-100 transition-colors flex flex-col items-start p-3'>
            <Settings className='h-6 w-6 mb-3' />
            <span>Settings</span>
            <CommandShortcut><SettingsIcon/></CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
};

export default Sidebar;
