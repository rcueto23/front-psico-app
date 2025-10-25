"use client";

import { useEffect, useMemo, useState } from "react";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  type Paciente,
  pacientesService,
  type CreatePacienteDto,
  type UpdatePacienteDto,
} from "@/lib/pacientes";
import { DataTableToolbar } from "@/components/data-table-toolbar";
import { getPacienteColumns } from "./columns";
import {
  type ColumnDef,
  type ColumnFiltersState,
  PaginationState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type FormState = {
  id?: string;
  nombres: string;
  apellidos: string;
  documento: string;
  email?: string;
  telefono?: string;
  nacimiento?: Date;
  sexo?: "F" | "M" | "Otro";
  direccion?: string;
  notas?: string;
  estado: "activo" | "inactivo";
  etiquetas?: string;
  tipoDocumento: string;
};

function PacientesDataTable({
  data,
  columns,
  onCreate,
}: {
  data: Paciente[];
  columns: ColumnDef<Paciente, unknown>[];
  onCreate: () => void;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5, // <-- Límite inicial de filas por página
  });

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
  });

  return (
    <div className="space-y-3">
      <DataTableToolbar
        table={table}
        estadoColumn="estado"
        onCreate={onCreate}
        createLabel="Nuevo paciente"
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
        {/* Filas por página */}
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

        {/* Texto de cantidad de filas */}
        <div className="text-xs text-muted-foreground sm:mr-auto text-center sm:text-left">
          {`Mostrando ${table.getRowModel().rows.length} de ${
            table.getFilteredRowModel().rows.length
          }`}
        </div>

        {/* Botones de navegación */}
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
  );
}

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Paciente | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pacienteToDelete, setPacienteToDelete] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>({
    nombres: "",
    apellidos: "",
    documento: "",
    email: "",
    telefono: "",
    nacimiento: undefined,
    sexo: "Otro",
    direccion: "",
    notas: "",
    estado: "activo",
    etiquetas: "",
    tipoDocumento: "",
  });

  const tiposDocumento = [
    "CC",
    "CE",
    "TI",
    "PA",
    "MS",
    "AS",
    "RC",
    "PE",
    "CN",
    "SC",
    "SI",
    "CD",
    "DE",
    "PT",
  ];

  useEffect(() => {
    loadPacientes();
  }, []);

  async function loadPacientes() {
    try {
      setLoading(true);
      const data = await pacientesService.getAll();
      setPacientes(data);
    } catch (error) {
      toast.error("Error al cargar pacientes");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const columns = useMemo(
    () =>
      getPacienteColumns({
        onEdit: (p) => openEdit(p),
        onDelete: (id) => openDeleteDialog(id),
      }),
    []
  );

  function openCreate() {
    setEditing(null);
    setForm({
      nombres: "",
      apellidos: "",
      documento: "",
      email: "",
      telefono: "",
      nacimiento: undefined,
      sexo: "Otro",
      direccion: "",
      notas: "",
      estado: "activo",
      etiquetas: "",
      tipoDocumento: "",
    });
    setOpen(true);
  }

  function openEdit(p: Paciente) {
    setEditing(p);
    setForm({
      id: p.id,
      nombres: p.nombres,
      apellidos: p.apellidos,
      documento: p.documento,
      email: p.email ?? "",
      telefono: p.telefono ?? "",
      nacimiento: p.nacimiento ? new Date(p.nacimiento) : undefined,
      sexo: (p.sexo as "F" | "M" | "Otro") ?? "Otro",
      direccion: p.direccion ?? "",
      notas: p.notas ?? "",
      estado: p.estado as "activo" | "inactivo",
      etiquetas: p.etiquetas ?? "",
      tipoDocumento: p.tipoDocumento,
    });
    setOpen(true);
  }

  function handleChange<K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function savePaciente() {
    // Validaciones
    if (!form.nombres.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    if (!form.apellidos.trim()) {
      toast.error("Los apellidos son obligatorios");
      return;
    }
    if (!form.tipoDocumento) {
      toast.error("El tipo de documento es obligatorio");
      return;
    }
    if (!form.documento.trim()) {
      toast.error("El número de documento es obligatorio");
      return;
    }

    // Validar email si se proporciona
    if (form.email && form.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email.trim())) {
        toast.error("El email no es válido");
        return;
      }
    }

    try {
      setLoading(true);

      const payload = {
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        documento: form.documento.trim(),
        tipoDocumento: form.tipoDocumento.trim(),
        email: form.email?.trim() || undefined,
        telefono: form.telefono?.trim() || undefined,
        nacimiento: form.nacimiento ? form.nacimiento.toISOString() : undefined,
        sexo: form.sexo ?? "Otro",
        direccion: form.direccion?.trim() || undefined,
        notas: form.notas?.trim() || undefined,
        estado: form.estado,
        etiquetas: form.etiquetas?.trim() || undefined,
      };

      if (editing) {
        await pacientesService.update(editing.id, payload as UpdatePacienteDto);
        toast.success("Paciente actualizado correctamente");
      } else {
        await pacientesService.create(payload as CreatePacienteDto);
        toast.success("Paciente creado correctamente");
      }

      await loadPacientes();
      setOpen(false);
      setEditing(null);
    } catch (error) {
      toast.error(error.message || "Error al guardar el paciente");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function openDeleteDialog(id: string) {
    setPacienteToDelete(id);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (!pacienteToDelete) return;

    try {
      setLoading(true);
      await pacientesService.delete(pacienteToDelete);
      toast.success("Paciente eliminado correctamente");
      await loadPacientes();
      setDeleteDialogOpen(false);
      setPacienteToDelete(null);
    } catch (error) {
      toast.error(error.message || "Error al eliminar el paciente");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function cancelDelete() {
    setDeleteDialogOpen(false);
    setPacienteToDelete(null);
  }

  return (
    <main className="p-4">
      <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <UserRound className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Pacientes</h1>
            <p className="text-sm text-muted-foreground">
              Administra pacientes.
            </p>
          </div>
        </div>
      </header>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Listado</CardTitle>
        </CardHeader>
        <CardContent>
          <PacientesDataTable
            data={pacientes}
            columns={columns}
            onCreate={openCreate}
          />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[800px] w-[90%] h-[90%] overflow-x-auto overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar paciente" : "Nuevo paciente"}
            </DialogTitle>
          </DialogHeader>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="nombres">
                Nombres <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nombres"
                value={form.nombres}
                onChange={(e) => handleChange("nombres", e.target.value)}
                placeholder="Ej: Ana María"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellidos">
                Apellidos <span className="text-red-500">*</span>
              </Label>
              <Input
                id="apellidos"
                value={form.apellidos}
                onChange={(e) => handleChange("apellidos", e.target.value)}
                placeholder="Ej: Pérez López"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipoDocumento">
                Tipo Documento <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.tipoDocumento}
                onValueChange={(e) => handleChange("tipoDocumento", e)}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tipo de documento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {tiposDocumento.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="documento">
                Documento <span className="text-red-500">*</span>
              </Label>
              <Input
                id="documento"
                value={form.documento}
                onChange={(e) => handleChange("documento", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={form.telefono}
                onChange={(e) => handleChange("telefono", e.target.value)}
                placeholder="+54 11 1234 5678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="ana@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nacimiento">Fecha de nacimiento</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen} modal={true}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.nacimiento && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.nacimiento ? (
                      format(form.nacimiento, "PPP", { locale: es })
                    ) : (
                      <span>Selecciona fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0"
                  align="start"
                  side="bottom"
                  sideOffset={4}
                  onInteractOutside={(e) => {
                    e.preventDefault();
                  }}
                >
                  <Calendar
                    mode="single"
                    selected={form.nacimiento}
                    onSelect={(date) => {
                      handleChange("nacimiento", date ?? undefined);
                      setCalendarOpen(false);
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Sexo</Label>
              <Select
                value={form.sexo}
                onValueChange={(v: "F" | "M" | "Otro") =>
                  handleChange("sexo", v)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="F">Femenino</SelectItem>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                value={form.direccion}
                onChange={(e) => handleChange("direccion", e.target.value)}
                placeholder="Calle 123, Ciudad"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="etiquetas">Etiquetas (separadas por coma)</Label>
              <Input
                id="etiquetas"
                value={form.etiquetas}
                onChange={(e) => handleChange("etiquetas", e.target.value)}
                placeholder="ansiedad, adolescente, online"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notas">Notas</Label>
              <Textarea
                id="notas"
                value={form.notas}
                onChange={(e) => handleChange("notas", e.target.value)}
                placeholder="Información relevante, alergias, preferencias..."
              />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={form.estado}
                onValueChange={(v: "activo" | "inactivo") =>
                  handleChange("estado", v)
                }
              >
                <SelectTrigger className="w-full sm:w-auto">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={savePaciente}
            >
              {editing ? "Guardar cambios" : "Crear paciente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el paciente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
