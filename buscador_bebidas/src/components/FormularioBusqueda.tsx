import type { FormEventHandler } from 'react'
import type { Categoria } from '../types/bebidas'

type FormularioBusquedaProps = {
  terminoBusqueda: string
  categoriaSeleccionada: string
  categorias: Categoria[]
  cargando: boolean
  alCambiarTermino: (valor: string) => void
  alCambiarCategoria: (valor: string) => void
  alEnviar: FormEventHandler<HTMLFormElement>
}

export function FormularioBusqueda({
  terminoBusqueda,
  categoriaSeleccionada,
  categorias,
  cargando,
  alCambiarTermino,
  alCambiarCategoria,
  alEnviar,
}: FormularioBusquedaProps) {
  return (
    <form className="formulario-busqueda" onSubmit={alEnviar}>
      <div className="campo-formulario">
        <label htmlFor="terminoBusqueda">Nombre de bebida</label>
        <input
          id="terminoBusqueda"
          type="text"
          placeholder="Ej: margarita"
          value={terminoBusqueda}
          onChange={(evento) => alCambiarTermino(evento.target.value)}
        />
      </div>

      <div className="campo-formulario">
        <label htmlFor="categoria">Categoría</label>
        <select
          id="categoria"
          value={categoriaSeleccionada}
          onChange={(evento) => alCambiarCategoria(evento.target.value)}
        >
          <option value="">-- Selecciona una categoría --</option>
          {categorias.map((categoria) => (
            <option key={categoria.nombre} value={categoria.nombre}>
              {categoria.nombre}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={cargando}>
        {cargando ? 'Buscando...' : 'Buscar bebidas'}
      </button>
    </form>
  )
}

