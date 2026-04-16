import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { ModalDetalleBebida } from './components/ModalDetalleBebida'
import { NavLink, Route, Routes } from 'react-router-dom'
import { FavoritosPagina } from './pages/FavoritosPagina'
import { InicioPagina } from './pages/InicioPagina'
import { BusquedaIAPagina } from './pages/BusquedaIAPagina'
import {
  buscarBebidasPorCategoria,
  obtenerCategorias,
  obtenerDetalleBebida,
} from './services/bebidas'
import type { Bebida, Categoria, DetalleBebida } from './types/bebidas'

const CLAVE_FAVORITOS = 'bebidas:favoritos'

function obtenerFavoritosIniciales(): Bebida[] {
  if (typeof window === 'undefined') {
    return []
  }

  const favoritosGuardados = window.localStorage.getItem(CLAVE_FAVORITOS)

  if (!favoritosGuardados) {
    return []
  }

  try {
    const favoritosParseados: unknown = JSON.parse(favoritosGuardados)

    if (!Array.isArray(favoritosParseados)) {
      return []
    }

    return favoritosParseados.filter((favorito): favorito is Bebida => {
      if (typeof favorito !== 'object' || favorito === null) {
        return false
      }

      const candidato = favorito as Partial<Bebida>

      return (
        typeof candidato.id === 'string' &&
        typeof candidato.nombre === 'string' &&
        typeof candidato.imagen === 'string'
      )
    })
  } catch {
    return []
  }
}

