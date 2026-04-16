export type Categoria = {
  nombre: string
}

export type Bebida = {
  id: string
  nombre: string
  imagen: string
}

export type DetalleBebida = Bebida & {
  categoria: string
  tipo: string
  vaso: string
  instrucciones: string
  ingredientes: string[]
}

