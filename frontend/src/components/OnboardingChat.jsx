import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { sendChatMessage } from '../api/client'
import ReactMarkdown from 'react-markdown'

export default function OnboardingChat() {
  const { user, completeOnboarding, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hi ${user?.name || 'there'}! 👋 I'm **FinAssist**, your personal finance companion.\n\nLet's get you set up in 2 minutes. Could you tell me:\n1. Your **monthly take-home salary** (after tax/deductions)\n2. Any **savings goals** you have in mind (e.g. emergency fund, bike, vacation)`
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  // Bug fix: track session_id across messages so backend has conversation history
  const [sessionId, setSessionId] = useState(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || !user) return

    const userMsg = input.trim()
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }])
    setInput('')
    setLoading(true)

    try {
      // Pass sessionId so backend uses the same session (preserves history)
      const response = await sendChatMessage(user.id, userMsg, sessionId)
      // Persist the session_id returned by backend for all future messages
      if (response.session_id && response.session_id !== sessionId) {
        setSessionId(response.session_id)
      }
      setMessages(prev => [...prev, { sender: 'ai', text: response.reply }])
    } catch (err) {
      const detail = err?.response?.data?.detail || err?.message || 'Unknown error'
      console.error('Onboarding chat error:', detail)
      setMessages(prev => [...prev, { sender: 'ai', text: `I had trouble processing that. Error: *${detail}*\n\nPlease try again or skip to the dashboard using the button below.` }])
    } finally {
      setLoading(false)
    }
  }

  const handleFinish = async () => {
    // Refresh user from backend so income/name set by AI is reflected immediately
    if (user?.id) {
      await refreshUser(user.id)
    }
    completeOnboarding()
    navigate('/dashboard')
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100svh',
      background: 'radial-gradient(ellipse at 50% 20%, #ffffff 0%, #e4f1fd 55%, #dceefc 100%)',
      backgroundAttachment: 'fixed',
      maxWidth: 480, margin: '0 auto', fontFamily: 'var(--font)'
    }}>
      {/* Header */}
      <div style={{
        padding: '28px 20px 16px',
        flexShrink: 0
      }}>
        <div style={{
          background: '#ffffff',
          border: '1px solid rgba(37,99,235,0.1)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          boxShadow: 'var(--card-shadow)',
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Onboarding</p>
          <h2 style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '1.3rem', letterSpacing: '-0.02em', margin: 0 }}>
            Setup your profile
          </h2>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '82%',
          }}>
            {msg.sender === 'ai' ? (
              <div style={{
                background: 'rgba(255,255,255,0.88)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.6)',
                borderRadius: 'var(--radius-md)',
                borderBottomLeftRadius: 4,
                padding: '14px 18px',
                boxShadow: 'var(--glass-shadow)',
                fontSize: '0.92rem',
                lineHeight: 1.6,
                color: 'var(--text-main)',
              }}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            ) : (
              <div style={{
                background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                borderRadius: 'var(--radius-md)',
                borderBottomRightRadius: 4,
                padding: '13px 18px',
                boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                fontSize: '0.92rem',
                lineHeight: 1.5,
                color: 'white',
                fontWeight: 500,
              }}>
                {msg.text}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 5, padding: '14px 18px', background: '#fff', border: '1px solid rgba(37,99,235,0.1)', borderRadius: 'var(--radius-md)', borderBottomLeftRadius: 4, boxShadow: '0 2px 8px rgba(37,99,235,0.08)' }}>
            {[0,1,2].map(i => (
              <span key={i} style={{
                width: 7, height: 7, borderRadius: '50%',
                background: 'var(--primary)',
                display: 'inline-block',
                animation: `typingDot 1.2s ${i * 0.2}s ease-in-out infinite`,
              }} />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '14px 20px 28px',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(37,99,235,0.08)',
        display: 'flex', flexDirection: 'column', gap: 10
      }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your response..."
            disabled={loading}
            style={{
              flex: 1, marginBottom: 0,
              background: 'rgba(255,255,255,0.95)',
              border: '1.5px solid rgba(37,99,235,0.15)',
              borderRadius: 'var(--radius-full)',
              padding: '12px 20px',
              fontSize: '0.92rem',
            }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={{ width: 48, height: 48, minWidth: 48, padding: 0, borderRadius: '50%' }}
          >
            ↑
          </button>
        </form>
        <button
          onClick={handleFinish}
          style={{
            background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
            border: 'none',
            color: 'white',
            borderRadius: 'var(--radius-full)',
            padding: '13px 20px',
            boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: '0.01em',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          ✓ Done — Go to Dashboard
        </button>
      </div>

      <style>{`
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
