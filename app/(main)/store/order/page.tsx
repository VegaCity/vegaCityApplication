"use client";
import React, { useState, useEffect } from "react";
import { useAuthUser } from "@/components/hooks/useAuthUser";
import { GetOrders } from "@/components/services/orderuserServices";
import { Order } from "@/types/paymentFlow/orderUser";
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableFooter,
  TableBody,
  TableHead,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { ComboboxCustom } from "@/components/ComboboxCustomize/ComboboxCustom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface MetaData {
  page: number;
  size: number;
  total: number;
  totalPage: number;
}

interface PaginationProps {
  metadata: MetaData;
  onPageChange: (page: number) => void;
}

const Pagination = ({ metadata, onPageChange }: PaginationProps) => {
  const generatePagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const { page, totalPage } = metadata;

    if (totalPage <= maxVisiblePages) {
      for (let i = 1; i <= totalPage; i++) {
        pages.push({ type: "page", number: i });
      }
    } else {
      pages.push({ type: "page", number: 1 });

      if (page <= 3) {
        for (let i = 2; i <= 4; i++) {
          pages.push({ type: "page", number: i });
        }
        pages.push({ type: "ellipsis" });
        pages.push({ type: "page", number: totalPage });
      } else if (page >= totalPage - 2) {
        pages.push({ type: "ellipsis" });
        for (let i = totalPage - 3; i <= totalPage; i++) {
          pages.push({ type: "page", number: i });
        }
      } else {
        pages.push({ type: "ellipsis" });
        pages.push({ type: "page", number: page - 1 });
        pages.push({ type: "page", number: page });
        pages.push({ type: "page", number: page + 1 });
        pages.push({ type: "ellipsis" });
        pages.push({ type: "page", number: totalPage });
      }
    }

    return pages;
  };

  const startItem = (metadata.page - 1) * metadata.size + 1;
  const endItem = Math.min(metadata.page * metadata.size, metadata.total);

  return (
    <div className="flex items-center justify-center space-x-2 my-4">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(metadata.page - 1)}
          disabled={metadata.page === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center space-x-2">
          {generatePagination().map((item, index) => {
            if (item.type === "ellipsis") {
              return (
                <div
                  key={`ellipsis-${index}`}
                  className="flex items-center justify-center w-9 h-9"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              );
            }

            return (
              <Button
                key={item.number}
                variant={metadata.page === item.number ? "default" : "outline"}
                size="icon"
                onClick={() => onPageChange(item.number as number)}
              >
                {item.number}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(metadata.page + 1)}
          disabled={metadata.page === metadata.totalPage}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const OrdersPage = () => {
  const { user } = useAuthUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [metadata, setMetadata] = useState<MetaData>({
    page: 1,
    size: 10,
    total: 0,
    totalPage: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("ALL");

  const filterList = [
    { value: "ALL", label: "All" },
    { value: "COMPLETED", label: "Completed" },
    { value: "PENDING", label: "Pending" },
    { value: "CANCELED", label: "Canceled" },
  ];

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await GetOrders({
        page: metadata.page,
        size: metadata.size,
        status: filterValue,
        ...(searchTerm.trim() && { searchTerm: searchTerm.trim() }),
      });

      if (response?.statusCode === 200) {
        setOrders(response.data || []);
        setMetadata(response.metaData);
      } else {
        setOrders([]);
        setMetadata({
          page: 1,
          size: 10,
          total: 0,
          totalPage: 1,
        });
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
      setMetadata({
        page: 1,
        size: 10,
        total: 0,
        totalPage: 1,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setMetadata((prev) => ({ ...prev, page: 1 }));
  }, [filterValue, searchTerm]);

  // Effect riêng để fetch data
  useEffect(() => {
    fetchOrders();
  }, [metadata.page, filterValue, searchTerm]);

  const handlePageChange = (newPage: number) => {
    setMetadata((prev) => ({ ...prev, page: newPage }));
  };

  const handleRowClick = (orderId: string) => {
    router.push(`/store/order/detail/${orderId}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-4">
        <ComboboxCustom
          open={open}
          setOpen={setOpen}
          value={filterValue}
          setValue={setFilterValue}
          filterList={filterList}
          placeholder="Filter by Status"
        />

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold text-white whitespace-nowrap">
                No
              </TableHead>
              <TableHead className="font-bold text-white whitespace-nowrap">
                Name
              </TableHead>
              <TableHead className="font-bold text-white whitespace-nowrap">
                Payment Type
              </TableHead>
              <TableHead className="font-bold text-white whitespace-nowrap">
                Total Amount
              </TableHead>
              <TableHead className="font-bold text-white whitespace-nowrap">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order, index) => (
              <TableRow
                key={order.id}
                onClick={() => handleRowClick(order.id)}
                className="cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <TableCell>
                  {(metadata.page - 1) * metadata.size + index + 1}
                </TableCell>
                <TableCell>{order.name}</TableCell>
                <TableCell>{order.paymentType}</TableCell>
                <TableCell>
                  {order.totalAmount?.toLocaleString() || 0} VND
                </TableCell>
                <TableCell>
                  <span
                    className={`font-medium ${
                      order.status === "RENTING"
                        ? "text-green-600"
                        : order.status === "PENDING"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {order.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination metadata={metadata} onPageChange={handlePageChange} />
    </div>
  );
};

export default OrdersPage;
