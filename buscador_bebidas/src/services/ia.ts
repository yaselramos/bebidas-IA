const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODELO = 'openrouter/elephant-alpha'
const CLAVE_API = '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'

type MensajeChat = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

type RespuestaOpenRouter = {
  choices: {
    message: {
      content: string
    }
  }[]
}

const PROMPT_SISTEMA = `Eres un bartender y sommelier experto con décadas de experiencia.
Cuando el usuario te pida una receta de bebida o cóctel, responde SIEMPRE con:

1. **Nombre** de la bebida
2. **Ingredientes** con cantidades exactas
3. **Preparación** paso a paso
4. **Consejo del bartender** con algún tip profesional
5. **Maridaje sugerido** (comida o momento ideal)

Responde siempre en español, de forma clara y estructurada.
Si el usuario pide algo que no es una bebida, redirige amablemente la conversación a bebidas y cócteles.`

export async function buscarRecetaConIA(
  historial: MensajeChat[],
  nuevaPregunta: string,
): Promise<string> {
  const mensajes: MensajeChat[] = [
    { role: 'system', content: PROMPT_SISTEMA },
    ...historial,
    { role: 'user', content: nuevaPregunta },
  ]

  const respuesta = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${CLAVE_API}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Buscador de Bebidas',
    },
    body: JSON.stringify({
      model: MODELO,
      messages: mensajes,
    }),
  })

  if (!respuesta.ok) {
    const detalle = await respuesta.text()
    throw new Error(`Error de la IA: ${respuesta.status} – ${detalle}`)
  }

  const datos = (await respuesta.json()) as RespuestaOpenRouter
  const contenido = datos.choices[0]?.message.content

  if (!contenido) {
    throw new Error('La IA no devolvió una respuesta válida.')
  }

  return contenido
}

