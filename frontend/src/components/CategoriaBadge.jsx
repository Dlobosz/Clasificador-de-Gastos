import { colorCategoria } from '../utils/categorias'

// Mientras el backend todavia no le asigna categoria a un gasto
// (por ejemplo si Groq fallo), "categoria" llega como null.
export default function CategoriaBadge({ categoria }) {
  const color = colorCategoria(categoria)
  return (
    <span className="badge" style={{ '--badge-color': color }}>
      {categoria || 'Sin clasificar'}
    </span>
  )
}
