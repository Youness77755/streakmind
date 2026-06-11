import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { habitos } = await req.json()

  const completados = habitos.filter((h: any) => h.completado).map((h: any) => h.nombre)
  const pendientes = habitos.filter((h: any) => !h.completado).map((h: any) => h.nombre)

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Eres un coach de hábitos motivador y directo. El usuario ha completado estos hábitos hoy: ${completados.join(', ') || 'ninguno'}. Y tiene pendientes: ${pendientes.join(', ') || 'ninguno'}. Da un análisis breve, motivador y con consejos concretos en español. Máximo 4 frases.`
      }]
    })
  })

  const data = await response.json()
  const mensaje = data.content[0].text

  return NextResponse.json({ mensaje })
}