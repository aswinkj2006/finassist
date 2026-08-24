import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './SplashView.css'

export default function SplashView() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  
  useEffect(() => {
    if (!loading && user) {
      if (!user.onboarding_complete) {
        navigate('/onboarding', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    }
  }, [loading, user, navigate])

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
      }
    }
  }

  if (loading || user) {
    return (
      <div className="splash-container">
        <div className="splash-content fade-in">
          <h1 className="splash-title">FinAssist</h1>
          <p className="splash-subtitle">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="splash-container" style={{ display: 'flex', flexDirection: 'column', padding: '24px', alignItems: 'center', justifyContent: 'center' }}>
      <div className="splash-content fade-in" style={{ marginBottom: '40px' }}>
        <img src="/logo.png" alt="FinAssist" style={{ height: '80px', objectFit: 'contain', marginBottom: '16px' }} />
        <p className="splash-subtitle">Your AI Financial Companion</p>
      </div>
      
      <div className="card fade-in" style={{ textAlign: 'center', maxWidth: '400px', width: '100%', padding: '32px 24px' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>Install the App</h2>
        <p className="muted" style={{ marginBottom: '24px' }}>
          For the best experience, add FinAssist to your home screen. It works offline and feels like a native app!
        </p>
        
        {deferredPrompt ? (
          <button onClick={handleInstallClick} style={{ width: '100%', marginBottom: '16px' }}>
            Install App
          </button>
        ) : (
          <div style={{ background: '#f5f7fa', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
            <strong>iOS / Safari:</strong> Tap the Share button <br/> and select <em>"Add to Home Screen"</em>
          </div>
        )}
        
        <button 
          onClick={() => navigate('/login')} 
          style={{ width: '100%', background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', boxShadow: 'none' }}
        >
          Continue to Login
        </button>
      </div>
    </div>
  )
}
