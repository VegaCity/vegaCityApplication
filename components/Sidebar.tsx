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

const Sidebar = () => {
  return (
    <Command className='bg-secondary rounded-none'>
      <CommandInput placeholder='Type a command or search...' />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading='Suggestions'>
          <CommandItem>
            <LayoutDashboard className='mr-2 h-4 w-4' />
            <Link href='/'>Dashboard</Link>
          </CommandItem>
          <CommandItem>
            <Newspaper className='mr-2 h-4 w-4' />
            <Link href='/posts'>Packages</Link>
          </CommandItem>
          <CommandItem>
            <Folders className='mr-2 h-4 w-4' />
            <Link href='#'>Categories</Link>
          </CommandItem>
          <CommandItem>
            <Tag className='mr-2 h-4 w-4' />
            <Link href='#'>E-Tag</Link>
          </CommandItem>
          <CommandItem>
            <MapPin className='mr-2 h-4 w-4' />
            <Link href='#'>Market Zonew</Link>
          </CommandItem>
          <CommandItem>
            <Store className='mr-2 h-4 w-4' />
            <Link href='#'>Store</Link>
          </CommandItem>
          <CommandItem>
            <User className='mr-2 h-4 w-4' />
            <Link href='#'>Users</Link>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading='Settings'>
          <CommandItem>
            <User className='mr-2 h-4 w-4' />
            <span>Profile</span>
            <CommandShortcut><PersonIcon/></CommandShortcut>
          </CommandItem>
          {/* <CommandItem>
            <CreditCard className='mr-2 h-4 w-4' />
            <span>Billing</span>
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem> */}
          <CommandItem>
            <Settings className='mr-2 h-4 w-4' />
            <span>Settings</span>
            <CommandShortcut><SettingsIcon/></CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
};

export default Sidebar;
