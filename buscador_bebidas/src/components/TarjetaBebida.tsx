import type { Bebida } from '../types/bebidas'

type TarjetaBebidaProps = {
  bebida: Bebida
  cargandoDetalle: boolean
  alVerDetalles: (idBebida: string) => void
}

export function TarjetaBebida({ bebida, cargandoDetalle, alVerDetalles }: TarjetaBebidaProps) {
  return (
    <article className="tarjeta-bebida">
      <img src={bebida.imagen} alt={bebida.nombre} loading="lazy" />

      <div className="tarjeta-bebida-cuerpo">
        <h2>{bebida.nombre}</h2>

        <button
          type="button"
          className="boton-secundario"
          onClick={() => alVerDetalles(bebida.id)}
          disabled={cargandoDetalle}
        >
          {cargandoDetalle ? 'Cargando...' : 'Ver detalles'}
        </button>
      </div>
    </article>
  )
}

