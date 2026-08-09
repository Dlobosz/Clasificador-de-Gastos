const BASE_URL = '/api/v1/presupuestos'

async function manejarRespuesta(response) {
  if (!response.ok) {
    const texto = await response.text()
    throw new Error(texto || `Error ${response.status}`)
  }
  return response.json()
}

export async function obtenerPresupuesto(mes) {
  const res = await fetch(`${BASE_URL}/${mes}`)
  return manejarRespuesta(res)
}

export async function guardarPresupuesto(mes, monto) {
  const res = await fetch(`${BASE_URL}/${mes}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ monto }),
  })
  return manejarRespuesta(res)
}
