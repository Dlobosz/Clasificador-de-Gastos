// Cliente HTTP para la API de gastos.
// Usa rutas relativas ("/api/v1/gastos") a proposito: en desarrollo el
// proxy de Vite (ver vite.config.js) las redirige a localhost:8080, y en
// produccion Spring Boot sirve el frontend y el backend desde el mismo
// origen, asi que no hace falta configurar una URL base ni CORS.

const BASE_URL = '/api/v1/gastos'

async function manejarRespuesta(response) {
  if (!response.ok) {
    // El backend a veces responde con texto plano (ej. el error de
    // formato de mes invalido) y otras con JSON de error de validacion.
    const texto = await response.text()
    throw new Error(texto || `Error ${response.status}`)
  }
  // Algunas respuestas (poco probable aca, pero por las dudas) podrian
  // no traer body.
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return response.json()
  }
  return response.text()
}

export async function listarGastos() {
  const res = await fetch(BASE_URL)
  return manejarRespuesta(res)
}

export async function crearGasto({ descripcion, monto, fecha }) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ descripcion, monto, fecha: fecha || null }),
  })
  return manejarRespuesta(res)
}

export async function obtenerResumenMensual(mes) {
  const res = await fetch(`${BASE_URL}/resumen?mes=${encodeURIComponent(mes)}`)
  return manejarRespuesta(res)
}
