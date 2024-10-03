'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { ETag } from '@/types/etag';
import { ETagServices } from '../services/etagService';

interface EtagTableProps {
  limit?: number;
  title?: string;
}

const EtagTable = ({ limit, title }: EtagTableProps) => {
  const [etagList, setEtagList] = useState<ETag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEtag = async () => {
    setIsLoading(true);
    try {
      const response = await ETagServices.getETags({ page: 1, size: 10 });
      const etagtypes = Array.isArray(response.data.items) ? response.data.items : [];
      setEtagList(etagtypes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEtag();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const filteredEtags = limit ? etagList.slice(0, limit) : etagList;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusString = (status: number) => {
    switch (status) {
      case 0: return { text: 'Active', color: 'bg-green-500' }; 
      case 1: return { text: 'Inactive', color: 'bg-red-500' }; 
      default: return { text: 'Unknown', color: 'bg-gray-500' }; 
    }
  };

  return (
    <div className='mt-10'>
      <h3 className='text-2xl mb-4 font-semibold'>{title || 'Etags'}</h3>
      {filteredEtags.length > 0 ? (
        <Table>
          <TableCaption>A list of recent Etags</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>CCCD</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEtags.map((etag) => {
              const statusInfo = getStatusString(etag.status);
              return (
                <TableRow key={etag.id}>
                  <TableCell>{etag.fullname}</TableCell>
                  <TableCell>{etag.phoneNumber}</TableCell>
                  <TableCell>{etag.cccd}</TableCell>
                  <TableCell>{formatDate(etag.startDate)}</TableCell>
                  <TableCell>{formatDate(etag.endDate)}</TableCell>
                  <TableCell>
                    <span className={`inline-block text-white px-2 py-1 rounded ${statusInfo.color}`}>
                      {statusInfo.text}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Link href={`/user/etags/detail/${etag.id}`}>
                      <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-xs'>
                        View Details
                      </button>
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <div>No data available</div>
      )}
    </div>
  );
};

export default EtagTable;
