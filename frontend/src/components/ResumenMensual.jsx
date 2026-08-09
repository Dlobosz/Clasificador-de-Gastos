import { useEffect, useState } from 'react'
import { obtenerResumenMensual } from '../api/gastos'
import CategoriaBadge from './CategoriaBadge'
import { formatoMonto, colorCategoria } from '../utils/categorias'

function mesActual() {
  const hoy = new Date()
  const mm = String(hoy.getMonth() + 1).padStart(2, '0')
  return `${hoy.getFullYear()}-${mm}`
}

export default function ResumenMensual() {
  const [mes, setMes] = useState(mesActual())
  const [resumen, setResumen] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelado = false
    setCargando(true)
    setError(null)

    obtenerResumenMensual(mes)
      .then((data) => {
        if (!cancelado) setResumen(data)
      })
      .catch((err) => {
        if (!cancelado) setError(err.message)
      })
      .finally(() => {
        if (!cancelado) setCargando(false)
      })

    return () => {
      cancelado = true
    }
  }, [mes])

  const categorias = resumen?.totalPorCategoria
    ? Object.entries(resumen.totalPorCategoria).sort((a, b) => b[1] - a[1])
    : []
  const maximo = categorias.length ? categorias[0][1] : 0

  return (
    <section className="resumen">
      <div className="selector-mes">
        <label htmlFor="mes">Mes</label>
        <input
          id="mes"
          type="month"
          value={mes}
          onChange={(e) => setMes(e.target.value)}
        />
      </div>

      {cargando && <p className="estado-vacio">Cargando resumen…</p>}
      {error && <p className="error">No se pudo cargar el resumen. {error}</p>}

      {!cargando && !error && resumen && (
        <>
          <div className="resumen-totales">
            <div className="stat">
              <span className="stat-valor">{formatoMonto.format(resumen.totalGastado)}</span>
              <span className="stat-label">Total gastado</span>
            </div>
            <div className="stat">
              <span className="stat-valor">{resumen.cantidadGastos}</span>
              <span className="stat-label">Gastos registrados</span>
            </div>
          </div>

          {categorias.length > 0 && (
            <div className="desglose">
              {categorias.map(([categoria, total]) => (
                <div className="desglose-fila" key={categoria}>
                  <CategoriaBadge categoria={categoria} />
                  <div className="barra-fondo">
                    <div
                      className="barra-relleno"
                      style={{
                        width: `${(total / maximo) * 100}%`,
                        background: colorCategoria(categoria),
                      }}
                    />
                  </div>
                  <span className="desglose-monto">{formatoMonto.format(total)}</span>
                </div>
              ))}
            </div>
          )}

          {resumen.resumenTexto && (
            <p className="resumen-texto">{resumen.resumenTexto}</p>
          )}

          {resumen.cantidadGastos === 0 && (
            <p className="estado-vacio">No hay gastos registrados para este mes.</p>
          )}
        </>
      )}
    </section>
  )
}
