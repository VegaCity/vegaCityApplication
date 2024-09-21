import BackButton from '@/components/BackButton';
import PackagesPagination from '@/components/packages/PackagesPagination';
import PackageTable from '@/components/packages/PackagesTable';
import Link from 'next/link';

const PackagesPage = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <BackButton text='Go Back' link='/' />
        <Link href="/packages/create" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Create New Package
        </Link>
      </div>
      <PackageTable />
      <PackagesPagination />
    </div>
  );
};

export default PackagesPage;
