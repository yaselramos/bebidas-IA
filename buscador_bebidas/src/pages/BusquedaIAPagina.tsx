import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { buscarRecetaConIA } from '../services/ia'

type MensajeChat = {
  rol: 'usuario' | 'asistente'
  contenido: string
}

type MensajeApi = {
  role: 'user' | 'assistant'
  content: string
}

function formatearRespuesta(texto: string) {
  return texto.split('\n').map((linea, indice) => {
    const lineaLimpia = linea
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')

    if (linea.startsWith('# ')) {
      return (
        <h2
          key={indice}
          className="ia-titulo"
          dangerouslySetInnerHTML={{ __html: lineaLimpia.replace('# ', '') }}
        />
      )
    }

    if (linea.startsWith('## ')) {
      return (
        <h3
          key={indice}
          className="ia-subtitulo"
          dangerouslySetInnerHTML={{ __html: lineaLimpia.replace('## ', '') }}
        />
      )
    }

    if (linea.startsWith('- ') || linea.match(/^\d+\./)) {
      return (
        <li
          key={indice}
          className="ia-item"
          dangerouslySetInnerHTML={{ __html: lineaLimpia.replace(/^- |^\d+\.\s*/, '') }}
        />
      )
    }

    if (!linea.trim()) {
      return <br key={indice} />
    }

    return (
      <p
        key={indice}
        className="ia-parrafo"
        dangerouslySetInnerHTML={{ __html: lineaLimpia }}
      />
    )
  })
}

export function BusquedaIAPagina() {
  const [mensajes, setMensajes] = useState<MensajeChat[]>([])
  const [pregunta, setPregunta] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const finConversacionRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const desplazarAlFinal = () => {
    setTimeout(() => {
      finConversacionRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 80)
  }

  const manejarEnvio = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()

    const textoPregunta = pregunta.trim()

    if (!textoPregunta) {
      return
    }

    const historialApi: MensajeApi[] = mensajes.map((mensaje) => ({
      role: mensaje.rol === 'usuario' ? 'user' : 'assistant',
      content: mensaje.contenido,
    }))

    const nuevosMensajes: MensajeChat[] = [
      ...mensajes,
      { rol: 'usuario', contenido: textoPregunta },
    ]

    setMensajes(nuevosMensajes)
    setPregunta('')
    setCargando(true)
    setError('')
    desplazarAlFinal()

    try {
      const respuesta = await buscarRecetaConIA(historialApi, textoPregunta)

      setMensajes([...nuevosMensajes, { rol: 'asistente', contenido: respuesta }])
      desplazarAlFinal()
    } catch (errorIa) {
      setError(
        errorIa instanceof Error ? errorIa.message : 'Ocurrió un error al consultar la IA.',
      )
    } finally {
      setCargando(false)
      inputRef.current?.focus()
    }
  }

  const limpiarConversacion = () => {
    setMensajes([])
    setError('')
    setPregunta('')
    inputRef.current?.focus()
  }

  return (
    <section className="pagina pagina-ia">
      <div className="ia-encabezado">
        <div>
          <h2 className="ia-titulo-pagina">🤖 Bartender IA</h2>
          <p className="mensaje texto-ayuda">
            Pregúntale al bartender por cualquier receta o cóctel que quieras preparar.
          </p>
        </div>

        {mensajes.length > 0 && (
          <button
            type="button"
            className="boton-limpiar"
            onClick={limpiarConversacion}
            disabled={cargando}
          >
            Limpiar chat
          </button>
        )}
      </div>

      <div className="ia-conversacion" aria-live="polite" aria-label="Conversación con la IA">
        {mensajes.length === 0 && !cargando && (
          <div className="ia-estado-inicial">
            <span className="ia-emoji-inicial">🍹</span>
            <p>Pregúntame por una receta de bebida. Por ejemplo:</p>
            <ul className="ia-sugerencias">
              <li
                className="ia-sugerencia"
                onClick={() => {
                  setPregunta('¿Cómo preparo un Margarita clásico?')
                  inputRef.current?.focus()
                }}
              >
                ¿Cómo preparo un Margarita clásico?
              </li>
              <li
                className="ia-sugerencia"
                onClick={() => {
                  setPregunta('Dame una receta de Mojito con poca azúcar')
                  inputRef.current?.focus()
                }}
              >
                Dame una receta de Mojito con poca azúcar
              </li>
              <li
                className="ia-sugerencia"
                onClick={() => {
                  setPregunta('¿Qué cóctel puedo hacer con tequila y naranja?')
                  inputRef.current?.focus()
                }}
              >
                ¿Qué cóctel puedo hacer con tequila y naranja?
              </li>
            </ul>
          </div>
        )}

        {mensajes.map((mensaje, indice) => (
          <div
            key={indice}
            className={`ia-burbuja ia-burbuja-${mensaje.rol === 'usuario' ? 'usuario' : 'asistente'}`}
          >
            <span className="ia-burbuja-avatar">
              {mensaje.rol === 'usuario' ? '🙋' : '🤖'}
            </span>

            <div className="ia-burbuja-contenido">
              {mensaje.rol === 'asistente' ? (
                <div className="ia-respuesta">{formatearRespuesta(mensaje.contenido)}</div>
              ) : (
                <p className="ia-pregunta-texto">{mensaje.contenido}</p>
              )}
            </div>
          </div>
        ))}

        {cargando && (
          <div className="ia-burbuja ia-burbuja-asistente">
            <span className="ia-burbuja-avatar">🤖</span>
            <div className="ia-burbuja-contenido ia-pensando">
              <span className="ia-punto" />
              <span className="ia-punto" />
              <span className="ia-punto" />
            </div>
          </div>
        )}

        {error && <p className="mensaje mensaje-error ia-error">{error}</p>}

        <div ref={finConversacionRef} />
      </div>

      <form className="ia-formulario" onSubmit={manejarEnvio}>
        <input
          ref={inputRef}
          type="text"
          className="ia-input"
          placeholder="Ej: ¿Cómo hago un Negroni?"
          value={pregunta}
          onChange={(evento) => setPregunta(evento.target.value)}
          disabled={cargando}
          autoComplete="off"
        />
        <button type="submit" className="ia-boton-enviar" disabled={cargando || !pregunta.trim()}>
          {cargando ? 'Consultando...' : 'Preguntar'}
        </button>
      </form>
    </section>
  )
}