function App() {
  const [terminoBusqueda, setTerminoBusqueda] = useState('')
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('')
  const [terminoBuscado, setTerminoBuscado] = useState('')
  const [categoriaBuscada, setCategoriaBuscada] = useState('')
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [bebidas, setBebidas] = useState<Bebida[]>([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [haBuscado, setHaBuscado] = useState(false)
  const [detalleBebidaSeleccionada, setDetalleBebidaSeleccionada] = useState<DetalleBebida | null>(null)
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false)
  const [idBebidaCargandoDetalle, setIdBebidaCargandoDetalle] = useState('')
  const [errorDetalle, setErrorDetalle] = useState('')
  const [favoritos, setFavoritos] = useState<Bebida[]>(obtenerFavoritosIniciales)

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        setError('')
        const categoriasDisponibles = await obtenerCategorias()
        setCategorias(categoriasDisponibles)
      } catch (errorCarga) {
        setError(errorCarga instanceof Error ? errorCarga.message : 'Error al cargar categorías.')
      }
    }

    void cargarCategorias()
  }, [])

  useEffect(() => {
    window.localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(favoritos))
  }, [favoritos])

  const bebidasFiltradas = useMemo(() => {
    const terminoNormalizado = terminoBuscado.trim().toLowerCase()

    if (!terminoNormalizado) {
      return bebidas
    }

    return bebidas.filter((bebida) => bebida.nombre.toLowerCase().includes(terminoNormalizado))
  }, [bebidas, terminoBuscado])

  const idsFavoritos = useMemo(() => new Set(favoritos.map((favorito) => favorito.id)), [favoritos])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const terminoNormalizado = terminoBusqueda.trim()
    const categoriaNormalizada = categoriaSeleccionada.trim()

    if (!terminoNormalizado || !categoriaNormalizada) {
      setError('Completa el nombre de la bebida y selecciona una categoría antes de buscar.')
      return
    }

    try {
      setCargando(true)
      setError('')
      setErrorDetalle('')
      setModalDetalleAbierto(false)

      const resultados = await buscarBebidasPorCategoria(categoriaNormalizada, terminoNormalizado)
      setBebidas(resultados)
      setTerminoBuscado(terminoNormalizado)
      setCategoriaBuscada(categoriaNormalizada)
      setHaBuscado(true)
    } catch (errorBusqueda) {
      setBebidas([])
      setHaBuscado(false)
      setError(errorBusqueda instanceof Error ? errorBusqueda.message : 'Error al buscar bebidas.')
    } finally {
      setCargando(false)
    }
  }

  const manejarVerDetalles = async (idBebida: string) => {
    try {
      setIdBebidaCargandoDetalle(idBebida)
      setErrorDetalle('')

      const detalle = await obtenerDetalleBebida(idBebida)
      setDetalleBebidaSeleccionada(detalle)
      setModalDetalleAbierto(true)
    } catch (errorConsultaDetalle) {
      setErrorDetalle(
        errorConsultaDetalle instanceof Error
          ? errorConsultaDetalle.message
          : 'Ocurrió un error al cargar los detalles.',
      )
    } finally {
      setIdBebidaCargandoDetalle('')
    }
  }

  const cerrarModalDetalle = () => {
    setModalDetalleAbierto(false)
  }

  const limpiarDetalleSeleccionado = () => {
    setDetalleBebidaSeleccionada(null)
  }

  const manejarCambioTermino = (valor: string) => {
    setTerminoBusqueda(valor)
    setError('')
  }

  const manejarCambioCategoria = (valor: string) => {
    setCategoriaSeleccionada(valor)
    setError('')
  }

  const alternarFavorito = (bebida: Bebida) => {
    setFavoritos((favoritosActuales) => {
      const yaEsFavorita = favoritosActuales.some((favorito) => favorito.id === bebida.id)

      if (yaEsFavorita) {
        return favoritosActuales.filter((favorito) => favorito.id !== bebida.id)
      }

      return [bebida, ...favoritosActuales]
    })
  }

  return (
    <main className="contenedor">
      <header className="encabezado-principal">
        <div>
          <h1>Buscador de Bebidas</h1>
          <p className="subtitulo-principal">
            Explora bebidas por categoría y guarda tus favoritas desde el detalle.
          </p>
        </div>

        <nav className="navegacion-principal" aria-label="Navegación principal">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? 'enlace-navegacion enlace-navegacion-activo' : 'enlace-navegacion'
            }
          >
            Inicio
          </NavLink>
          <NavLink
            to="/favoritos"
            className={({ isActive }) =>
              isActive ? 'enlace-navegacion enlace-navegacion-activo' : 'enlace-navegacion'
            }
          >
            Favoritos
          </NavLink>
          <NavLink
            to="/ia"
            className={({ isActive }) =>
              isActive
                ? 'enlace-navegacion enlace-navegacion-activo enlace-ia'
                : 'enlace-navegacion enlace-ia'
            }
          >
            🤖 Bartender IA
          </NavLink>
        </nav>
      </header>

      {errorDetalle && <p className="mensaje mensaje-error">{errorDetalle}</p>}

      <Routes>
        <Route
          path="/"
          element={
            <InicioPagina
              terminoBusqueda={terminoBusqueda}
              categoriaSeleccionada={categoriaSeleccionada}
              categorias={categorias}
              cargando={cargando}
              error={error}
              haBuscado={haBuscado}
              terminoBuscado={terminoBuscado}
              categoriaBuscada={categoriaBuscada}
              bebidasFiltradas={bebidasFiltradas}
              idBebidaCargandoDetalle={idBebidaCargandoDetalle}
              alCambiarTermino={manejarCambioTermino}
              alCambiarCategoria={manejarCambioCategoria}
              alEnviar={handleSubmit}
              alVerDetalles={manejarVerDetalles}
            />
          }
        />
        <Route path="/favoritos" element={<FavoritosPagina favoritos={favoritos} idBebidaCargandoDetalle={idBebidaCargandoDetalle} alVerDetalles={manejarVerDetalles} />} />
        <Route path="/ia" element={<BusquedaIAPagina />} />
      </Routes>

      <ModalDetalleBebida
        abierto={modalDetalleAbierto}
        detalle={detalleBebidaSeleccionada}
        alCerrar={cerrarModalDetalle}
        alCerrarCompleto={limpiarDetalleSeleccionado}
        esFavorita={detalleBebidaSeleccionada ? idsFavoritos.has(detalleBebidaSeleccionada.id) : false}
        alAlternarFavorito={alternarFavorito}
      />
    </main>
  )
}

export default App
