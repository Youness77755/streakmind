'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './lib/supabase'

export default function Home() {
  const router = useRouter()
  const [habitos, setHabitos] = useState<any[]>([])
  const [analisis, setAnalisis] = useState('')
  const [cargando, setCargando] = useState(false)
  const [nuevoHabito, setNuevoHabito] = useState('')
  const [mostrarInput, setMostrarInput] = useState(false)
  const [cargandoApp, setCargandoApp] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUserId(session.user.id)

      const { data } = await supabase.from('habitos').select('*').eq('user_id', session.user.id)

      if (data && data.length > 0) {
        setHabitos(data)
      } else {
        const defaults = [
          { nombre: 'Beber 2L de agua', emoji: '💧', completado: false, user_id: session.user.id },
          { nombre: 'Leer 20 minutos', emoji: '📚', completado: false, user_id: session.user.id },
          { nombre: 'Hacer ejercicio', emoji: '🏃', completado: false, user_id: session.user.id },
          { nombre: 'Dormir antes de las 23h', emoji: '😴', completado: false, user_id: session.user.id },
        ]
        const { data: inserted } = await supabase.from('habitos').insert(defaults).select()
        if (inserted) setHabitos(inserted)
      }
      setCargandoApp(false)
    }
    init()
  }, [])

  const completados = habitos.filter(h => h.completado).length
  const porcentaje = habitos.length > 0 ? Math.round((completados / habitos.length) * 100) : 0

  const toggleHabito = async (id: string) => {
    const habito = habitos.find(h => h.id === id)
    const nuevoEstado = !habito.completado
    setHabitos(habitos.map(h => h.id === id ? { ...h, completado: nuevoEstado } : h))
    await supabase.from('habitos').update({ completado: nuevoEstado }).eq('id', id)
  }

  const añadirHabito = async () => {
    if (!nuevoHabito.trim() || !userId) return
    const { data } = await supabase.from('habitos').insert({
      nombre: nuevoHabito, emoji: '⭐', completado: false, user_id: userId
    }).select()
    if (data) setHabitos([...habitos, ...data])
    setNuevoHabito('')
    setMostrarInput(false)
  }

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const analizarConIA = async () => {
    setCargando(true)
    setAnalisis('')
    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habitos })
      })
      const data = await res.json()
      setAnalisis(data.mensaje)
    } catch {
      setAnalisis('Error al conectar con la IA. Inténtalo de nuevo.')
    }
    setCargando(false)
  }

  if (cargandoApp) {
    return (
      <div style={{
        minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
      }}>
        Cargando...
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'Segoe UI', sans-serif"
    }}>
      <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '8px', position: 'relative' }}>
          <h1 style={{
            fontSize: '36px', fontWeight: '800',
            background: 'linear-gradient(90deg, #a78bfa, #818cf8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0
          }}>StreakMind</h1>
          <p style={{ color: '#94a3b8', marginTop: '4px', fontSize: '14px' }}>Tu coach de hábitos con IA</p>
          <button onClick={cerrarSesion} style={{
            position: 'absolute', top: 0, right: 0, background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
            padding: '6px 12px', color: '#94a3b8', fontSize: '12px', cursor: 'pointer'
          }}>Salir</button>
        </div>

        {/* Racha */}
        <div style={{
          background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)',
          borderRadius: '20px', padding: '20px', border: '1px solid rgba(167,139,250,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '40px' }}>🔥</span>
            <div>
              <p style={{ color: 'white', fontSize: '28px', fontWeight: '700', margin: 0 }}>7 días</p>
              <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>racha actual</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#a78bfa', fontSize: '28px', fontWeight: '700', margin: 0 }}>{completados}/{habitos.length}</p>
            <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>completados hoy</p>
          </div>
        </div>

        {/* Progreso */}
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#94a3b8', fontSize: '13px' }}>Progreso del día</span>
            <span style={{ color: '#a78bfa', fontSize: '13px', fontWeight: '600' }}>{porcentaje}%</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '999px', height: '8px' }}>
            <div style={{
              background: 'linear-gradient(90deg, #a78bfa, #818cf8)', borderRadius: '999px',
              height: '8px', width: `${porcentaje}%`, transition: 'width 0.5s ease'
            }} />
          </div>
        </div>

        {/* Hábitos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {habitos.map(habito => (
            <button key={habito.id} onClick={() => toggleHabito(habito.id)} style={{
              background: habito.completado ? 'linear-gradient(135deg, rgba(167,139,250,0.2), rgba(129,140,248,0.15))' : 'rgba(255,255,255,0.04)',
              border: habito.completado ? '1px solid rgba(167,139,250,0.5)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center',
              gap: '14px', cursor: 'pointer', transition: 'all 0.2s ease', width: '100%', textAlign: 'left'
            }}>
              <span style={{ fontSize: '24px' }}>{habito.emoji}</span>
              <span style={{ color: habito.completado ? '#94a3b8' : 'white', fontSize: '15px', fontWeight: '500', textDecoration: habito.completado ? 'line-through' : 'none', flex: 1 }}>{habito.nombre}</span>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                border: habito.completado ? 'none' : '2px solid rgba(255,255,255,0.2)',
                background: habito.completado ? 'linear-gradient(135deg, #a78bfa, #818cf8)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                {habito.completado && <span style={{ color: 'white', fontSize: '12px' }}>✓</span>}
              </div>
            </button>
          ))}
        </div>

        {/* Añadir hábito */}
        {mostrarInput ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={nuevoHabito}
              onChange={e => setNuevoHabito(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && añadirHabito()}
              placeholder="Nombre del hábito..."
              style={{
                flex: 1, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(167,139,250,0.3)',
                borderRadius: '12px', padding: '12px 16px', color: 'white', fontSize: '14px', outline: 'none'
              }}
            />
            <button onClick={añadirHabito} style={{
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', border: 'none',
              borderRadius: '12px', padding: '12px 16px', color: 'white', cursor: 'pointer', fontSize: '18px'
            }}>✓</button>
          </div>
        ) : (
          <button onClick={() => setMostrarInput(true)} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(167,139,250,0.3)',
            borderRadius: '16px', padding: '14px', color: '#a78bfa', fontSize: '14px',
            cursor: 'pointer', width: '100%'
          }}>+ Añadir hábito</button>
        )}

        {/* Botón IA */}
        <button onClick={analizarConIA} disabled={cargando} style={{
          background: cargando ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          border: 'none', borderRadius: '16px', padding: '18px', color: 'white',
          fontSize: '16px', fontWeight: '700', cursor: cargando ? 'not-allowed' : 'pointer',
          width: '100%', boxShadow: '0 8px 32px rgba(124,58,237,0.4)'
        }}>
          {cargando ? '🤖 Analizando...' : '🤖 Analizar mi semana con IA'}
        </button>

        {/* Resultado IA */}
        {analisis && (
          <div style={{
            background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)',
            borderRadius: '16px', padding: '20px'
          }}>
            <p style={{ color: '#a78bfa', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>🤖 Tu coach dice:</p>
            <p style={{ color: '#e2e8f0', fontSize: '14px', lineHeight: '1.7', margin: 0 }}>{analisis}</p>
          </div>
        )}

        <p style={{ textAlign: 'center', color: '#475569', fontSize: '12px' }}>StreakMind Pro · €5.99/mes</p>
      </div>
    </div>
  )
}