import { colorCategoria, formatoMonto } from '../utils/categorias'

const COLOR_DISPONIBLE = '#d8d6dc'

// Grafico de torta (dona) armado con conic-gradient de CSS puro, sin
// libreria de charts: alcanza para mostrar proporciones de categorias +
// cuanto queda disponible del presupuesto, y es coherente con lo liviano
// que es el resto del proyecto.
export default function GraficoCategorias({ totalPorCategoria, totalGastado, presupuesto }) {
  const categorias = Object.entries(totalPorCategoria).sort((a, b) => b[1] - a[1])

  if (categorias.length === 0) {
    return <p className="estado-vacio">Todavía no hay gastos para graficar.</p>
  }

  const sobrepasado = presupuesto != null && totalGastado > presupuesto
  const disponible = presupuesto != null && !sobrepasado ? presupuesto - totalGastado : 0
  // Si hay presupuesto (y no esta sobrepasado), el 100% del circulo
  // representa el presupuesto completo, no solo lo gastado - asi se ve
  // cuanto queda libre. Sin presupuesto, el 100% es simplemente el total
  // gastado repartido por categoria.
  const base = presupuesto != null && !sobrepasado ? presupuesto : totalGastado

  const slices = [
    ...categorias.map(([categoria, monto]) => ({
      label: categoria,
      monto,
      color: colorCategoria(categoria),
    })),
    ...(disponible > 0
      ? [{ label: 'Disponible', monto: disponible, color: COLOR_DISPONIBLE }]
      : []),
  ]

  let acumulado = 0
  const partesGradiente = slices.map(({ color, monto }) => {
    const inicio = acumulado
    acumulado += (monto / base) * 100
    return `${color} ${inicio}% ${acumulado}%`
  })

  return (
    <div className="grafico-categorias">
      <div className="grafico-torta" style={{ background: `conic-gradient(${partesGradiente.join(', ')})` }}>
        <div className="grafico-torta-centro">
          <span className="grafico-torta-total">{formatoMonto.format(totalGastado)}</span>
          <span className="grafico-torta-label">gastado</span>
        </div>
      </div>

      <ul className="grafico-leyenda">
        {slices.map(({ label, monto, color }) => (
          <li key={label}>
            <span className="leyenda-punto" style={{ background: color }} />
            <span className="leyenda-label">{label}</span>
            <span className="leyenda-monto">{formatoMonto.format(monto)}</span>
          </li>
        ))}
      </ul>

      {sobrepasado && (
        <p className="presupuesto-alerta">
          Te pasaste del presupuesto por {formatoMonto.format(totalGastado - presupuesto)}.
        </p>
      )}
    </div>
  )
}
