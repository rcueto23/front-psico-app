"use client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Table } from "@tanstack/react-table"
import { Search, X } from "lucide-react"

type ToolbarProps<TData> = {
  table: Table<TData>
  estadoColumn?: string
  onCreate?: () => void
  createLabel?: string
}

export function DataTableToolbar<TData>({
  table,
  estadoColumn = "estado",
  onCreate,
  createLabel = "Nuevo",
}: ToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0 || !!table.getState().globalFilter

  const estado = table.getColumn(estadoColumn)

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col w-full gap-2 md:flex-row md:max-w-md">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={(table.getState().globalFilter as string) ?? ""}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            className="pl-8"
          />
        </div>
        {estado && (
          <Select
            value={(estado.getFilterValue() as string) ?? "todos"}
            onValueChange={(v) => estado.setFilterValue(v === "todos" ? "" : v)}
          >
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="activo">Activos</SelectItem>
              <SelectItem value="inactivo">Inactivos</SelectItem>
            </SelectContent>
          </Select>
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetGlobalFilter()
              table.resetColumnFilters()
            }}
            className="px-2 w-full md:w-auto"
            title="Limpiar filtros"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex w-full md:w-auto items-center gap-2">
        {onCreate && (
          <Button onClick={onCreate} className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white">
            {createLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
