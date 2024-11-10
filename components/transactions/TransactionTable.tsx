"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TransactionServices } from "@/components/services/transactionServices";
import { AlertCircle } from "lucide-react";
import { Transaction } from "@/types/paymentFlow/transaction";
import DateRangePicker from "../ui/date-picker";

interface TransactionTableProps {
  limit?: number;
  title?: string;
}

interface TransactionPageSize {
  page?: number;
  size?: number;
}

interface TransactionPageSizeWithDates extends TransactionPageSize {
  startDate?: string;
  endDate?: string;
}

const TransactionTable = ({ limit, title }: TransactionTableProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const pageSize = limit || 10;

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: currency || "VND",
    }).format(amount);
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, limit]);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "SUCCESS":
        return "text-green-600";
      case "FAILED":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await TransactionServices.getTransactions({
        page: currentPage,
        size: pageSize,
        startDate: dateRange?.from
          ? format(dateRange.from, "yyyy-MM-dd")
          : undefined,
        endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
      } as TransactionPageSizeWithDates);

      if (response?.data?.data && response?.data?.metaData) {
        const transactionsData = Array.isArray(response.data?.data)
          ? response.data.data
          : response.data.data.content || [];

        const sortedTransactions = transactionsData.sort(
          (a: Transaction, b: Transaction) =>
            new Date(b.crDate).getTime() - new Date(a.crDate).getTime()
        );

        const limitedTransactions = limit
          ? sortedTransactions.slice(0, limit)
          : sortedTransactions;

        setTransactions(limitedTransactions);

        const { total } = response.data.metaData;
        const calculatedTotalPages = limit
          ? Math.ceil(Math.min(total, limit) / pageSize)
          : Math.ceil(total / pageSize);

        setTotalPages(calculatedTotalPages);
      } else {
        throw new Error("Không thể tải dữ liệu giao dịch");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
      setTotalPages(1);
      setError("Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title || "Transactions History"}</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mb-4 flex items-center space-x-2">
          <div className="w-[200px]">
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={(newDateRange) => {
                setDateRange(newDateRange);
                if (newDateRange?.from && newDateRange?.to) {
                  setCurrentPage(100);
                  fetchTransactions();
                }
              }}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array(Math.min(5, limit || 5))
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="h-12 bg-gray-100 rounded animate-pulse"
                />
              ))}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No.</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>CreateDate</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions && transactions.length > 0 ? (
                  transactions.map((transaction, index) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{transaction.type}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </TableCell>
                      <TableCell>{formatDate(transaction.crDate)}</TableCell>
                      <TableCell
                        className={
                          transaction.isIncrease
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {transaction.isIncrease ? "+" : "-"}
                        {formatCurrency(
                          transaction.amount,
                          transaction.currency
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Không có giao dịch nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {transactions && transactions.length > 0 && !limit && (
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
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
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionTable;
