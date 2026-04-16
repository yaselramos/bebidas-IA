import { TarjetaBebida } from '../components/TarjetaBebida'
import type { Bebida } from '../types/bebidas'

type FavoritosPaginaProps = {
  favoritos: Bebida[]
  idBebidaCargandoDetalle: string
  alVerDetalles: (idBebida: string) => void
}

export function FavoritosPagina({
  favoritos,
  idBebidaCargandoDetalle,
  alVerDetalles,
}: FavoritosPaginaProps) {
  return (
    <section className="pagina">
      <section className="seccion-bebidas">
        <div className="encabezado-seccion">
          <h2>Mis favoritos</h2>
          <span className="contador-seccion">{favoritos.length} bebidas</span>
        </div>

        {favoritos.length === 0 ? (
          <p className="mensaje mensaje-suave">
            Aún no tienes favoritos. Abre el detalle de una bebida y agrégala a tus favoritos.
          </p>
        ) : (
          <div className="grilla-bebidas" aria-live="polite">
            {favoritos.map((bebida) => (
              <TarjetaBebida
                key={bebida.id}
                bebida={bebida}
                cargandoDetalle={idBebidaCargandoDetalle === bebida.id}
                alVerDetalles={alVerDetalles}
              />
            ))}
          </div>
        )}
      </section>
    </section>
  )
}

