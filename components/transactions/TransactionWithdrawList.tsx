"use client";
import { useEffect, useState } from "react";
import { TransactionServices } from "@/components/services/transactionServices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const formatDateTimeForDisplay = (dateString: string | null) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  date.setHours(date.getHours());
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
};

interface TransactionWithdraw {
  id: string;
  amount: number;
  status: string;
  crDate: string;
  description: string;
}

const TransactionWithdrawList = ({
  packageItemId,
}: {
  packageItemId: string;
}) => {
  const [transactions, setTransactions] = useState<TransactionWithdraw[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const response = await TransactionServices.getTransactionDrawMoneyById({
          packageOrderId: packageItemId,
          page: currentPage,
          size: ITEMS_PER_PAGE,
        });
        setTransactions(response.data.data);
        const { total } = response.data.metaData;
        setTotalPages(Math.ceil(total / ITEMS_PER_PAGE));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load transactions"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (packageItemId) {
      fetchTransactions();
    }
  }, [packageItemId, currentPage]);

  if (isLoading) return <div>Loading transactions...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  const MobileTransactionCard = ({
    transaction,
  }: {
    transaction: TransactionWithdraw;
  }) => (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border">
      <div className="flex justify-between items-start mb-2">
        <div className="text-sm text-gray-600">
          {formatDateTimeForDisplay(transaction.crDate)}
        </div>
        <span
          className={`px-2 py-1 rounded-full text-sm ${
            transaction.status === "Success"
              ? "bg-green-100 text-green-800"
              : transaction.status === "PENDING"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {transaction.status}
        </span>
      </div>
      <div className="text-lg font-semibold mb-2">
        {new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(transaction.amount)}
      </div>
      <div className="text-sm text-gray-700">{transaction.description}</div>
    </div>
  );

  return (
    <Card className="w-full max-w-5xl mx-auto mt-6">
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {isMobile ? (
          // Mobile view with cards
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No transactions found
              </div>
            ) : (
              transactions.map((transaction) => (
                <MobileTransactionCard
                  key={transaction.id}
                  transaction={transaction}
                />
              ))
            )}
          </div>
        ) : (
          // Desktop view with table
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDateTimeForDisplay(transaction.crDate)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          transaction.status === "Success"
                            ? "bg-green-100 text-green-800"
                            : transaction.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        {transactions.length > 0 && (
          <div className="flex justify-center gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm"
            >
              Previous
            </Button>
            <span className="py-2 px-4 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm"
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionWithdrawList;
