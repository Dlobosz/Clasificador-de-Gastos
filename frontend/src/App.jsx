import { useEffect, useState } from 'react'
import GastoForm from './components/GastoForm'
import GastoList from './components/GastoList'
import EditarGastoModal from './components/EditarGastoModal'
import TipoDeGastos from './components/TipoDeGastos'
import ResumenMensual from './components/ResumenMensual'
import PresupuestoBox from './components/PresupuestoBox'
import { listarGastos, obtenerCategorias } from './api/gastos'
import { mesActual } from './utils/fechas'
import './App.css'

const TABS = [
  { id: 'gastos', label: 'Gastos' },
  { id: 'categorias', label: 'Por categoría' },
  { id: 'recurrentes', label: 'Recurrentes' },
  { id: 'resumen', label: 'Resumen mensual' },
]

function App() {
  const [vista, setVista] = useState('gastos')
  const [gastos, setGastos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [categorias, setCategorias] = useState([])
  const [gastoEnEdicion, setGastoEnEdicion] = useState(null)

  function cargarGastos() {
    setCargando(true)
    setError(null)
    listarGastos()
      .then(setGastos)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    cargarGastos()
    // La lista de categorias viene del backend (misma fuente que usa
    // Groq para clasificar) para no duplicarla a mano en el frontend.
    obtenerCategorias()
      .then(setCategorias)
      .catch(() => setCategorias([]))
  }, [])

  function handleGastoCreado(nuevoGasto) {
    setGastos((prev) => [...prev, nuevoGasto])
  }

  function handleGastoActualizado(gastoActualizado) {
    setGastos((prev) =>
      prev.map((g) => (g.id === gastoActualizado.id ? gastoActualizado : g)),
    )
    setGastoEnEdicion(null)
  }

  const gastosRecurrentes = gastos.filter((g) => g.esRecurrente)

  const mesDeHoy = mesActual()
  const gastadoEsteMes = gastos
    .filter((g) => g.fecha.startsWith(mesDeHoy))
    .reduce((suma, g) => suma + g.monto, 0)

  return (
    <div className="app">
      <header className="app-header">
        <h1>Clasificador de Gastos</h1>
        <nav className="tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={vista === tab.id ? 'tab activa' : 'tab'}
              onClick={() => setVista(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="app-main">
        {vista === 'gastos' && (
          <>
            <PresupuestoBox mes={mesDeHoy} gastadoDelMes={gastadoEsteMes} />
            <GastoForm onGastoCreado={handleGastoCreado} />
            <GastoList
              gastos={gastos}
              cargando={cargando}
              error={error}
              onEditar={setGastoEnEdicion}
            />
          </>
        )}

        {vista === 'categorias' && (
          <TipoDeGastos gastos={gastos} cargando={cargando} error={error} />
        )}

        {vista === 'recurrentes' && (
          <GastoList
            gastos={gastosRecurrentes}
            cargando={cargando}
            error={error}
            onEditar={setGastoEnEdicion}
            mensajeVacio="Todavía no marcaste ningún gasto como recurrente."
          />
        )}

        {vista === 'resumen' && <ResumenMensual />}
      </main>

      {gastoEnEdicion && categorias.length > 0 && (
        <EditarGastoModal
          gasto={gastoEnEdicion}
          categorias={categorias}
          onClose={() => setGastoEnEdicion(null)}
          onGuardado={handleGastoActualizado}
        />
      )}
    </div>
  )
}

export default App
