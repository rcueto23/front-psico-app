"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { pacientesService, type Paciente } from "@/lib/pacientes"
import { citasService, type Cita } from "@/lib/citas"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Phone, Mail, MapPin, FileText, Plus } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"

const estadoConfig = {
  pendiente: { label: "Pendiente", color: "bg-yellow-600" },
  completada: { label: "Completada", color: "bg-emerald-600" },
  cancelada: { label: "Cancelada", color: "bg-red-600" },
  en_curso: { label: "En curso", color: "bg-blue-600" },
}

export default function PerfilPacientePage() {
  const params = useParams()
  const router = useRouter()
  const pacienteId = params.id as string

  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [citas, setCitas] = useState<Cita[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [pacienteId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [pacienteData, citasData] = await Promise.all([
        pacientesService.getOne(pacienteId),
        citasService.getByPaciente(pacienteId),
      ])
      setPaciente(pacienteData)
      setCitas(citasData)
    } catch (error: any) {
      toast.error("Error al cargar el perfil del paciente")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!paciente) {
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Paciente no encontrado</p>
          <Button onClick={() => router.push("/dashboard/pacientes")} className="mt-4">
            Volver a pacientes
          </Button>
        </div>
      </div>
    )
  }

  const citasCompletadas = citas.filter((c) => c.estado === "completada").length
  const citasPendientes = citas.filter((c) => c.estado === "pendiente").length
  const proximaCita = citas
    .filter((c) => c.estado === "pendiente" && new Date(c.fecha) > new Date())
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())[0]

  return (
    <main className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/pacientes")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {paciente.nombres} {paciente.apellidos}
          </h1>
          <p className="text-sm text-muted-foreground">
            {paciente.tipoDocumento}: {paciente.documento}
          </p>
        </div>
        <Badge variant={paciente.estado === "activo" ? "default" : "outline"}>
          {paciente.estado === "activo" ? "Activo" : "Inactivo"}
        </Badge>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Citas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{citas.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{citasCompletadas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{citasPendientes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próxima Cita</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {proximaCita ? format(new Date(proximaCita.fecha), "dd MMM", { locale: es }) : "Sin citas"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Información del Paciente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Información Personal</span>
              <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/pacientes")}>
                Editar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {paciente.telefono && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Teléfono</p>
                  <p className="text-sm text-muted-foreground">{paciente.telefono}</p>
                </div>
              </div>
            )}

            {paciente.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{paciente.email}</p>
                </div>
              </div>
            )}

            {paciente.direccion && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Dirección</p>
                  <p className="text-sm text-muted-foreground">{paciente.direccion}</p>
                </div>
              </div>
            )}

            {paciente.nacimiento && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Fecha de Nacimiento</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(paciente.nacimiento), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Sexo</p>
                <p className="text-sm text-muted-foreground">{paciente.sexo}</p>
              </div>
            </div>

            {paciente.notas && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">Notas</p>
                <p className="text-sm text-muted-foreground">{paciente.notas}</p>
              </div>
            )}

            {paciente.etiquetas && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">Etiquetas</p>
                <div className="flex flex-wrap gap-1">
                  {paciente.etiquetas.split(",").map((etiqueta) => (
                    <Badge key={etiqueta.trim()} variant="secondary">
                      {etiqueta.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Historial de Citas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Historial de Citas</span>
              <Link href={`/dashboard/citas?paciente=${pacienteId}`}>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Cita
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {citas.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay citas registradas
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {citas
                  .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                  .map((cita) => (
                    <div
                      key={cita.id}
                      className="p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">
                            {format(new Date(cita.fecha), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(cita.fecha), "HH:mm", { locale: es })} • {cita.duracion} min
                          </p>
                        </div>
                        <Badge
                          variant="default"
                          className={estadoConfig[cita.estado as keyof typeof estadoConfig]?.color || "bg-gray-600"}
                        >
                          {estadoConfig[cita.estado as keyof typeof estadoConfig]?.label || cita.estado}
                        </Badge>
                      </div>
                      {cita.motivo && (
                        <p className="text-sm text-muted-foreground mb-1">
                          <span className="font-medium">Motivo:</span> {cita.motivo}
                        </p>
                      )}
                      {cita.notas && (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Notas:</span> {cita.notas}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
