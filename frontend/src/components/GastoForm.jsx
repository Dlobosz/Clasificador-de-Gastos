import { useState } from 'react'
import { crearGasto } from '../api/gastos'

const ESTADO_INICIAL = { descripcion: '', monto: '', fecha: '', esRecurrente: false }

export default function GastoForm({ onGastoCreado }) {
  const [form, setForm] = useState(ESTADO_INICIAL)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  function actualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!form.descripcion.trim()) {
      setError('La descripción no puede estar vacía.')
      return
    }
    const montoNum = Number(form.monto)
    if (!form.monto || Number.isNaN(montoNum) || montoNum <= 0) {
      setError('El monto debe ser un número mayor a 0.')
      return
    }

    setEnviando(true)
    try {
      // La categoria la asigna el backend llamando a Groq; por eso el
      // formulario no la pide. Puede tardar un par de segundos porque
      // implica una llamada a la API de Groq.
      const gastoCreado = await crearGasto({
        descripcion: form.descripcion.trim(),
        monto: montoNum,
        fecha: form.fecha || null,
        esRecurrente: form.esRecurrente,
      })
      setForm(ESTADO_INICIAL)
      onGastoCreado(gastoCreado)
    } catch (err) {
      setError('No se pudo crear el gasto. ' + err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="gasto-form" onSubmit={handleSubmit}>
      <div className="campo">
        <label htmlFor="descripcion">Descripción</label>
        <input
          id="descripcion"
          type="text"
          placeholder="Ej: Almuerzo en restaurante"
          value={form.descripcion}
          onChange={(e) => actualizarCampo('descripcion', e.target.value)}
          disabled={enviando}
        />
      </div>

      <div className="campo campo-monto">
        <label htmlFor="monto">Monto</label>
        <input
          id="monto"
          type="number"
          min="0"
          step="1"
          placeholder="0"
          value={form.monto}
          onChange={(e) => actualizarCampo('monto', e.target.value)}
          disabled={enviando}
        />
      </div>

      <div className="campo campo-fecha">
        <label htmlFor="fecha">Fecha</label>
        <input
          id="fecha"
          type="date"
          value={form.fecha}
          onChange={(e) => actualizarCampo('fecha', e.target.value)}
          disabled={enviando}
        />
        <span className="hint">Opcional, hoy por defecto</span>
      </div>

      <label className="campo-checkbox">
        <input
          type="checkbox"
          checked={form.esRecurrente}
          onChange={(e) => actualizarCampo('esRecurrente', e.target.checked)}
          disabled={enviando}
        />
        Es un Gasto Recurrente (Ej: Stream, IA, Cuentas, etc.)
      </label>

      <button type="submit" className="btn-primario" disabled={enviando}>
        {enviando ? 'Clasificando…' : 'Agregar gasto'}
      </button>

      {error && <p className="error">{error}</p>}
    </form>
  )
}
