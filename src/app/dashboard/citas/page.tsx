"use client"

import { useState, useEffect } from "react"
import { Calendar as CalendarIconHeader } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { citasService, type Cita } from "@/lib/citas"
import { pacientesService, type Paciente } from "@/lib/pacientes"
import { toast } from "sonner"
import { getCitaColumns } from "./columns"
import { DataTableToolbar } from "@/components/data-table-toolbar"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

function CitasDataTable({
  data,
  columns,
  onCreate,
}: {
  data: Cita[]
  columns: ColumnDef<Cita, unknown>[]
  onCreate: () => void
}) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="space-y-3">
      <DataTableToolbar
        table={table}
        estadoColumn="estado"
        onCreate={onCreate}
        createLabel="Nueva cita"
      />
      <div className="rounded-md border overflow-x-auto overflow-y-auto h-100">
        <table className="w-full text-sm">
          <thead className="[&_tr]:border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="h-8 px-4 text-left align-middle font-medium text-muted-foreground"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "cursor-pointer select-none flex items-center gap-1"
                            : ""
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: "↑",
                          desc: "↓",
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-4 align-top">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  Sin resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground justify-content-center">
          <span>Filas por página</span>
          <Select
            value={String(table.getState().pagination.pageSize)}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="Filas" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="text-xs text-muted-foreground sm:mr-auto text-center sm:text-left">
          {`Mostrando ${table.getRowModel().rows.length} de ${
            table.getFilteredRowModel().rows.length
          }`}
        </div>

        <div className="flex gap-2 justify-center sm:justify-end">
          <button
            className="inline-flex h-8 items-center justify-center whitespace-nowrap rounded-md border bg-background px-3 text-xs font-medium shadow-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </button>

          <button
            className="inline-flex h-8 items-center justify-center whitespace-nowrap rounded-md border bg-background px-3 text-xs font-medium shadow-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CitasPage() {
  const [citas, setCitas] = useState<Cita[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [editingCita, setEditingCita] = useState<Cita | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    pacienteId: "",
    fecha: "",
    duracion: "60",
    motivo: "",
    estado: "pendiente",
    notas: "",
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const [citasData, pacientesData] = await Promise.all([
        citasService.getAll(),
        pacientesService.getAll(),
      ])
      setCitas(citasData)
      setPacientes(pacientesData.filter((p) => p.estado === "activo"))
    } catch (error: any) {
      toast.error("Error al cargar datos")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const openCreate = () => {
    setEditingCita(null)
    setFormData({
      pacienteId: "",
      fecha: "",
      duracion: "60",
      motivo: "",
      estado: "pendiente",
      notas: "",
    })
    setOpen(true)
  }

  const openEdit = (cita: Cita) => {
    setEditingCita(cita)
    const fecha = new Date(cita.fecha)
    const fechaStr = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16)
    setFormData({
      pacienteId: cita.pacienteId,
      fecha: fechaStr,
      duracion: String(cita.duracion),
      motivo: cita.motivo || "",
      estado: cita.estado,
      notas: cita.notas || "",
    })
    setOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.pacienteId || !formData.fecha) {
      toast.error("Paciente y fecha son obligatorios")
      return
    }

    try {
      setLoading(true)
      const data = {
        ...formData,
        duracion: parseInt(formData.duracion),
      }

      if (editingCita) {
        await citasService.update(editingCita.id, data)
        toast.success("Cita actualizada correctamente")
      } else {
        await citasService.create(data)
        toast.success("Cita creada correctamente")
      }

      setOpen(false)
      await loadData()
    } catch (error: any) {
      toast.error(error.message || "Error al guardar la cita")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async (id: string) => {
    try {
      setLoading(true)
      await citasService.updateEstado(id, "completada")
      toast.success("Cita marcada como completada")
      await loadData()
    } catch (error: any) {
      toast.error("Error al completar la cita")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id: string) => {
    try {
      setLoading(true)
      await citasService.updateEstado(id, "cancelada")
      toast.success("Cita cancelada")
      await loadData()
    } catch (error: any) {
      toast.error("Error al cancelar la cita")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const openDeleteDialog = (id: string) => {
    setDeletingId(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingId) return

    try {
      setLoading(true)
      await citasService.delete(deletingId)
      toast.success("Cita eliminada correctamente")
      await loadData()
      setDeleteDialogOpen(false)
      setDeletingId(null)
    } catch (error: any) {
      toast.error("Error al eliminar la cita")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const columns = getCitaColumns({
    onEdit: openEdit,
    onDelete: openDeleteDialog,
    onComplete: handleComplete,
    onCancel: handleCancel,
  })

  return (
    <main className="p-4">
      <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <CalendarIconHeader className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Citas</h1>
            <p className="text-sm text-muted-foreground">
              Administra citas y sesiones.
            </p>
          </div>
        </div>
      </header>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Listado</CardTitle>
        </CardHeader>
        <CardContent>
          <CitasDataTable data={citas} columns={columns} onCreate={openCreate} />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] w-[90%]">
          <DialogHeader>
            <DialogTitle>
              {editingCita ? "Editar cita" : "Nueva cita"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paciente">Paciente *</Label>
              <Select
                value={formData.pacienteId}
                onValueChange={(v) => setFormData({ ...formData, pacienteId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar paciente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {pacientes.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nombres} {p.apellidos} - {p.documento}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha y Hora *</Label>
              <Input
                id="fecha"
                type="datetime-local"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duracion">Duración (minutos)</Label>
              <Input
                id="duracion"
                type="number"
                min="15"
                step="15"
                value={formData.duracion}
                onChange={(e) => setFormData({ ...formData, duracion: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo</Label>
              <Input
                id="motivo"
                value={formData.motivo}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                placeholder="Ej: Primera consulta, seguimiento..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={formData.estado}
                onValueChange={(v) => setFormData({ ...formData, estado: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="en_curso">En curso</SelectItem>
                    <SelectItem value="completada">Completada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notas">Notas</Label>
              <Textarea
                id="notas"
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                placeholder="Observaciones adicionales..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : editingCita ? "Guardar cambios" : "Crear cita"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cita?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La cita será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
