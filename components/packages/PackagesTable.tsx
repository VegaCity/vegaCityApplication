"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { PackageServices } from '@/components/services/packageServices';
import { Packages } from '@/types/package';

interface PackageTableProps {
  limit?: number;
  title?: string;
}

const PackageTable = ({ limit, title }: PackageTableProps) => {
  const [packageList, setPackageList] = useState<Packages[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    
    setIsLoading(true);
    const fetchPackages = async () => {
      try {
        const response = await PackageServices.getPackages({ page: 1, size: 10 });
        setPackageList(response.data);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setIsLoading(false);
      }
    };

    fetchPackages();

  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const filteredPackages = limit ? packageList.slice(0, limit) : packageList;

  return (
    <div className='mt-10'>
      <h3 className='text-2xl mb-4 font-semibold'>{title || 'Packages'}</h3>
      {filteredPackages.length > 0 ? (
        <Table>
          <TableCaption>A list of recent packages</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className='hidden md:table-cell'>Description</TableHead>
              <TableHead className='hidden md:table-cell text-right'>Price</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPackages.map((pkg) => (
              <TableRow key={pkg.id}>
                <TableCell>{pkg.name}</TableCell>
                <TableCell className='hidden md:table-cell'>{pkg.description}</TableCell>
                <TableCell className='text-right hidden md:table-cell'>{pkg.price}</TableCell>
                <TableCell>
                  <Link href={`/packages/edit/${pkg.id}`}>
                    <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-xs mr-2'>
                      Edit
                    </button>
                  </Link>
                  <Link href={`/packages/delete/${pkg.id}`}>
                    <button className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-xs'>
                      Delete
                    </button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div>No packages available.</div>
      )}
    </div>
  );
};

export default PackageTable;