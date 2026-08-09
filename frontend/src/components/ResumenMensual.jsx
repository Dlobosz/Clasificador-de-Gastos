import { useEffect, useState } from 'react'
import { obtenerResumenMensual } from '../api/gastos'
import { formatoMonto } from '../utils/categorias'
import { mesActual } from '../utils/fechas'
import PresupuestoBox from './PresupuestoBox'
import GraficoCategorias from './GraficoCategorias'

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

      <PresupuestoBox mes={mes} gastadoDelMes={resumen?.totalGastado ?? 0} />

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

          {resumen.cantidadGastos === 0 ? (
            <p className="estado-vacio">No hay gastos registrados para este mes.</p>
          ) : (
            <>
              <div className="recuadro">
                <h3>Gastos por categoría</h3>
                <GraficoCategorias
                  totalPorCategoria={resumen.totalPorCategoria}
                  totalGastado={resumen.totalGastado}
                  presupuesto={resumen.presupuesto}
                />
              </div>

              {resumen.consejosAhorro && (
                <div className="recuadro">
                  <h3>Consejos de ahorro</h3>
                  <p className="consejos-texto">{resumen.consejosAhorro}</p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </section>
  )
}
