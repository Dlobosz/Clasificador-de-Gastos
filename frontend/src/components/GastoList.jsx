import CategoriaBadge from './CategoriaBadge'
import { formatoMonto } from '../utils/categorias'

export default function GastoList({ gastos, cargando, error }) {
  if (cargando) {
    return <p className="estado-vacio">Cargando gastos…</p>
  }

  if (error) {
    return <p className="error">No se pudieron cargar los gastos. {error}</p>
  }

  if (gastos.length === 0) {
    return <p className="estado-vacio">Todavía no hay gastos registrados.</p>
  }

  // Los mas recientes primero.
  const ordenados = [...gastos].sort((a, b) => (a.fecha < b.fecha ? 1 : -1))

  return (
    <table className="tabla-gastos">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Descripción</th>
          <th>Categoría</th>
          <th className="col-monto">Monto</th>
        </tr>
      </thead>
      <tbody>
        {ordenados.map((gasto) => (
          <tr key={gasto.id}>
            <td>{gasto.fecha}</td>
            <td>{gasto.descripcion}</td>
            <td>
              <CategoriaBadge categoria={gasto.categoria} />
            </td>
            <td className="col-monto">{formatoMonto.format(gasto.monto)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
