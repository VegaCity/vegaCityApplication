"use client";

import React, { useEffect, useState } from "react";
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
import { TransactionServices } from "@/components/services/transactionServices";
import { AlertCircle } from "lucide-react";
import { Transaction } from "@/types/paymentFlow/transaction";

interface TransactionTableProps {
  limit?: number;
  title?: string;
}

const TransactionTable = ({ limit, title }: TransactionTableProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = limit || 10; // Use the limit prop if provided, otherwise default to 10

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, limit]); // Add limit to dependency array

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await TransactionServices.getTransactions({
        page: currentPage,
        size: pageSize, // Use the pageSize variable here
      });

      if (response?.data?.data && response?.data?.metaData) {
        const transactionsData = Array.isArray(response.data?.data)
          ? response.data.data
          : response.data.data.content || [];

        // If limit is provided, slice the transactions array
        const limitedTransactions = limit
          ? transactionsData.slice(0, limit)
          : transactionsData;

        setTransactions(limitedTransactions);

        // Calculate total pages based on limit if provided
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: currency || "VND",
    }).format(amount);
  };

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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title || "Lịch sử giao dịch"}</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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
