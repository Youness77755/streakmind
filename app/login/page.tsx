'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [esRegistro, setEsRegistro] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    setError('')
    setCargando(true)

    if (esRegistro) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else router.push('/')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push('/')
    }
    setCargando(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', fontFamily: "'Segoe UI', sans-serif"
    }}>
      <div style={{
        width: '100%', maxWidth: '400px', background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '32px',
        border: '1px solid rgba(167,139,250,0.2)'
      }}>
        <h1 style={{
          fontSize: '32px', fontWeight: '800', textAlign: 'center', marginBottom: '8px',
          background: 'linear-gradient(90deg, #a78bfa, #818cf8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>StreakMind</h1>
        <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: '24px', fontSize: '14px' }}>
          {esRegistro ? 'Crea tu cuenta' : 'Inicia sesión'}
        </p>

        <input
          type="email" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)}
          style={{
            width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px', padding: '14px 16px', color: 'white', fontSize: '14px',
            outline: 'none', marginBottom: '12px', boxSizing: 'border-box'
          }}
        />
        <input
          type="password" placeholder="Contraseña" value={password}
          onChange={e => setPassword(e.target.value)}
          style={{
            width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px', padding: '14px 16px', color: 'white', fontSize: '14px',
            outline: 'none', marginBottom: '16px', boxSizing: 'border-box'
          }}
        />

        {error && <p style={{ color: '#f87171', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

        <button onClick={handleSubmit} disabled={cargando} style={{
          width: '100%', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          border: 'none', borderRadius: '12px', padding: '14px', color: 'white',
          fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginBottom: '16px'
        }}>
          {cargando ? 'Cargando...' : esRegistro ? 'Crear cuenta' : 'Entrar'}
        </button>

        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
          {esRegistro ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
          <span onClick={() => setEsRegistro(!esRegistro)} style={{ color: '#a78bfa', cursor: 'pointer', fontWeight: '600' }}>
            {esRegistro ? 'Inicia sesión' : 'Regístrate'}
          </span>
        </p>
      </div>
    </div>
  )
}