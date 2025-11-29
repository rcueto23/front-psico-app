"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, CheckCircle, XCircle } from "lucide-react"
import type { Cita } from "@/lib/citas"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const estadoConfig = {
  pendiente: { label: "Pendiente", color: "bg-yellow-600 hover:bg-yellow-700" },
  completada: { label: "Completada", color: "bg-emerald-600 hover:bg-emerald-700" },
  cancelada: { label: "Cancelada", color: "bg-red-600 hover:bg-red-700" },
  en_curso: { label: "En curso", color: "bg-blue-600 hover:bg-blue-700" },
}

export function getCitaColumns({
  onEdit,
  onDelete,
  onComplete,
  onCancel,
}: {
  onEdit: (c: Cita) => void
  onDelete: (id: string) => void
  onComplete: (id: string) => void
  onCancel: (id: string) => void
}): ColumnDef<Cita>[] {
  return [
    {
      id: "fecha",
      header: "Fecha y Hora",
      accessorFn: (row) => new Date(row.fecha).getTime(),
      sortingFn: "basic",
      enableSorting: true,
      cell: ({ row }) => {
        const fecha = new Date(row.original.fecha)
        return (
          <div className="min-w-[140px]">
            <div className="font-medium">
              {format(fecha, "dd 'de' MMMM", { locale: es })}
            </div>
            <div className="text-sm text-muted-foreground">
              {format(fecha, "HH:mm", { locale: es })} ({row.original.duracion} min)
            </div>
          </div>
        )
      },
    },
    {
      id: "paciente",
      header: "Paciente",
      accessorFn: (row) => row.paciente ? `${row.paciente.nombres} ${row.paciente.apellidos}`.trim() : "",
      enableSorting: true,
      cell: ({ row }) => {
        const p = row.original.paciente
        if (!p) return <div className="text-sm text-muted-foreground">-</div>
        return (
          <div className="min-w-[180px]">
            <div className="font-medium">
              {p.nombres} {p.apellidos}
            </div>
            <div className="text-sm text-muted-foreground">
              {p.documento}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "motivo",
      header: "Motivo",
      cell: ({ getValue }) => {
        const motivo = getValue() as string | undefined
        return (
          <div className="text-sm max-w-[200px] truncate">
            {motivo || <span className="text-muted-foreground">Sin motivo</span>}
          </div>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ getValue }) => {
        const estado = String(getValue())
        const config = estadoConfig[estado as keyof typeof estadoConfig] || {
          label: estado,
          color: "bg-gray-600",
        }
        return (
          <Badge variant="default" className={config.color}>
            {config.label}
          </Badge>
        )
      },
      enableSorting: false,
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
        const c = row.original
        const isPendiente = c.estado === "pendiente"
        const isEnCurso = c.estado === "en_curso"

        return (
          <div className="flex justify-start gap-1 min-w-[140px]">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onEdit(c)}
              aria-label="Editar"
              title="Editar"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            {(isPendiente || isEnCurso) && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onComplete(c.id)}
                aria-label="Completar"
                title="Marcar como completada"
              >
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </Button>
            )}
            {isPendiente && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onCancel(c.id)}
                aria-label="Cancelar"
                title="Cancelar cita"
              >
                <XCircle className="h-4 w-4 text-orange-600" />
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDelete(c.id)}
              aria-label="Eliminar"
              title="Eliminar"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        )
      },
    },
  ]
}
