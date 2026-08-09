// Mapeo de categoria -> color de acento. Las categorias son las mismas
// 7 fijas que usa CategorizacionService en el backend (mas "Otros" como
// fallback y un color neutro por si llega null mientras el gasto todavia
// no fue clasificado).
const COLORES = {
  Comida: '#e8834a',
  Transporte: '#4a90e2',
  Servicios: '#7b61ff',
  Ocio: '#e24a8f',
  Salud: '#2fb380',
  Compras: '#d4a72c',
  Otros: '#8a8a8a',
}

export function colorCategoria(categoria) {
  return COLORES[categoria] || '#b0b0b0'
}

export const formatoMonto = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})
