export function mesActual() {
  const hoy = new Date()
  const mm = String(hoy.getMonth() + 1).padStart(2, '0')
  return `${hoy.getFullYear()}-${mm}`
}

const formateadorMesLargo = new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric' })

// "2026-08" -> "agosto 2026"
export function formatoMesLargo(mes) {
  const [anio, mesNum] = mes.split('-').map(Number)
  return formateadorMesLargo.format(new Date(anio, mesNum - 1, 1))
}
