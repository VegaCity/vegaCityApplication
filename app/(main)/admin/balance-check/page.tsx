"use client";
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { BalanceCheckType } from "@/types/balanceCheck";
import { BalanceCheckServices } from "@/components/services/balanceCheckService";

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
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(metadata.page - 1)}
        disabled={metadata.page === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {generatePagination().map((item, index) =>
        item.type === "ellipsis" ? (
          <div key={index} className="w-9 h-9 flex items-center justify-center">
            <MoreHorizontal className="h-4 w-4" />
          </div>
        ) : (
          <Button
            key={item.number}
            variant={metadata.page === item.number ? "default" : "outline"}
            size="icon"
            onClick={() => onPageChange(item.number as number)}
          >
            {item.number}
          </Button>
        )
      )}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(metadata.page + 1)}
        disabled={metadata.page === metadata.totalPage}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

const BalanceCheckPage = () => {
  const [balanceChecks, setBalanceChecks] = useState<BalanceCheckType[]>([]);
  const [metadata, setMetadata] = useState<MetaData>({
    page: 1,
    size: 10,
    total: 0,
    totalPage: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalanceChecks = async () => {
    setLoading(true);
    try {
      const response = await BalanceCheckServices.getBalanceChecks({
        page: metadata.page,
        size: metadata.size,
      });
      const data = response.data.data;
      setBalanceChecks(data);
      setMetadata(response.data.metaData);
    } catch {
      setError("Failed to fetch balance checks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalanceChecks();
  }, [metadata.page]);

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
    <Card className="mx-auto max-w-6xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Balance Checks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>User Name</TableHead>
                <TableHead>Date Check</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Virtual Currency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {balanceChecks.map((check, index) => (
                <TableRow key={check.id}>
                  <TableCell>
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
                      : check.balance}
                  </TableCell>
                  <TableCell className="text-right">
                    {typeof check.balanceHistory === "number"
                      ? new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(check.balanceHistory)
                      : check.balanceHistory}
                  </TableCell>
                </TableRow>
              ))}
              {balanceChecks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No balance checks found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <Pagination metadata={metadata} onPageChange={handlePageChange} />
      </CardContent>
    </Card>
  );
};

export default BalanceCheckPage;
