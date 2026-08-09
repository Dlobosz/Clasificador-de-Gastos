import CategoriaBadge from './CategoriaBadge'
import { formatoMonto, colorCategoria } from '../utils/categorias'

// Agrega, sobre TODO el historico ya cargado en memoria (el mismo array
// que usa la pestaña "Gastos"), cuantos gastos y cuanto suman por
// categoria. No pega al backend: es una vista derivada, no hace falta
// un endpoint nuevo para esto.
export default function TipoDeGastos({ gastos, cargando, error }) {
  if (cargando) {
    return <p className="estado-vacio">Cargando…</p>
  }
  if (error) {
    return <p className="error">No se pudieron cargar los gastos. {error}</p>
  }
  if (gastos.length === 0) {
    return <p className="estado-vacio">Todavía no hay gastos registrados.</p>
  }

  const porCategoria = new Map()
  for (const gasto of gastos) {
    const categoria = gasto.categoria || 'Sin clasificar'
    const actual = porCategoria.get(categoria) || { cantidad: 0, total: 0 }
    actual.cantidad += 1
    actual.total += gasto.monto
    porCategoria.set(categoria, actual)
  }

  const filas = [...porCategoria.entries()].sort((a, b) => b[1].total - a[1].total)
  const maximo = filas.length ? filas[0][1].total : 0

  return (
    <section className="tipo-gastos">
      <div className="desglose">
        {filas.map(([categoria, { cantidad, total }]) => (
          <div className="desglose-fila" key={categoria}>
            <CategoriaBadge categoria={categoria === 'Sin clasificar' ? null : categoria} />
            <div className="barra-fondo">
              <div
                className="barra-relleno"
                style={{
                  width: `${(total / maximo) * 100}%`,
                  background: colorCategoria(categoria === 'Sin clasificar' ? null : categoria),
                }}
              />
            </div>
            <span className="desglose-cantidad">
              {cantidad} {cantidad === 1 ? 'gasto' : 'gastos'}
            </span>
            <span className="desglose-monto">{formatoMonto.format(total)}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
