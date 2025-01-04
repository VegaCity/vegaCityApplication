"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Changed from next/router
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PackageItemServices } from "../services/Package/packageItemService";

const SearchPackageItem = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastSearched, setLastSearched] = useState("");
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    const savedId = localStorage.getItem("packageItemId");
    if (savedId) {
      setSearchQuery(savedId);
      setLastSearched(savedId);
    }
  }, []);

  const handleSearchWithId = async (id: string) => {
    if (!id.trim()) {
      setError("Please enter a Package Item ID or RFID");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      console.log("Initiating search with ID or RFID:", id);

      const searchParams =
        id.trim().length === 10 ? { rfId: id.trim() } : { id: id.trim() };

      let response = await PackageItemServices.getPackageItemById(searchParams);

      if (response.data?.data) {
        const packageId = response.data.data.id;

        if (searchParams.rfId && packageId) {
          response = await PackageItemServices.getPackageItemById({
            id: packageId,
          });
        }

        if (response.data?.data) {
          localStorage.setItem("packageItemId", packageId);
          setLastSearched(packageId);

          toast({
            title: "Success",
            description: "Package item found",
            variant: "default",
          });

          router.push(`/etagEdit/${packageId}`);
        } else {
          setError("No package item found with the provided ID or RFID");
          localStorage.removeItem("packageItemId");
          setLastSearched("");
        }
      } else {
        setError("No package item found with the provided ID or RFID");
        localStorage.removeItem("packageItemId");
        setLastSearched("");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.Error || "Failed to search package item";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      localStorage.removeItem("packageItemId");
      setLastSearched("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSearchWithId(searchQuery);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setError("");

    if (!value.trim()) {
      localStorage.removeItem("packageItemId");
      setLastSearched("");
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    setError("");
    setLastSearched("");
    localStorage.removeItem("packageItemId");
  };

  return (
    <Card className="w-full max-w-xl mx-auto mt-8">
      <CardHeader className="text-center">
        <h3 className="text-xl font-semibold">Search Package Item</h3>
        {lastSearched && (
          <p className="text-sm text-gray-500">Last searched: {lastSearched}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              placeholder="Enter Package Item ID or RFID"
              value={searchQuery}
              onChange={handleInputChange}
              className="w-full pr-8"
              disabled={isLoading}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Searching
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search
              </>
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchPackageItem;
