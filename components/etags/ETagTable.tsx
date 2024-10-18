"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ChevronUp, ChevronDown, Search } from "lucide-react";
import { ETag } from "@/types/etag";
import { ETagServices } from "../services/etagService";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { API } from "@/components/services/api";
import { useRouter } from "next/navigation";
interface EtagTableProps {
  limit?: number;
  title?: string;
}

type SortField = "startDate" | "endDate" | "status";
type SortOrder = "asc" | "desc";

const EtagTable = ({ limit, title }: EtagTableProps) => {
  const [etagList, setEtagList] = useState<ETag[]>([]);
  const [filteredEtags, setFilteredEtags] = useState<ETag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [sortField, setSortField] = useState<SortField>("startDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const router = useRouter();
  const isValidGuid = (str: any) => {
    const guidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return guidPattern.test(str);
  };

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let response;
      if (searchTerm.startsWith("VGC")) {
        // Search by eTag code
        response = await ETagServices.getETagById(searchTerm);
      } else if (isValidGuid(searchTerm)) {
        // Search by eTag GUID
        response = await ETagServices.getETagById(searchTerm);
      } else {
        throw new Error("Invalid search format");
      }

      if (response.data.data && response.data.data.id) {
        // Navigate to the eTag detail page
        router.push(`/user/etags/detail/${response.data.data.id}`);
      } else {
        setError("eTag information not found");
      }
    } catch (err) {
      setError("No results found or an error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  const fetchEtag = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await ETagServices.getETags({ page, size: pageSize });
      const etagtypes = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      setEtagList(etagtypes);
      setFilteredEtags(etagtypes);
      setTotalPages(response.data.metaData.totalPage);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEtag(currentPage);
  }, [currentPage, pageSize]);

  useEffect(() => {
    const filtered = etagList.filter(
      (etag) =>
        etag.phoneNumber.includes(searchTerm) ||
        etag.cccd.includes(searchTerm) ||
        etag.etagCode.includes(searchTerm)
    );
    setFilteredEtags(filtered);
  }, [searchTerm, etagList]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedEtags = [...filteredEtags].sort((a, b) => {
    if (sortField === "status") {
      return sortOrder === "asc" ? a.status - b.status : b.status - a.status;
    } else {
      return sortOrder === "asc"
        ? new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime()
        : new Date(b[sortField]).getTime() - new Date(a[sortField]).getTime();
    }
  });

  if (error) return <div>Error: {error}</div>;

  // const limitedEtags = limit ? sortedEtags.slice(0, limit) : sortedEtags;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusString = (status: number) => {
    switch (status) {
      case 0:
        return { text: "Inactive", color: "bg-red-500", sortOrder: 0 };
      case 1:
        return { text: "Active", color: "bg-green-500", sortOrder: 1 };
      case 2:
        return { text: "Expired", color: "bg-yellow-500", sortOrder: 2 };
      case -1:
        return { text: "Block", color: "bg-gray-500", sortOrder: 3 };
      default:
        return { text: "Unknown", color: "bg-gray-500", sortOrder: 4 };
    }
  };

  const SortButton = ({
    field,
    label,
  }: {
    field: SortField;
    label: string;
  }) => (
    <div
      className="flex items-center cursor-pointer select-none"
      onClick={() => handleSort(field)}
    >
      <span>{label}</span>
      <div className="flex flex-col ml-1">
        <ChevronUp
          className={`h-3 w-3 ${
            sortField === field && sortOrder === "asc"
              ? "text-blue-500"
              : "text-gray-400"
          }`}
        />
        <ChevronDown
          className={`h-3 w-3 ${
            sortField === field && sortOrder === "desc"
              ? "text-blue-500"
              : "text-gray-400"
          }`}
        />
      </div>
    </div>
  );

  const ETagPagination = () => {
    const getPageNumbers = () => {
      const pageNumbers = [];
      if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        if (currentPage <= 4) {
          for (let i = 1; i <= 5; i++) {
            pageNumbers.push(i);
          }
          pageNumbers.push("ellipsis");
          pageNumbers.push(totalPages);
        } else if (currentPage >= totalPages - 3) {
          pageNumbers.push(1);
          pageNumbers.push("ellipsis");
          for (let i = totalPages - 4; i <= totalPages; i++) {
            pageNumbers.push(i);
          }
        } else {
          pageNumbers.push(1);
          pageNumbers.push("ellipsis");
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pageNumbers.push(i);
          }
          pageNumbers.push("ellipsis");
          pageNumbers.push(totalPages);
        }
      }
      return pageNumbers;
    };

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className={
                currentPage === 1 ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>
          {getPageNumbers().map((number, index) => (
            <PaginationItem key={index}>
              {number === "ellipsis" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href="#"
                  onClick={() => setCurrentPage(number as number)}
                  isActive={currentPage === number}
                >
                  {number}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };
  if (error) return <div>Error: {error}</div>;

  const limitedEtags = limit ? sortedEtags.slice(0, limit) : sortedEtags;
  return (
    <div className="mt-10">
      <h3 className="text-2xl mb-4 font-semibold">{title || "Etags"}</h3>
      <div className="relative mb-4">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Nhập mã eTagCode hoặc GUID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border rounded-md"
        />
      </div>
      <button
        onClick={handleSearch}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        disabled={isLoading}
      >
        {isLoading ? "Đang tìm kiếm..." : "Tìm kiếm"}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {searchResult && (
        <div className="mt-4">
          <h3 className="font-bold">Kết quả tìm kiếm:</h3>
          <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
            {JSON.stringify(searchResult, null, 2)}
          </pre>
        </div>
      )}

      <>
        <Table>
          <TableCaption>A list of Etags</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>CCCD</TableHead>
              <TableHead>EtagCode</TableHead>
              <TableHead>
                <SortButton field="startDate" label="Start Date & Time" />
              </TableHead>
              <TableHead>
                <SortButton field="endDate" label="End Date & Time" />
              </TableHead>
              <TableHead>
                <SortButton field="status" label="Status" />
              </TableHead>
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
                  <TableCell>{etag.etagCode}</TableCell>
                  <TableCell>{formatDate(etag.startDate)}</TableCell>
                  <TableCell>{formatDate(etag.endDate)}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-block text-white px-2 py-1 rounded ${statusInfo.color}`}
                    >
                      {statusInfo.text}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Link href={`/user/etags/detail/${etag.id}`}>
                      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-xs">
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
    </div>
  );
};

export default EtagTable;
