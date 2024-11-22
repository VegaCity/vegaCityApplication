"use client";
import React, { useEffect, useState, useRef } from "react";
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
import { PackageItemServices } from "../services/Package/packageItemService";
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
  cusCccdpassport: string | null;
  cusEmail: string | null;
  gender: string | null;
  cusName: string | null;
  phoneNumber: string | null;
  rfid: string | null;
  status: string;
  crDate: string;
  updateDate: string;
  walletId: string;
  isChanged: boolean;
  isAdult: boolean | null;
  endDate: string | null;
  walletTypeName: string;
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
    { value: "InActive", label: "InActive" },
    { value: "Expired", label: "Expired" },
    { value: "Blocked", label: "Blocked" },
  ];
  const isValidUUID = (str: string) => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };
  const [inputBuffer, setInputBuffer] = useState("");
  const inputTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastInputTimeRef = useRef<number>(0);
  const RFID_TIMEOUT = 50; // Timeout for RFID input (milliseconds)
  const SEARCH_DEBOUNCE = 500; // Debounce for manual search (milliseconds)
  const handleSearchInput = (value: string) => {
    const currentTime = Date.now();
    setInputBuffer(value);

    // Clear any existing timeout
    if (inputTimeoutRef.current) {
      clearTimeout(inputTimeoutRef.current);
    }

    // Check if this is rapid input (likely from RFID scanner)
    const isRapidInput = currentTime - lastInputTimeRef.current < RFID_TIMEOUT;
    lastInputTimeRef.current = currentTime;

    // Set timeout based on input type
    inputTimeoutRef.current = setTimeout(
      () => processSearch(value),
      isRapidInput ? RFID_TIMEOUT : SEARCH_DEBOUNCE
    );
  };

  const processSearch = async (value: string) => {
    setSearchTerm(value);

    if (!value.trim()) return;

    try {
      // Try to find by ID first
      if (isValidUUID(value.trim())) {
        const responseById = await PackageItemServices.getPackageItemById({
          id: value.trim(),
        });

        if (responseById.data) {
          router.push(`/user/package-items/detail/${value.trim()}`);
          return;
        }
      }

      // Then try by RFID
      const responseByRfId = await PackageItemServices.getPackageItemById({
        rfId: value.trim(),
      });

      if (responseByRfId.data) {
        router.push(
          `/user/package-items/detail/${responseByRfId.data.data.id}`
        );
        return;
      }

      // If no direct matches, continue with regular search filtering
    } catch (error) {
      // Continue with regular search if no exact matches found
      console.log("Continuing with regular search");
    }
  };
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
        item.cusCccdpassport
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        item.cusName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortField === "status") {
        return sortOrder === "desc"
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      }

      const aDate = new Date(a[sortField]).getTime();
      const bDate = new Date(b[sortField]).getTime();
      return sortOrder === "desc" ? aDate - bDate : bDate - aDate;
    });

    setFilteredPackageItems(sorted);
  }, [searchTerm, selectedStatus, packageItems, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortOrder("desc");
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
      case "InActive":
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
            value={inputBuffer}
            onChange={(e) => handleSearchInput(e.target.value)}
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
              Type Wallet
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
              <TableCell>{item.cusCccdpassport || "-"}</TableCell>
              <TableCell>{item.cusName || "-"}</TableCell>
              <TableCell>{item.phoneNumber || "-"}</TableCell>
              <TableCell>{item.isAdult ? "Adult" : "Child"}</TableCell>
              <TableCell>{formatDate(item.crDate)}</TableCell>
              <TableCell>{item.walletTypeName}</TableCell>
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
                  packageItem={item as PackageItem} // Cast item to PackageItem
                  onLost={(item) => {
                    setSelectedPackageItem(item as PackageItem); // Cast item to PackageItem
                    setIsLostDialogOpen(true);
                  }}
                  onGenerateNewCard={(item) => {
                    setSelectedPackageItem(item as PackageItem); // Cast item to PackageItem
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
