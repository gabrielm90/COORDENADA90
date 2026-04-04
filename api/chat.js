export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages requeridos' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: `Eres un asesor de viajes de Coordenada 90, una empresa de planeación de viajes a medida. 
Tu objetivo es conocer el viaje ideal del cliente a través de una conversación natural, cálida y profesional.

Debes recopilar esta información en orden natural, sin que parezca un formulario:
1. Destino o destinos de interés
2. Fechas aproximadas del viaje
3. Número de viajeros y tipo de grupo (pareja, familia, amigos)
4. Tipo de experiencia que buscan (descanso, cultura, aventura, gastronomía, etc.)
5. Presupuesto aproximado en pesos mexicanos
6. Correo electrónico para enviarles la propuesta

Reglas importantes:
- Habla siempre en español, de forma cálida pero profesional
- Haz una pregunta a la vez, no bombardees al cliente
- No menciones que eres una IA ni un agente virtual
- Si el cliente no sabe el destino, ayúdale a descubrirlo con preguntas sobre sus gustos
- Cuando tengas toda la información, confirma el resumen y dile que recibirá su propuesta pronto
- No hables de temas que no sean viajes y la planeación del viaje
- Mantén respuestas cortas y conversacionales, máximo 3 líneas`,
        messages: messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Error de API' });
    }

    const text = data.content?.[0]?.text || '';
    return res.status(200).json({ message: text });

  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
