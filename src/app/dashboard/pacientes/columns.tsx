"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Eye } from "lucide-react"
import type { Paciente } from "@/lib/pacientes"
import Link from "next/link"

export function getPacienteColumns({
  onEdit,
  onDelete,
}: {
  onEdit: (p: Paciente) => void
  onDelete: (id: string) => void
}): ColumnDef<Paciente>[] {
  return [
    {
      id: "paciente",
      header: "Paciente",
      accessorFn: (row) => `${row.nombres} ${row.apellidos}`.trim(),
      enableSorting: true,
      cell: ({ row }) => {
        const p = row.original
        return (
          <div className="min-w-[220px]">
            <Link href={`/dashboard/pacientes/${p.id}`} className="hover:underline">
              <div className="font-medium text-blue-600 hover:text-blue-800">
                {p.nombres} {p.apellidos}
              </div>
            </Link>
            {p.etiquetas && (
              <div className="mt-1 flex flex-wrap gap-1">
                {p.etiquetas.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 3).map((t) => (
                  <Badge key={t} variant="secondary" className="text-[10px]">
                    {t}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "documento",
      header: "Documento",
      cell: ({ getValue }) => <div className="text-sm">{String(getValue() || "")}</div>,
    },
    {
      id: "contacto",
      header: "Contacto",
      cell: ({ row }) => {
        const p = row.original
        return (
          <div className="text-sm space-y-0.5 min-w-[160px]">
            {p.telefono && <div>{p.telefono}</div>}
            {p.email && <div className="text-muted-foreground">{p.email}</div>}
          </div>
        )
      },
      enableSorting: false,
    },
    {
      id: "createdAt",
      header: "Fecha registro",
      accessorFn: (row) => (row.createdAt ? new Date(row.createdAt).getTime() : 0),
      sortingFn: "basic",
      cell: ({ row }) => {
        const v = row.original.createdAt
        return <div className="text-sm">{v ? new Date(v).toLocaleDateString() : "-"}</div>
      },
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ getValue }) => {
        const estado = String(getValue())
        const isActivo = estado === "activo"
        return (
          <Badge
            variant={isActivo ? "default" : "outline"}
            className={isActivo ? "bg-emerald-600 hover:bg-emerald-700" : ""}
          >
            {isActivo ? "Activo" : "Inactivo"}
          </Badge>
        )
      },
      enableSorting: false,
      // Habilita filtrado por estado con toolbar
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true
        return row.getValue<string>(columnId) === filterValue
      },
    },
    {
      id: "acciones",
      header: "Acciones",
      enableSorting: false,
      cell: ({ row }) => {
        const p = row.original
        return (
          <div className="flex justify-start gap-2 min-w-[130px]">
            <Link href={`/dashboard/pacientes/${p.id}`}>
              <Button size="icon" variant="ghost" aria-label="Ver perfil">
                <Eye className="h-4 w-4 text-blue-600" />
              </Button>
            </Link>
            <Button size="icon" variant="ghost" onClick={() => onEdit(p)} aria-label="Editar">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => onDelete(p.id)} aria-label="Eliminar">
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        )
      },
      meta: "text-right",
    },
  ]
}
