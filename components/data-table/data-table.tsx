import * as React from "react"
import type {
  DataTableFilterableColumn,
  DataTableSearchableColumn,
} from "@/types/table"
import {
  flexRender,
  type ColumnDef,
  type Table as TanstackTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// import { DataTableAdvancedToolbar } from "./advanced/data-table-advanced-toolbar"
import { DataTableFloatingBar } from "./data-table-floating-bar"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"

interface DataTableProps<TData, TValue> {
  dataTable: TanstackTable<TData>
  columns: ColumnDef<TData, TValue>[]
  searchableColumns?: DataTableSearchableColumn<TData>[]
  filterableColumns?: DataTableFilterableColumn<TData>[]
  advancedFilter?: boolean
  floatingBarContent?: React.ReactNode | null
  deleteRowsAction?: React.MouseEventHandler<HTMLButtonElement>
}

export function DataTable<TData, TValue>({
  dataTable,
  columns,
  searchableColumns = [],
  filterableColumns = [],
  advancedFilter = false,
  floatingBarContent,
  deleteRowsAction,
}: DataTableProps<TData, TValue>) {
 
  return (
    <div className="space-y-4">
      {/* {advancedFilter ? (
        <DataTableAdvancedToolbar
          dataTable={dataTable}
          filterableColumns={filterableColumns}
          searchableColumns={searchableColumns}
        />
      ) : ( */}
        <DataTableToolbar
          table={dataTable}
          filterableColumns={filterableColumns}
          searchableColumns={searchableColumns}
          deleteRowsAction={deleteRowsAction}
          newRowLink= "/create"
        />
      {/* )} */}
      <div className="rounded-md border-2 border-orange-300 dark:border-orange-700 overflow-auto shadow-lg">
        <Table className="w-full">
          <TableHeader className="bg-orange-100 dark:bg-orange-900">
            {dataTable.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="font-bold text-orange-800 dark:text-orange-100 py-3 px-4">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {dataTable.getRowModel().rows?.length ? (
              dataTable.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-orange-50 dark:hover:bg-orange-950 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 px-4 text-orange-900 dark:text-orange-100">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-orange-600 dark:text-orange-300"
                >
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="space-y-2.5">
        <DataTablePagination table={dataTable} />
        {floatingBarContent ? (
          <DataTableFloatingBar table={dataTable}>
            {floatingBarContent}
          </DataTableFloatingBar>
        ) : null}
      </div>
    </div>
  )
}