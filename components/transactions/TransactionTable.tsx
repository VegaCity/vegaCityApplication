"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { ArrowUp, ArrowDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { TransactionServices } from "@/components/services/transactionServices";
import { Transaction } from "@/types/paymentFlow/transaction";
import DateRangePicker from "../ui/date-picker";
import EnhancedPagination from "@/lib/EnhancedPagination";
import { Loader } from "@/components/loader/Loader";
import EmptyDataPage from "@/components/emptyData/emptyData";

const TransactionTable = ({
  limit,
  title,
}: {
  limit?: number;
  title?: string;
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortType, setSortType] = useState<"asc" | "desc">("desc");
  const pageSize = limit || 10;

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, sortType]);
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: currency || "VND",
    }).format(amount);
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, limit, sortType]);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "SUCCESS":
        return "text-green-600";
      case "CANCEL":
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
      });

      if (response?.data?.data) {
        const transactionsData = Array.isArray(response.data.data)
          ? response.data.data
          : [];

        // Apply sorting based on type
        const sortedTransactions = transactionsData.sort((a: any, b: any) => {
          return sortType === "asc"
            ? a.type.localeCompare(b.type)
            : b.type.localeCompare(a.type);
        });

        setTransactions(sortedTransactions);

        const total = response.data.metaData.total;
        setTotalPages(Math.ceil(total / pageSize));
      } else {
        throw new Error("Unable to fetch transactions.");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
      setError("An error occurred while fetching data.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTypeSorting = () => {
    setSortType((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title || "Transaction History"}</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <Loader isLoading={isLoading} />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead
                    className="flex items-center justify-between cursor-pointer"
                    onClick={toggleTypeSorting}
                  >
                    Type {sortType === "asc" ? <ArrowUp /> : <ArrowDown />}
                  </TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Create Date</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction, index) => (
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
                      {/* {transaction.isIncrease ? "+" : "-"} */}
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {transactions && transactions.length > 0 ? (
              <EnhancedPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            ) : (
              <div>
                <EmptyDataPage />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionTable;
