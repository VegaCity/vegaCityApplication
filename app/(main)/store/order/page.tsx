"use client";
import React, { useState, useEffect } from "react";
import { useAuthUser } from "@/components/hooks/useAuthUser";
import { GetOrders } from "@/components/services/orderuserServices";
import { Order } from "@/types/paymentFlow/orderUser";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableFooter,
  TableBody,
  TableHead,
} from "@/components/ui/table";

// In Pagination component file, define the props
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

  const handlePrev = () => {
    if (page > 1) {
      onPageChange(page - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      onPageChange(page + 1);
    }
  };

  return (
    <div className="flex items-center justify-center gap-4 py-4">
      <button
        className={`px-4 py-2 border rounded-md text-sm font-medium transition-all ${
          page <= 1
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
        onClick={handlePrev}
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
        onClick={handleNext}
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

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await GetOrders(page);
        console.log("response:", response);

        if (response.statusCode === 200 && Array.isArray(response.data)) {
          setOrders(response.data);
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
  }, [page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Payment Type</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.name}</TableCell>
              <TableCell>{order.paymentType}</TableCell>
              <TableCell>{order.totalAmount.toLocaleString()} VND</TableCell>
              <TableCell>
                <span
                  style={{
                    color:
                      order.status === "COMPLETED"
                        ? "green"
                        : order.status === "PENDING"
                        ? "red"
                        : "gray",
                  }}
                >
                  {order.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={7}>No orders found</TableCell>
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
    </>
  );
};

export default OrdersPage;
