"use client"

import { useEffect, useState } from "react"
import { citasService, type Cita } from "@/lib/citas"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"

const estadoConfig = {
  pendiente: { label: "Pendiente", color: "bg-yellow-500" },
  completada: { label: "Completada", color: "bg-emerald-500" },
  cancelada: { label: "Cancelada", color: "bg-red-500" },
  en_curso: { label: "En curso", color: "bg-blue-500" },
}

export default function CalendarioPage() {
  const [citas, setCitas] = useState<Cita[]>([])
  const [loading, setLoading] = useState(true)
  const [mesActual, setMesActual] = useState(new Date())

  useEffect(() => {
    loadCitas()
  }, [])

  const loadCitas = async () => {
    try {
      setLoading(true)
      const data = await citasService.getAll()
      setCitas(data)
    } catch (error: any) {
      toast.error("Error al cargar citas")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const diasDelMes = eachDayOfInterval({
    start: startOfMonth(mesActual),
    end: endOfMonth(mesActual),
  })

  // Agregar días del mes anterior para completar la primera semana
  const primerDia = startOfMonth(mesActual).getDay()
  const diasAnteriores = []
  for (let i = primerDia - 1; i >= 0; i--) {
    const dia = new Date(mesActual.getFullYear(), mesActual.getMonth(), -i)
    diasAnteriores.push(dia)
  }

  // Agregar días del mes siguiente para completar la última semana
  const ultimoDia = endOfMonth(mesActual).getDay()
  const diasSiguientes = []
  for (let i = 1; i <= (6 - ultimoDia); i++) {
    const dia = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, i)
    diasSiguientes.push(dia)
  }

  const todosDias = [...diasAnteriores, ...diasDelMes, ...diasSiguientes]

  const getCitasDelDia = (dia: Date) => {
    return citas.filter((c) => isSameDay(new Date(c.fecha), dia))
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <main className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Calendario</h1>
            <p className="text-sm text-muted-foreground">
              Vista mensual de citas
            </p>
          </div>
        </div>
        <Link href="/dashboard/citas">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Cita
          </Button>
        </Link>
      </div>

      {/* Navegación del mes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMesActual(subMonths(mesActual, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-lg">
              {format(mesActual, "MMMM yyyy", { locale: es }).charAt(0).toUpperCase() +
                format(mesActual, "MMMM yyyy", { locale: es }).slice(1)}
            </CardTitle>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMesActual(addMonths(mesActual, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((dia) => (
              <div key={dia} className="text-center text-sm font-medium text-muted-foreground p-2">
                {dia}
              </div>
            ))}
          </div>

          {/* Calendario */}
          <div className="grid grid-cols-7 gap-2">
            {todosDias.map((dia, index) => {
              const citasDelDia = getCitasDelDia(dia)
              const esDelMesActual = isSameMonth(dia, mesActual)
              const esHoy = isSameDay(dia, new Date())

              return (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 border rounded-lg ${
                    esDelMesActual ? "bg-background" : "bg-muted/30"
                  } ${esHoy ? "ring-2 ring-primary" : ""}`}
                >
                  <div className={`text-sm font-medium mb-1 ${esDelMesActual ? "" : "text-muted-foreground"}`}>
                    {format(dia, "d")}
                  </div>
                  <div className="space-y-1">
                    {citasDelDia.slice(0, 3).map((cita) => (
                      <div
                        key={cita.id}
                        className={`text-xs p-1 rounded text-white ${
                          estadoConfig[cita.estado as keyof typeof estadoConfig]?.color || "bg-gray-500"
                        }`}
                      >
                        <div className="font-medium truncate">
                          {format(new Date(cita.fecha), "HH:mm")}
                        </div>
                        <div className="truncate">
                          {cita.paciente ? `${cita.paciente.nombres} ${cita.paciente.apellidos}` : "Sin paciente"}
                        </div>
                      </div>
                    ))}
                    {citasDelDia.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{citasDelDia.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Leyenda */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Leyenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {Object.entries(estadoConfig).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${value.color}`}></div>
                <span className="text-sm">{value.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
