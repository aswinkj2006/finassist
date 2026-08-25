import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { sendChatMessage } from '../api/client'
import ReactMarkdown from 'react-markdown'
import { Bot, Send } from 'lucide-react'

export default function OnboardingChat() {
  const { user, completeOnboarding, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hi ${user?.name || 'there'}! I'm **FinAssist**, your personal finance companion.\n\nLet's get you set up in 2 minutes. Could you tell me:\n1. Your **monthly take-home salary** (after tax/deductions)\n2. Any **savings goals** you have in mind (e.g. emergency fund, bike, vacation)`
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
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
      const response = await sendChatMessage(user.id, userMsg, sessionId)
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
    if (user?.id) {
      await refreshUser(user.id)
    }
    completeOnboarding()
    navigate('/dashboard')
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100svh',
      background: 'var(--bg-gradient)',
      backgroundAttachment: 'fixed',
      maxWidth: 480, margin: '0 auto', fontFamily: 'var(--font)'
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 20px 16px',
        flexShrink: 0
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '18px 20px',
          boxShadow: 'var(--card-shadow)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: '50%',
            background: 'var(--primary-gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, boxShadow: '0 4px 12px rgba(37,99,235,0.2)'
          }}>
            <Bot size={22} color="white" />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Onboarding</p>
            <h2 style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.02em', margin: 0 }}>
              Setup your profile
            </h2>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%',
            display: 'flex',
            flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
            alignItems: 'flex-end',
            gap: 8
          }}>
            {msg.sender === 'ai' && (
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--primary-gradient)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginBottom: 4
              }}>
                <Bot size={14} color="white" />
              </div>
            )}
            
            <div style={{
              background: msg.sender === 'ai' ? '#ffffff' : 'var(--primary)',
              color: msg.sender === 'ai' ? 'var(--text-main)' : '#ffffff',
              borderRadius: '20px',
              borderBottomLeftRadius: msg.sender === 'ai' ? 4 : '20px',
              borderBottomRightRadius: msg.sender === 'user' ? 4 : '20px',
              padding: '14px 18px',
              boxShadow: msg.sender === 'ai' ? '0 2px 10px rgba(0,0,0,0.05)' : '0 4px 14px rgba(37,99,235,0.25)',
              fontSize: '0.95rem',
              lineHeight: 1.5,
              border: msg.sender === 'ai' ? '1px solid rgba(0,0,0,0.04)' : 'none',
              fontWeight: msg.sender === 'user' ? 500 : 400
            }}>
              {msg.sender === 'ai' ? (
                <div className="markdown-content">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
             <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: 4 }}>
                <Bot size={14} color="white" />
             </div>
             <div style={{ display: 'flex', gap: 5, padding: '16px 20px', background: '#ffffff', borderRadius: '20px', borderBottomLeftRadius: 4, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.04)' }}>
                {[0,1,2].map(i => (
                  <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block', animation: `typingDot 1.2s ${i * 0.2}s ease-in-out infinite` }} />
                ))}
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '16px 20px 28px',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0,0,0,0.06)',
        display: 'flex', flexDirection: 'column', gap: 12,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.03)'
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
              background: '#f8fafc',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '999px',
              padding: '14px 22px',
              fontSize: '0.95rem',
              color: 'var(--text-main)',
              fontFamily: 'inherit'
            }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={{ 
              width: 50, height: 50, minWidth: 50, padding: 0, borderRadius: '50%',
              background: 'var(--primary-gradient)',
              boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <Send size={20} color="white" />
          </button>
        </form>
        <button
          onClick={handleFinish}
          style={{
            background: 'transparent',
            border: '1.5px solid var(--primary)',
            color: 'var(--primary)',
            borderRadius: '999px',
            padding: '14px 20px',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseDown={e => e.currentTarget.style.background = 'var(--primary-light)'}
          onMouseUp={e => e.currentTarget.style.background = 'transparent'}
        >
          Skip / Go to Dashboard
        </button>
      </div>

      <style>{`
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        .markdown-content p { margin-bottom: 8px; }
        .markdown-content p:last-child { margin-bottom: 0; }
        .markdown-content strong { color: var(--primary); font-weight: 600; }
        .markdown-content ol, .markdown-content ul { margin-top: 8px; margin-bottom: 8px; padding-left: 20px; }
        .markdown-content li { margin-bottom: 4px; }
      `}</style>
    </div>
  )
}
