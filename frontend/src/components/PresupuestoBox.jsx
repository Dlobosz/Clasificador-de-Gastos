import { useEffect, useState } from 'react'
import { obtenerPresupuesto, guardarPresupuesto } from '../api/presupuestos'
import { formatoMonto } from '../utils/categorias'
import { formatoMesLargo } from '../utils/fechas'

// Recuadro para ver/editar el presupuesto de UN mes puntual. Se usa dos
// veces en la app con distinto "mes": en la pestaña Gastos con el mes
// actual, y en Resumen mensual con el mes que este seleccionado ahi.
// Cada instancia maneja su propio fetch, no comparten estado entre si
// (el backend es la unica fuente de verdad).
export default function PresupuestoBox({ mes, gastadoDelMes }) {
  const [presupuesto, setPresupuesto] = useState(null)
  const [editando, setEditando] = useState(false)
  const [valorInput, setValorInput] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelado = false
    setCargando(true)
    setEditando(false)
    setError(null)

    obtenerPresupuesto(mes)
      .then((data) => {
        if (cancelado) return
        setPresupuesto(data)
        setValorInput(data.monto ?? '')
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

  async function handleGuardar(e) {
    e.preventDefault()
    const monto = Number(valorInput)
    if (!valorInput || Number.isNaN(monto) || monto <= 0) {
      setError('El presupuesto debe ser un número mayor a 0.')
      return
    }
    setGuardando(true)
    setError(null)
    try {
      const actualizado = await guardarPresupuesto(mes, monto)
      setPresupuesto(actualizado)
      setEditando(false)
    } catch (err) {
      setError('No se pudo guardar. ' + err.message)
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return <div className="presupuesto-box estado-vacio">Cargando presupuesto…</div>
  }

  const monto = presupuesto?.monto ?? null
  const porcentaje = monto ? Math.min((gastadoDelMes / monto) * 100, 100) : null
  const sobrepasado = monto != null && gastadoDelMes > monto

  return (
    <div className="presupuesto-box">
      {editando ? (
        <form className="presupuesto-form" onSubmit={handleGuardar}>
          <label htmlFor={`presupuesto-${mes}`}>
            Presupuesto de {formatoMesLargo(mes)}
          </label>
          <div className="presupuesto-form-fila">
            <input
              id={`presupuesto-${mes}`}
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={valorInput}
              onChange={(e) => setValorInput(e.target.value)}
              disabled={guardando}
              autoFocus
            />
            <button type="submit" className="btn-primario" disabled={guardando}>
              {guardando ? 'Guardando…' : 'Guardar'}
            </button>
            {monto != null && (
              <button
                type="button"
                className="btn-secundario"
                onClick={() => setEditando(false)}
                disabled={guardando}
              >
                Cancelar
              </button>
            )}
          </div>
          {error && <p className="error">{error}</p>}
        </form>
      ) : monto == null ? (
        <div className="presupuesto-vacio">
          <span>Todavía no definiste un presupuesto para {formatoMesLargo(mes)}.</span>
          <button type="button" className="btn-secundario" onClick={() => setEditando(true)}>
            Definir presupuesto
          </button>
        </div>
      ) : (
        <div className="presupuesto-resumen">
          <div className="presupuesto-encabezado">
            <span className="presupuesto-label">Presupuesto de {formatoMesLargo(mes)}</span>
            <button type="button" className="btn-link" onClick={() => setEditando(true)}>
              Editar
            </button>
          </div>
          <div className="presupuesto-montos">
            <span className={sobrepasado ? 'presupuesto-gastado sobrepasado' : 'presupuesto-gastado'}>
              {formatoMonto.format(gastadoDelMes)}
            </span>
            <span className="presupuesto-total"> / {formatoMonto.format(monto)}</span>
          </div>
          <div className="barra-fondo">
            <div
              className={sobrepasado ? 'barra-relleno sobrepasado' : 'barra-relleno'}
              style={{ width: `${porcentaje}%` }}
            />
          </div>
          {sobrepasado && (
            <span className="presupuesto-alerta">Te pasaste del presupuesto este mes.</span>
          )}
        </div>
      )}
    </div>
  )
}
