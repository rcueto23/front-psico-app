import type { Paciente } from "./pacientes"
import type { Cita } from "./citas"
import { format } from "date-fns"

export function exportarPacientesAExcel(pacientes: Paciente[], nombreArchivo = "pacientes") {
  // Encabezados
  const headers = [
    "Nombres",
    "Apellidos",
    "Tipo Documento",
    "Documento",
    "Email",
    "Teléfono",
    "Fecha Nacimiento",
    "Sexo",
    "Dirección",
    "Estado",
    "Etiquetas",
    "Notas",
  ]

  // Convertir datos a filas
  const rows = pacientes.map((p) => [
    p.nombres,
    p.apellidos,
    p.tipoDocumento,
    p.documento,
    p.email || "",
    p.telefono || "",
    p.nacimiento ? format(new Date(p.nacimiento), "dd/MM/yyyy") : "",
    p.sexo,
    p.direccion || "",
    p.estado,
    p.etiquetas || "",
    p.notas || "",
  ])

  // Generar CSV
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n")

  // Descargar archivo
  descargarCSV(csvContent, `${nombreArchivo}_${format(new Date(), "yyyy-MM-dd")}.csv`)
}

export function exportarCitasAExcel(citas: Cita[], nombreArchivo = "citas") {
  // Encabezados
  const headers = [
    "Fecha",
    "Hora",
    "Paciente",
    "Documento",
    "Duración (min)",
    "Estado",
    "Motivo",
    "Notas",
  ]

  // Convertir datos a filas
  const rows = citas.map((c) => [
    format(new Date(c.fecha), "dd/MM/yyyy"),
    format(new Date(c.fecha), "HH:mm"),
    c.paciente ? `${c.paciente.nombres} ${c.paciente.apellidos}` : "",
    c.paciente?.documento || "",
    c.duracion,
    c.estado,
    c.motivo || "",
    c.notas || "",
  ])

  // Generar CSV
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n")

  // Descargar archivo
  descargarCSV(csvContent, `${nombreArchivo}_${format(new Date(), "yyyy-MM-dd")}.csv`)
}

function descargarCSV(contenido: string, nombreArchivo: string) {
  // Agregar BOM para que Excel reconozca UTF-8
  const BOM = "\uFEFF"
  const blob = new Blob([BOM + contenido], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", nombreArchivo)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
