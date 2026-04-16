import type { FormEventHandler } from 'react'
import { FormularioBusqueda } from '../components/FormularioBusqueda'
import { TarjetaBebida } from '../components/TarjetaBebida'
import type { Bebida, Categoria } from '../types/bebidas'

type InicioPaginaProps = {
  terminoBusqueda: string
  categoriaSeleccionada: string
  categorias: Categoria[]
  cargando: boolean
  error: string
  haBuscado: boolean
  terminoBuscado: string
  categoriaBuscada: string
  bebidasFiltradas: Bebida[]
  idBebidaCargandoDetalle: string
  alCambiarTermino: (valor: string) => void
  alCambiarCategoria: (valor: string) => void
  alEnviar: FormEventHandler<HTMLFormElement>
  alVerDetalles: (idBebida: string) => void
}

export function InicioPagina({
  terminoBusqueda,
  categoriaSeleccionada,
  categorias,
  cargando,
  error,
  haBuscado,
  terminoBuscado,
  categoriaBuscada,
  bebidasFiltradas,
  idBebidaCargandoDetalle,
  alCambiarTermino,
  alCambiarCategoria,
  alEnviar,
  alVerDetalles,
}: InicioPaginaProps) {
  return (
    <section className="pagina">
      <p className="mensaje texto-ayuda">
        Completa ambos campos y presiona el botón para buscar las bebidas de la categoría.
      </p>

      <FormularioBusqueda
        terminoBusqueda={terminoBusqueda}
        categoriaSeleccionada={categoriaSeleccionada}
        categorias={categorias}
        cargando={cargando}
        alCambiarTermino={alCambiarTermino}
        alCambiarCategoria={alCambiarCategoria}
        alEnviar={alEnviar}
      />

      {error && <p className="mensaje mensaje-error">{error}</p>}

      {haBuscado && !error && (
        <p className="mensaje resumen-resultados">
          Resultados para <strong>{terminoBuscado}</strong> en <strong>{categoriaBuscada}</strong>.
        </p>
      )}

      {!cargando && !error && haBuscado && bebidasFiltradas.length === 0 && (
        <p className="mensaje">No se encontraron bebidas con esos criterios.</p>
      )}

      <section className="seccion-bebidas">
        <div className="encabezado-seccion">
          <h2>Resultados</h2>
          <span className="contador-seccion">{bebidasFiltradas.length} bebidas</span>
        </div>

        <div className="grilla-bebidas" aria-live="polite">
          {bebidasFiltradas.map((bebida) => (
            <TarjetaBebida
              key={bebida.id}
              bebida={bebida}
              cargandoDetalle={idBebidaCargandoDetalle === bebida.id}
              alVerDetalles={alVerDetalles}
            />
          ))}
        </div>
      </section>
    </section>
  )
}

