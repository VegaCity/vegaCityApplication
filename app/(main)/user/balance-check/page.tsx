"use client";
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  TableHead,
  TableRow,
  TableHeader,
  TableCell,
  TableBody,
  Table,
} from "@/components/ui/table";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BalanceCheckType } from "@/types/balanceCheck";
import { BalanceCheckServices } from "@/components/services/balanceCheckService";

const BalanceCheckPage = () => {
  const [balanceChecks, setBalanceChecks] = useState<BalanceCheckType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalanceChecks = async () => {
      try {
        const response = await BalanceCheckServices.getBalanceChecks({});
        const data = response.data.data;
        setBalanceChecks(data);
      } catch (err) {
        setError("Failed to fetch balance checks");
      } finally {
        setLoading(false);
      }
    };

    fetchBalanceChecks();
  }, []);

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
                <TableHead>No</TableHead>
                <TableHead>User Name</TableHead>

                <TableHead>Date Check</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Virtual Currency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(balanceChecks) &&
                balanceChecks.map((check, index) => (
                  <TableRow key={check.id}>
                    <TableCell>{index + 1}</TableCell>

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
              {(!Array.isArray(balanceChecks) ||
                balanceChecks.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No balance checks found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceCheckPage;
