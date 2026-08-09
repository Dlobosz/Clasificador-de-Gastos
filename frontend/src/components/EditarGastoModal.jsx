import { useState } from 'react'
import { actualizarGasto } from '../api/gastos'

export default function EditarGastoModal({ gasto, categorias, onClose, onGuardado }) {
  const [form, setForm] = useState({
    monto: gasto.monto,
    categoria: gasto.categoria || categorias[0],
    fecha: gasto.fecha,
    esRecurrente: gasto.esRecurrente,
  })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  function actualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    const montoNum = Number(form.monto)
    if (!form.monto || Number.isNaN(montoNum) || montoNum <= 0) {
      setError('El monto debe ser un número mayor a 0.')
      return
    }

    setGuardando(true)
    try {
      const gastoActualizado = await actualizarGasto(gasto.id, {
        monto: montoNum,
        categoria: form.categoria,
        fecha: form.fecha,
        esRecurrente: form.esRecurrente,
      })
      onGuardado(gastoActualizado)
    } catch (err) {
      setError('No se pudo guardar. ' + err.message)
      setGuardando(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Editar gasto</h2>
        <p className="modal-descripcion">{gasto.descripcion}</p>

        <form onSubmit={handleSubmit}>
          <div className="campo">
            <label htmlFor="edit-monto">Monto</label>
            <input
              id="edit-monto"
              type="number"
              min="0"
              step="1"
              value={form.monto}
              onChange={(e) => actualizarCampo('monto', e.target.value)}
              disabled={guardando}
            />
          </div>

          <div className="campo">
            <label htmlFor="edit-categoria">Categoría</label>
            <select
              id="edit-categoria"
              value={form.categoria}
              onChange={(e) => actualizarCampo('categoria', e.target.value)}
              disabled={guardando}
            >
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor="edit-fecha">Fecha</label>
            <input
              id="edit-fecha"
              type="date"
              value={form.fecha}
              onChange={(e) => actualizarCampo('fecha', e.target.value)}
              disabled={guardando}
            />
          </div>

          <label className="campo-checkbox">
            <input
              type="checkbox"
              checked={form.esRecurrente}
              onChange={(e) => actualizarCampo('esRecurrente', e.target.checked)}
              disabled={guardando}
            />
            Es un gasto recurrente
          </label>

          {error && <p className="error">{error}</p>}

          <div className="modal-acciones">
            <button type="button" className="btn-secundario" onClick={onClose} disabled={guardando}>
              Cancelar
            </button>
            <button type="submit" className="btn-primario" disabled={guardando}>
              {guardando ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
