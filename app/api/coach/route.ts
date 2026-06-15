import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { habitos } = await req.json()

  const completados = habitos.filter((h: any) => h.completado).map((h: any) => h.nombre)
  const pendientes = habitos.filter((h: any) => !h.completado).map((h: any) => h.nombre)

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{
        role: 'user',
        content: `Eres un coach de hábitos motivador y directo. El usuario ha completado estos hábitos hoy: ${completados.join(', ') || 'ninguno'}. Y tiene pendientes: ${pendientes.join(', ') || 'ninguno'}. Da un análisis breve, motivador y con consejos concretos en español. Máximo 4 frases.`
      }]
    })
  })

  const data = await response.json()
  console.log('GROQ RESPONSE:', JSON.stringify(data))
const mensaje = data.choices?.[0]?.message?.content || JSON.stringify(data)

  return NextResponse.json({ mensaje })
}