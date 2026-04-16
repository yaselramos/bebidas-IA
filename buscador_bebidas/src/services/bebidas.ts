import type { Bebida, Categoria, DetalleBebida } from '../types/bebidas'

const API_URL = 'https://www.thecocktaildb.com/api/json/v1/1'

type CategoriaApi = {
  strCategory: string
}

type BebidaApi = {
  idDrink: string
  strDrink: string
  strDrinkThumb: string
}

type DetalleBebidaApi = BebidaApi & {
  strCategory: string | null
  strAlcoholic: string | null
  strGlass: string | null
  strInstructions: string | null
} & Record<string, string | null>

type RespuestaCategoriasApi = {
  drinks: CategoriaApi[] | null
}

type RespuestaBebidasApi = {
  drinks: BebidaApi[] | null
}

type RespuestaDetalleBebidaApi = {
  drinks: DetalleBebidaApi[] | null
}

async function solicitarDatos<T>(ruta: string, mensajeError: string): Promise<T> {
  const respuesta = await fetch(`${API_URL}/${ruta}`)

  if (!respuesta.ok) {
    throw new Error(mensajeError)
  }

  return (await respuesta.json()) as T
}

function mapearBebida(bebida: BebidaApi): Bebida {
  return {
    id: bebida.idDrink,
    nombre: bebida.strDrink,
    imagen: bebida.strDrinkThumb,
  }
}

function extraerIngredientes(detalle: DetalleBebidaApi): string[] {
  return Array.from({ length: 15 }, (_, indice) => indice + 1)
    .map((posicion) => {
      const ingrediente = detalle[`strIngredient${posicion}`]?.trim()
      const medida = detalle[`strMeasure${posicion}`]?.trim()

      if (!ingrediente) {
        return null
      }

      return medida ? `${ingrediente} - ${medida}` : ingrediente
    })
    .filter((ingrediente): ingrediente is string => Boolean(ingrediente))
}

function mapearDetalleBebida(detalle: DetalleBebidaApi): DetalleBebida {
  return {
    ...mapearBebida(detalle),
    categoria: detalle.strCategory ?? 'No disponible',
    tipo: detalle.strAlcoholic ?? 'No disponible',
    vaso: detalle.strGlass ?? 'No disponible',
    instrucciones: detalle.strInstructions ?? 'No disponibles',
    ingredientes: extraerIngredientes(detalle),
  }
}

export async function obtenerCategorias(): Promise<Categoria[]> {
  const datos = await solicitarDatos<RespuestaCategoriasApi>(
    'list.php?c=list',
    'No se pudieron cargar las categorías.',
  )

  return (datos.drinks ?? []).map((categoria) => ({
    nombre: categoria.strCategory,
  }))
}

export async function buscarBebidasPorCategoria(
  categoria: string,
  terminoBusqueda: string,
): Promise<Bebida[]> {
  const datos = await solicitarDatos<RespuestaBebidasApi>(
    `filter.php?c=${encodeURIComponent(categoria)}`,
    'No se pudieron obtener los resultados.',
  )

  const bebidas = (datos.drinks ?? []).map(mapearBebida)
  const terminoNormalizado = terminoBusqueda.trim().toLowerCase()

  if (!terminoNormalizado) {
    return bebidas
  }

  return bebidas.filter((bebida) => bebida.nombre.toLowerCase().includes(terminoNormalizado))
}

export async function obtenerDetalleBebida(idBebida: string): Promise<DetalleBebida> {
  const datos = await solicitarDatos<RespuestaDetalleBebidaApi>(
    `lookup.php?i=${encodeURIComponent(idBebida)}`,
    'No se pudieron cargar los detalles de la bebida.',
  )

  const detalle = datos.drinks?.[0]

  if (!detalle) {
    throw new Error('No hay detalles disponibles para esta bebida.')
  }

  return mapearDetalleBebida(detalle)
}

