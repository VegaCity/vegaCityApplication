'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { EtagType } from '@/types/etagtype';
import { ETagTypeServices } from '../services/etagtypeServices';
import { useToast } from '@/components/ui/use-toast';
import ConfirmDeleteModal from '../ui/modal'; 

interface EtagTypeTableProps {
  limit?: number;
  title?: string;
}

const EtagTypeTable = ({ limit, title }: EtagTypeTableProps) => {
  const [etagtypeList, setEtagTypeList] = useState<EtagType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchEtags = async () => {
    setIsLoading(true);
    try {
      const response = await ETagTypeServices.getETagTypes({ page: 1, size: 10 });
      const etagtypes = Array.isArray(response.data.items) ? response.data.items : [];
      setEtagTypeList(etagtypes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEtags();
  }, []);

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await ETagTypeServices.deleteEtagTypeById(deleteId);
        toast({ title: 'Etag Type deleted successfully' });
        fetchEtags();
      } catch (err) {
        toast({ title: 'Error deleting Etag Type', description: err instanceof Error ? err.message : 'An unknown error occurred', variant: 'destructive' });
      } finally {
        setIsModalOpen(false);
        setDeleteId(null);
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const filteredEtags = limit ? etagtypeList.slice(0, limit) : etagtypeList;

  const formatBonusRate = (bonusRate: number) => {
    return `${(bonusRate * 100).toFixed(1)}%`;
  };

  return (
    <div className='mt-10'>
      <h3 className='text-2xl mb-4 font-semibold'>{title || 'Etag Types'}</h3>
      {filteredEtags.length > 0 ? (
        <Table>
          <TableCaption>A list of recent Etag types</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className='hidden md:table-cell'>Image</TableHead> {/* Thêm cột cho hình ảnh */}
              <TableHead className='hidden md:table-cell'>Bonus Rate</TableHead>
              <TableHead className='hidden md:table-cell'>Amount</TableHead>
              <TableHead className='hidden md:table-cell'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEtags.map((etag) => (
              <TableRow key={etag.id}>
                <TableCell>{etag.name}</TableCell>
                <TableCell className='hidden md:table-cell'>
                  <img src={etag.imageUrl} alt={etag.name} className="w-16 h-16 object-cover rounded" /> {/* Hiển thị hình ảnh */}
                </TableCell>
                <TableCell className='hidden md:table-cell'>{formatBonusRate(etag.bonusRate)}</TableCell>
                <TableCell className='hidden md:table-cell'>{etag.amount}</TableCell>
                <TableCell>
                  <Link href={`/user/etagtypes/edit/${etag.id}`}>
                    <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-xs mr-2'>
                      Edit
                    </button>
                  </Link>
                  <button 
                    onClick={() => {
                      setDeleteId(etag.id);
                      setIsModalOpen(true);
                    }}
                    className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-xs'
                  >
                    Delete
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div>No Etag types available.</div>
      )}
      <ConfirmDeleteModal 
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default EtagTypeTable;
