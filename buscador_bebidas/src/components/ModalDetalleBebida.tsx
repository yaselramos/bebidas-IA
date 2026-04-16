import { Fragment, useRef } from 'react'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import type { DetalleBebida } from '../types/bebidas'

type ModalDetalleBebidaProps = {
  abierto: boolean
  detalle: DetalleBebida | null
  alCerrar: () => void
  alCerrarCompleto: () => void
  esFavorita: boolean
  alAlternarFavorito: (bebida: DetalleBebida) => void
}

export function ModalDetalleBebida({
  abierto,
  detalle,
  alCerrar,
  alCerrarCompleto,
  esFavorita,
  alAlternarFavorito,
}: ModalDetalleBebidaProps) {
  const botonCerrarRef = useRef<HTMLButtonElement | null>(null)

  return (
    <Transition appear show={abierto} as={Fragment} afterLeave={alCerrarCompleto}>
      <Dialog as="div" className="modal-raiz" onClose={alCerrar} initialFocus={botonCerrarRef}>
        <TransitionChild
          as={Fragment}
          enter="transicion-opacidad"
          enterFrom="transicion-opacidad-desde"
          enterTo="transicion-opacidad-hasta"
          leave="transicion-opacidad"
          leaveFrom="transicion-opacidad-hasta"
          leaveTo="transicion-opacidad-desde"
        >
          <div className="modal-fondo" aria-hidden="true" />
        </TransitionChild>

        <div className="modal-contenedor">
          <TransitionChild
            as={Fragment}
            enter="transicion-panel"
            enterFrom="transicion-panel-desde"
            enterTo="transicion-panel-hasta"
            leave="transicion-panel"
            leaveFrom="transicion-panel-hasta"
            leaveTo="transicion-panel-desde"
          >
            <DialogPanel className="modal-panel">
              {detalle && (
                <>
                  <button
                    ref={botonCerrarRef}
                    type="button"
                    className="modal-cerrar"
                    onClick={alCerrar}
                  >
                    ×
                  </button>

                  <img className="modal-imagen" src={detalle.imagen} alt={detalle.nombre} />

                  <div className="modal-contenido">
                    <DialogTitle as="h2" className="modal-titulo">
                      {detalle.nombre}
                    </DialogTitle>

                    <div className="acciones-modal">
                      <button
                        type="button"
                        className="boton-favorito"
                        onClick={() => alAlternarFavorito(detalle)}
                      >
                        {esFavorita ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                      </button>
                    </div>

                    <p>
                      <strong>Categoría:</strong> {detalle.categoria}
                    </p>
                    <p>
                      <strong>Tipo:</strong> {detalle.tipo}
                    </p>
                    <p>
                      <strong>Vaso recomendado:</strong> {detalle.vaso}
                    </p>
                    <p>
                      <strong>Instrucciones:</strong> {detalle.instrucciones}
                    </p>

                    {detalle.ingredientes.length > 0 && (
                      <div>
                        <h3>Ingredientes</h3>
                        <ul className="lista-ingredientes">
                          {detalle.ingredientes.map((ingrediente) => (
                            <li key={ingrediente}>{ingrediente}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </>
              )}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}

