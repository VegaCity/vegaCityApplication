import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { SearchParams } from "@/types/table";
import React from "react";
import { HouseTable } from "./_components/house-table";
import { Shell } from "@/components/shell";
import { getOrders } from "@/lib/actions/order";
export interface IndexPageProps {
  searchParams: SearchParams;
}

const TeableTestPage = ({ searchParams }: IndexPageProps) => {
  const housePromise = getOrders(searchParams);

  return (
    <div className="">
      <Shell>
        <React.Suspense
          fallback={
            <DataTableSkeleton
              columnCount={5}
              searchableColumnCount={1}
              filterableColumnCount={2}
              cellWidths={["10rem", "40rem", "12rem", "12rem", "8rem"]}
              shrinkZero
            />
          }
        >
          <HouseTable housePromise={housePromise} />
        </React.Suspense>
      </Shell>
    </div>
  );
};

export default TeableTestPage;
