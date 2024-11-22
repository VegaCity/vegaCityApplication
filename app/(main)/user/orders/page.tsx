"use client";
import React, { useState, useEffect } from "react";
import { useAuthUser } from "@/components/hooks/useAuthUser";
import { GetOrders } from "@/components/services/orderuserServices";
import { Order } from "@/types/paymentFlow/orderUser";
import { Button } from "@/components/ui/button";
import Link from "next/link";
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
import { Eye, Search } from "lucide-react";
import { ComboboxCustom } from "@/components/ComboboxCustomize/ComboboxCustom";
import { Input } from "@/components/ui/input";

interface PaginationProps {
  page: number;
  perPage: number;
  total: number;
  onPageChange: (newPage: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  perPage,
  total,
  onPageChange,
}) => {
  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="flex items-center justify-center gap-4 py-4">
      <button
        className={`px-4 py-2 border rounded-md text-sm font-medium transition-all ${
          page <= 1
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
        onClick={() => page > 1 && onPageChange(page - 1)}
        disabled={page <= 1}
      >
        Prev
      </button>

      <span className="text-sm font-semibold">
        Page {page} of {totalPages}
      </span>

      <button
        className={`px-4 py-2 border rounded-md text-sm font-medium transition-all ${
          page >= totalPages
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
        onClick={() => page < totalPages && onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next
      </button>
    </div>
  );
};

const OrdersPage = () => {
  const { user } = useAuthUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const [open, setOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("");

  const filterList = [
    { value: "ALL", label: "All" },
    { value: "COMPLETED", label: "Completed" },
    { value: "PENDING", label: "Pending" },
    { value: "CANCELED", label: "Canceled" },
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await GetOrders();
        console.log("response:", response);

        if (response.statusCode === 200 && Array.isArray(response.data)) {
          let processedOrders = [...response.data];

          // Áp dụng filter theo status
          if (filterValue && filterValue !== "ALL") {
            processedOrders = processedOrders.filter(
              (order) => order.status === filterValue
            );
          }

          // Áp dụng filter theo search term
          if (searchTerm.trim()) {
            processedOrders = processedOrders.filter((order) =>
              order.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }

          setOrders(processedOrders);
          setTotalPages(response.metaData.totalPage);
        } else {
          setOrders([]);
          setTotalPages(1);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
        setTotalPages(1);
      }
    };

    fetchOrders();
  }, [page, filterValue, searchTerm]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
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
              onClick={() => router.push(`/user/orders/detail/${order.id}`)}
              className="cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <TableCell>{index + 1}</TableCell>
              <TableCell>{order.name}</TableCell>
              <TableCell>{order.paymentType}</TableCell>
              <TableCell>{order.totalAmount.toLocaleString()} VND</TableCell>
              <TableCell>
                <span
                  className={`font-medium ${
                    order.status === "COMPLETED"
                      ? "text-green-600"
                      : order.status === "PENDING"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {order.status}
                </span>
              </TableCell>
              <TableCell>
                {/* Không cần có nút Details nữa vì người dùng có thể click vào dòng để xem chi tiết */}
              </TableCell>
            </TableRow>
          ))}
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                No orders found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Pagination
        page={page}
        perPage={10}
        total={totalPages * 10}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default OrdersPage;
