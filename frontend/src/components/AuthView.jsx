import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login as apiLogin, signup as apiSignup } from '../api/client'

export default function AuthView() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (isLogin) {
        const user = await apiLogin({ email, password })
        login(user)
        if (!user.onboarding_complete) navigate('/onboarding')
        else navigate('/dashboard')
      } else {
        const user = await apiSignup({ email, password, name, onboarding_complete: false, monthly_net_income: 0 })
        login(user)
        navigate('/onboarding')
      }
    } catch (err) {
      let errorMsg = 'Authentication failed'
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          errorMsg = err.response.data.detail
        } else if (Array.isArray(err.response.data.detail)) {
          errorMsg = err.response.data.detail.map(d => d.msg).join(', ')
        }
      } else if (err.message) {
        errorMsg = err.message
      }
      setError(errorMsg)
    }
  }

  return (
    <div style={{
      minHeight: '100svh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '40px 28px',
      background: 'var(--bg-gradient)',
      backgroundAttachment: 'fixed',
      fontFamily: 'var(--font)',
    }}>
      {/* Logo area */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <img 
          src="/logo.png" 
          alt="FinAssist" 
          style={{ height: '48px', objectFit: 'contain', margin: '0 auto 16px', display: 'block' }} 
        />
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.04em', marginBottom: 6 }}>
          {isLogin ? 'Welcome back' : 'Get started'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          {isLogin ? 'Sign in to your FinAssist account' : 'Create your free account'}
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.6)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 24px',
        boxShadow: '0 16px 48px rgba(99,102,241,0.2)',
      }}>
        {error && <div className="flag error" style={{ width: '100%', marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!isLogin && (
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Name</label>
              <input type="text" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} required={!isLogin} />
            </div>
          )}
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</label>
            <input type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" style={{ marginTop: 6 }}>
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }} onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Sign Up' : 'Sign In'}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
