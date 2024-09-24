'use client';

import BackButton from '@/components/BackButton';
import PackagesPagination from '@/components/packages/PackagesPagination';
import PackageTable from '@/components/packages/PackagesTable';
import Link from 'next/link';
import { useAuthUser } from '@/components/hooks/useAuthUser'; 
import { Role, roles } from '@/types/role';
import { useUserRole } from '@/components/hooks/useUserRole';


const PackagesPage = () => {
  // const {user, loading: userLoading} = useAuthUser();
  // const userRoleId: string | null = user?.roleId || null;
  // console.log(userRoleId, 'userRoleId');
  // const getUserRole = roles.find(({id}) => id === userRoleId); // Role type {id, name, deflag}
  // console.log(getUserRole?.id, 'Get Role');
  const {userRole, loading } = useUserRole(); //userRole is an object so that u should . to value like userRole.name, userRole.id
  console.log(userRole?.name, 'userRole');

  if(userRole && userRole.name !== 'CashierWeb'){
    return <div>You have denined to access this Page!</div>
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div>Cashier Web Nè</div>
        <BackButton text='Go Back' link='/' />
        <Link href="/user/packages/create" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Create New Package
        </Link>
      </div>
      <PackageTable />
      <PackagesPagination />
    </div>
  );
};

export default PackagesPage;
