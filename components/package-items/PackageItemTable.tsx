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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ChevronUp, ChevronDown, Search } from "lucide-react";
import { PackageItemServices } from "../services/packageItemService";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useRouter } from "next/navigation";
import { ComboboxCustom } from "../ComboboxCustomize/ComboboxCustom";
import LostPackageItemDialog from "@/lib/dialog/lostDialog";
import GenerateNewCardDialog from "@/lib/dialog/generateLost";
import PackageItemAction from "../popover/PackageAction";
interface PackageItem {
  id: string;
  packageId: string;
  cccdpassport: string | null;
  email: string | null;
  gender: string | null;
  name: string | null;
  phoneNumber: string | null;
  rfid: string | null;
  status: string;
  crDate: string;
  updateDate: string;
  walletId: string;
  isChanged: boolean;
  isAdult: boolean | null;
  endDate: string | null;
}

interface PackageItemTableProps {
  limit?: number;
  title?: string;
}
type SortField = "crDate" | "updateDate" | "status";
type SortOrder = "asc" | "desc";
const PackageItemTable = ({ limit, title }: PackageItemTableProps) => {
  const [packageItems, setPackageItems] = useState<PackageItem[]>([]);
  const [filteredPackageItems, setFilteredPackageItems] = useState<
    PackageItem[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("crDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(50);
  const [statusOpen, setStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingPackageItemId, setDeletingPackageItemId] = useState<
    string | null
  >(null);
  const router = useRouter();
  const [isLostDialogOpen, setIsLostDialogOpen] = useState(false);
  const [selectedPackageItem, setSelectedPackageItem] =
    useState<PackageItem | null>(null);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const statusOptions = [
    { value: "", label: "All" },
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
    { value: "Expired", label: "Expired" },
    { value: "Blocked", label: "Blocked" },
  ];
  const isValidUUID = (str: string) => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };
  const handleSearchChange = async (value: string) => {
    setSearchTerm(value);

    try {
      // Gọi API để lấy thông tin package item dựa trên ID
      const responseById = await PackageItemServices.getPackageItemById({
        id: value.trim(),
      });

      // Nếu có dữ liệu trả về, chuyển hướng đến trang chi tiết của package item
      if (responseById.data) {
        router.push(`/user/package-items/detail/${value.trim()}`);
        return;
      }
    } catch (error) {
      console.log("ID không tồn tại, tiếp tục tìm kiếm bằng RFID");
    }

    try {
      const responseByRfId = await PackageItemServices.getPackageItemById({
        rfId: value.trim(),
      });
      if (responseByRfId.data) {
        router.push(
          `/user/package-items/detail/${responseByRfId.data.data.id}`
        );
        return;
      }
    } catch (error) {
      console.log("RFID không tồn tại, tiếp tục tìm kiếm thông thường");
    }
  };
  const debouncedHandleSearch = debounce(handleSearchChange, 300);
  const fetchPackageItems = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await PackageItemServices.getPackageItems({
        page,
        size: pageSize,
      });
      const items = response.data.data;
      setPackageItems(items);
      setFilteredPackageItems(items);
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
    fetchPackageItems(currentPage);
  }, [currentPage, pageSize]);

  useEffect(() => {
    const filtered = packageItems.filter((item) => {
      const matchesStatus = !selectedStatus || item.status === selectedStatus;
      const matchesSearch =
        !searchTerm ||
        item.cccdpassport?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortField === "status") {
        return sortOrder === "asc"
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      }

      const aDate = new Date(a[sortField]).getTime();
      const bDate = new Date(b[sortField]).getTime();
      return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
    });

    setFilteredPackageItems(sorted);
  }, [searchTerm, selectedStatus, packageItems, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500";
      case "Inactive":
        return "bg-yellow-500";
      case "Expired":
        return "bg-red-500";
      case "Blocked":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
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

  const PackageItemPagination = () => {
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

  return (
    <div className="mt-10">
      <h3 className="text-2xl mb-4 font-semibold">
        {title || "Package Items"}
      </h3>

      <div className="flex items-center space-x-4 mb-4">
        <div className="relative flex-1 md:max-w-xs" style={{ width: "300px" }}>
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by ID, CCCD, Name, or Phone"
            value={searchTerm}
            onChange={(e) => debouncedHandleSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-md"
          />
        </div>

        <ComboboxCustom
          open={statusOpen}
          setOpen={setStatusOpen}
          value={selectedStatus}
          setValue={setSelectedStatus}
          filterList={statusOptions}
          placeholder="Select Status"
        />
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <Table>
        <TableCaption>A list of Package Items</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold text-white whitespace-nowrap">
              No
            </TableHead>
            <TableHead className="font-bold text-white whitespace-nowrap">
              CCCD/Passport
            </TableHead>
            <TableHead className="font-bold text-white whitespace-nowrap">
              Name
            </TableHead>
            <TableHead className="font-bold text-white whitespace-nowrap">
              Phone Number
            </TableHead>
            <TableHead className="font-bold text-white whitespace-nowrap">
              Is Adult
            </TableHead>
            <TableHead className="font-bold text-white whitespace-nowrap">
              <SortButton field="crDate" label="Created Date" />
            </TableHead>

            <TableHead className="font-bold text-white whitespace-nowrap">
              <SortButton field="status" label="Status" />
            </TableHead>
            <TableHead className="font-bold text-white whitespace-nowrap ">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPackageItems.map((item, index) => (
            <TableRow key={item.id}>
              <TableCell>{(currentPage - 1) * pageSize + index + 1}</TableCell>
              <TableCell>{item.cccdpassport || "-"}</TableCell>
              <TableCell>{item.name || "-"}</TableCell>
              <TableCell>{item.phoneNumber || "-"}</TableCell>
              <TableCell>{item.isAdult ? "Adult" : "Child"}</TableCell>
              <TableCell>{formatDate(item.crDate)}</TableCell>

              <TableCell>
                <span
                  className={`inline-block text-white px-2 py-1 rounded ${getStatusColor(
                    item.status
                  )}`}
                >
                  {item.status}
                </span>
              </TableCell>
              <TableCell>
                <PackageItemAction
                  packageItem={item}
                  onLost={(item) => {
                    setSelectedPackageItem(item);
                    setIsLostDialogOpen(true);
                  }}
                  onGenerateNewCard={(item) => {
                    setSelectedPackageItem(item);
                    setIsGenerateDialogOpen(true);
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4">
        <PackageItemPagination />
      </div>
      <LostPackageItemDialog
        isOpen={isLostDialogOpen}
        onClose={() => {
          setIsLostDialogOpen(false);
          setSelectedPackageItem(null);
        }}
        packageItem={selectedPackageItem}
        onSuccess={() => {
          fetchPackageItems(currentPage);
        }}
      />
      <GenerateNewCardDialog
        isOpen={isGenerateDialogOpen}
        onClose={() => setIsGenerateDialogOpen(false)}
        packageItem={selectedPackageItem}
        onSuccess={() => {
          fetchPackageItems(currentPage);
        }}
      />
    </div>
  );
};

export default PackageItemTable;
