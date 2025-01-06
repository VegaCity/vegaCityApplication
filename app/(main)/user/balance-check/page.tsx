"use client";
import React, { useState, useEffect } from "react";
import {
  TableHead,
  TableRow,
  TableHeader,
  TableCell,
  TableBody,
  Table,
} from "@/components/ui/table";
import {
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BalanceCheckType } from "@/types/balanceCheck";
import { BalanceCheckServices } from "@/components/services/balanceCheckService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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

  return (
    <div className="flex items-center justify-center space-x-2 my-4">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(metadata.page - 1)}
          disabled={metadata.page === 1}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

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
              <button
                key={item.number}
                onClick={() => onPageChange(item.number as number)}
                className={`px-3 py-1 rounded ${
                  metadata.page === item.number
                    ? "bg-blue-500 text-white"
                    : "hover:bg-gray-200"
                }`}
              >
                {item.number}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(metadata.page + 1)}
          disabled={metadata.page === metadata.totalPage}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const BalanceCheckPage = () => {
  const [balanceChecks, setBalanceChecks] = useState<BalanceCheckType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<MetaData>({
    page: 1,
    size: 10,
    total: 0,
    totalPage: 1,
  });

  useEffect(() => {
    const fetchBalanceChecks = async () => {
      try {
        setLoading(true);
        const response = await BalanceCheckServices.getBalanceChecks({
          page: metadata.page,
          size: metadata.size,
        });
        console.log(response, "response.data");
        setBalanceChecks(response.data);
        setMetadata(response.data.metadata);
      } catch (err) {
        setError("Failed to fetch balance checks");
      } finally {
        setLoading(false);
      }
    };

    fetchBalanceChecks();
  }, [metadata.page, metadata.size]);

  const handlePageChange = (newPage: number) => {
    setMetadata((prev) => ({ ...prev, page: newPage }));
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mx-auto mt-4 max-w-2xl">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Card className="mx-auto max-w-6xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Balance Checks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>User Name</TableHead>
                  <TableHead>Date Check</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Balance History</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(balanceChecks) &&
                  balanceChecks.map((check, index) => (
                    <TableRow key={check.id}>
                      <TableCell className="font-medium">
                        {(metadata.page - 1) * metadata.size + index + 1}
                      </TableCell>
                      <TableCell>{check.userName}</TableCell>
                      <TableCell>
                        {new Date(check.dateCheck).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {typeof check.balance === "number"
                          ? new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(check.balance)
                          : check.balance}{" "}
                        đ
                      </TableCell>
                      <TableCell className="text-right">
                        {typeof check.balanceHistory === "number"
                          ? new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(check.balanceHistory)
                          : check.balanceHistory}{" "}
                        đ
                      </TableCell>
                    </TableRow>
                  ))}
                {(!Array.isArray(balanceChecks) ||
                  balanceChecks.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-4 text-center">
                      No balance checks found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Pagination metadata={metadata} onPageChange={handlePageChange} />
    </div>
  );
};

export default BalanceCheckPage;
