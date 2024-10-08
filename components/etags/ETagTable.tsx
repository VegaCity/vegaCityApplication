"use client"
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import { ETag } from '@/types/etag';
import { ETagServices } from '../services/etagService';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface EtagTableProps {
  limit?: number;
  title?: string;
}

type SortField = 'startDate' | 'endDate';
type SortOrder = 'asc' | 'desc';

const EtagTable = ({ limit, title }: EtagTableProps) => {
  const [etagList, setEtagList] = useState<ETag[]>([]);
  const [filteredEtags, setFilteredEtags] = useState<ETag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('startDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);

  const fetchEtag = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await ETagServices.getETags({ page, size: pageSize });
      const etagtypes = Array.isArray(response.data.data) ? response.data.data : [];
      setEtagList(etagtypes);
      setFilteredEtags(etagtypes);
      setTotalPages(response.data.metaData.totalPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEtag(currentPage);
  }, [currentPage, pageSize]);

  useEffect(() => {
    const filtered = etagList.filter(etag => 
      etag.phoneNumber.includes(searchTerm) || etag.cccd.includes(searchTerm)
    );
    setFilteredEtags(filtered);
  }, [searchTerm, etagList]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedEtags = [...filteredEtags].sort((a, b) => {
    return sortOrder === 'asc' 
      ? new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime()
      : new Date(b[sortField]).getTime() - new Date(a[sortField]).getTime();
  });

  if (error) return <div>Error: {error}</div>;

  const limitedEtags = limit ? sortedEtags.slice(0, limit) : sortedEtags;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusString = (status: number) => {
    switch (status) {
      case 0: return { text: 'Inactive', color: 'bg-red-500' };
      case 1: return { text: 'Active', color: 'bg-green-500' };
      default: return { text: 'Block', color: 'bg-gray-500' };
    }
  };

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <div
      className="flex items-center cursor-pointer select-none"
      onClick={() => handleSort(field)}
    >
      <span>{label}</span>
      <div className="flex flex-col ml-1">
        <ChevronUp
          className={`h-3 w-3 ${
            sortField === field && sortOrder === 'asc'
              ? 'text-blue-500'
              : 'text-gray-400'
          }`}
        />
        <ChevronDown
          className={`h-3 w-3 ${
            sortField === field && sortOrder === 'desc'
              ? 'text-blue-500'
              : 'text-gray-400'
          }`}
        />
      </div>
    </div>
  );

  const ETagPagination = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          {pageNumbers.map((number) => (
            <PaginationItem key={number}>
              <PaginationLink
                href="#"
                onClick={() => setCurrentPage(number)}
                isActive={currentPage === number}
              >
                {number}
              </PaginationLink>
            </PaginationItem>
          ))}
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          <PaginationItem>
            <PaginationNext 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className='mt-10'>
      <h3 className='text-2xl mb-4 font-semibold'>{title || 'Etags'}</h3>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <Input
          type="text"
          placeholder="Search by Phone Number or CCCD"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2"
        />
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : limitedEtags.length > 0 ? (
        <>
          <Table>
            <TableCaption>A list of Etags</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>CCCD</TableHead>
                <TableHead>
                  <SortButton field="startDate" label="Start Date" />
                </TableHead>
                <TableHead>
                  <SortButton field="endDate" label="End Date" />
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {limitedEtags.map((etag) => {
                const statusInfo = getStatusString(etag.status);
                return (
                  <TableRow key={etag.id}>
                    <TableCell>{etag.fullName}</TableCell>
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
          <div className="mt-4">
            <ETagPagination />
          </div>
        </>
      ) : (
        <div>No Etags found</div>
      )}
    </div>
  );
};

export default EtagTable;