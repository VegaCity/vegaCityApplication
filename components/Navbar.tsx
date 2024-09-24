'use client';

import Image from 'next/image';
import Link from 'next/link';
import logo from '../img/logo.png';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ThemeToggler from '@/components/ThemeToggler';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthUser } from '@/components/hooks/useAuthUser';

const Navbar = () => {

  
  const { user, loading } = useAuthUser();

  console.log(user?.fullName, "userFullName")
  

  return (
    <div className='bg-hover-button dark:bg-slate-700 text-white py-2 px-5 flex justify-between'>
      <Link href='/'>
        <Image src={logo} alt='TraversyPress' width={50} />
      </Link>

      <div className='flex items-center'>
        <ThemeToggler />
        <DropdownMenu>
          {user ? 
            <Badge>
              <text>Welcome, {user?.fullName}</text>
            </Badge> : <Skeleton className="h-4 w-[150px]" />}
          <DropdownMenuTrigger className='focus:outline-none'>
            {user? 
            <Avatar>
              <AvatarImage src='https://github.com/shadcn.png' alt='@shadcn' />
              <AvatarFallback className='text-white'>BT</AvatarFallback>
            </Avatar> : <Skeleton className="h-10 w-10 rounded-full" />
            }
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>{user?.fullName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href='/profile'>Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href='/auth'>Logout</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Navbar;
