"use client"

import { useEffect, useState } from "react"
import { statsService, type DashboardStats } from "@/lib/stats"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, CalendarCheck, Clock } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const estadoConfig = {
  pendiente: { label: "Pendiente", color: "bg-yellow-600" },
  completada: { label: "Completada", color: "bg-emerald-600" },
  cancelada: { label: "Cancelada", color: "bg-red-600" },
  en_curso: { label: "En curso", color: "bg-blue-600" },
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const loadStats = async () => {
    try {
      setLoading(true)
      const data = await statsService.getDashboardStats()
      setStats(data)
    } catch (error) {
      toast.error("Error al cargar estadísticas")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen general del consultorio psicológico
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPacientes || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.pacientesActivos || 0} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Citas del Mes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.citasMes || 0}</div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(), "MMMM yyyy", { locale: es })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Citas de Hoy</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.citasHoy || 0}</div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(), "dd 'de' MMMM", { locale: es })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas Citas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.proximasCitas.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Pendientes hoy</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Próximas Citas de Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            {!stats?.proximasCitas.length ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay citas pendientes para hoy
              </div>
            ) : (
              <div className="space-y-3">
                {stats.proximasCitas.map((cita) => (
                  <div
                    key={cita.id}
                    className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {format(new Date(cita.fecha), "HH:mm", { locale: es })}
                        </span>
                        <Badge
                          variant="default"
                          className={
                            estadoConfig[cita.estado as keyof typeof estadoConfig]
                              ?.color || "bg-gray-600"
                          }
                        >
                          {estadoConfig[cita.estado as keyof typeof estadoConfig]
                            ?.label || cita.estado}
                        </Badge>
                      </div>
                      <div className="text-sm font-medium">
                        {cita.paciente.nombres} {cita.paciente.apellidos}
                      </div>
                      {cita.motivo && (
                        <div className="text-sm text-muted-foreground">
                          {cita.motivo}
                        </div>
                      )}
                      {cita.paciente.telefono && (
                        <div className="text-xs text-muted-foreground">
                          {cita.paciente.telefono}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <Link href="/dashboard/citas">
                  <Button variant="outline" className="w-full mt-4">
                    Ver todas las citas
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estadísticas de Citas del Mes</CardTitle>
          </CardHeader>
          <CardContent>
            {!stats?.citasPorEstado.length ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay citas este mes
              </div>
            ) : (
              <div className="space-y-3">
                {stats.citasPorEstado.map((item) => {
                  const config =
                    estadoConfig[item.estado as keyof typeof estadoConfig] || {
                      label: item.estado,
                      color: "bg-gray-600",
                    }
                  return (
                    <div
                      key={item.estado}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="default" className={config.color}>
                          {config.label}
                        </Badge>
                      </div>
                      <span className="text-2xl font-bold">{item.cantidad}</span>
                    </div>
                  )
                })}
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center font-medium">
                    <span>Total del mes</span>
                    <span className="text-2xl">{stats?.citasMes || 0}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
