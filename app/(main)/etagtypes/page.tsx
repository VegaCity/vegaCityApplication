import Link from 'next/link';
import BackButton from '@/components/BackButton';
import EtagTypeTable from '@/components/etagtypes/ETagsTable';
import ETagsPagination from '@/components/etagtypes/ETagTypesPagination';

const ETagsPage = () => {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <BackButton text='Go Back' link='/' />
          <Link href="/etagtypes/create" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Create New ETag
          </Link>
        </div>
        <EtagTypeTable />
        <ETagsPagination />
      </div>
    );
  };
  
  export default ETagsPage;