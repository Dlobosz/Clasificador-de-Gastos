import { useEffect, useState } from 'react'
import GastoForm from './components/GastoForm'
import GastoList from './components/GastoList'
import ResumenMensual from './components/ResumenMensual'
import { listarGastos } from './api/gastos'
import './App.css'

function App() {
  const [vista, setVista] = useState('gastos')
  const [gastos, setGastos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

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
  }, [])

  function handleGastoCreado(nuevoGasto) {
    setGastos((prev) => [...prev, nuevoGasto])
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Clasificador de Gastos</h1>
        <nav className="tabs">
          <button
            className={vista === 'gastos' ? 'tab activa' : 'tab'}
            onClick={() => setVista('gastos')}
          >
            Gastos
          </button>
          <button
            className={vista === 'resumen' ? 'tab activa' : 'tab'}
            onClick={() => setVista('resumen')}
          >
            Resumen mensual
          </button>
        </nav>
      </header>

      <main className="app-main">
        {vista === 'gastos' ? (
          <>
            <GastoForm onGastoCreado={handleGastoCreado} />
            <GastoList gastos={gastos} cargando={cargando} error={error} />
          </>
        ) : (
          <ResumenMensual />
        )}
      </main>
    </div>
  )
}

export default App
