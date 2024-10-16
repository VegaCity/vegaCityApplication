"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";

import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/data-table/data-table";

import { fetchHousesTableColumnDefs } from "./product-table-column-def";
import {
  DataTableFilterableColumn,
  DataTableSearchableColumn,
} from "@/types/table";
import { getOrders, IOrder } from "@/lib/actions/order";

interface HouseTableProps {
  housePromise: ReturnType<typeof getOrders>;
}

export function HouseTable({ housePromise }: HouseTableProps) {
  const { data, pageCount } = React.use(housePromise);

  const columns = React.useMemo<ColumnDef<IOrder, unknown>[]>(
    () => fetchHousesTableColumnDefs(),
    []
  );

  const searchableColumns: DataTableSearchableColumn<IOrder>[] = [
    {
      id: "name",
      title: "tên nhà",
    },
  ];

  const filterableColumns: DataTableFilterableColumn<IOrder>[] = [
    {
      id: "name",
      title: "status",
      options: ["WAITING", "COMING", "LIVE", "END"].map((status) => ({
        label: status[0]?.toUpperCase() + status.slice(1),
        value: status,
      })),
    },
  ];

  const { dataTable } = useDataTable({
    data,
    columns,
    pageCount,
    searchableColumns,
    filterableColumns,
  });

  return (
    <div className="space-y-4 overflow-hidden">
      <DataTable
        dataTable={dataTable}
        columns={columns}
        searchableColumns={searchableColumns}
        filterableColumns={filterableColumns}
        //   floatingBarContent={TasksTableFloatingBarContent(dataTable)}
        //   deleteRowsAction={(event) => deleteSelectedRows(dataTable, event)}
      />
    </div>
  );
}
