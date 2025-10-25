"use client"

import * as React from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  toolbar?: React.ReactNode
  emptyMessage?: string
  className?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  toolbar,
  emptyMessage = "Sin resultados",
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className={cn("space-y-3", className)}>
      {toolbar}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={cn("whitespace-nowrap", header.column.columnDef.meta as string)}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            header.column.getCanSort() ? "cursor-pointer select-none" : "",
                            "flex items-center gap-1",
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                          role={header.column.getCanSort() ? "button" : undefined}
                          aria-label={header.column.getCanSort() ? "Ordenar columna" : undefined}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: "↑",
                            desc: "↓",
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="align-top">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end gap-2">
        <div className="text-xs text-muted-foreground mr-auto">
          {`Mostrando ${table.getRowModel().rows.length} de ${table.getFilteredRowModel().rows.length}`}
        </div>
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Anterior
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Siguiente
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
