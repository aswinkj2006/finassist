import { useState, useRef, useEffect } from 'react'
import { sendChatMessage, getChatHistory, getChatSessions } from '../api/client'
import { Bot, Send, MessageSquare, Plus, ChevronDown, Clock, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import './ChatAssistant.css'

export default function ChatView({ userId }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [showSessions, setShowSessions] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadSessions = () => {
    if (userId) getChatSessions(userId).then(setSessions).catch(console.error)
  }

  useEffect(() => { loadSessions() }, [userId])

  useEffect(() => {
    if (userId && activeSessionId) {
      getChatHistory(userId, activeSessionId).then(history => {
        if (history?.length > 0) {
          setMessages(history.map(m => ({ role: m.role === 'model' ? 'assistant' : 'user', text: m.content })))
        } else {
          setMessages([{ role: 'assistant', text: WELCOME_MSG }])
        }
      }).catch(() => setMessages([{ role: 'assistant', text: WELCOME_MSG }]))
    } else {
      setMessages([{ role: 'assistant', text: WELCOME_MSG }])
    }
  }, [userId, activeSessionId])

  useEffect(() => { scrollToBottom() }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || !userId) return

    const userMessage = { role: 'user', text: input.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await sendChatMessage(userId, userMessage.text, activeSessionId)
      if (response.session_id && response.session_id !== activeSessionId) {
        setActiveSessionId(response.session_id)
        loadSessions()
      }
      setMessages(prev => [...prev, { role: 'assistant', text: response.reply }])
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I ran into an error. Please check your connection and try again." }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChat = () => {
    setActiveSessionId(null)
    setShowSessions(false)
  }

  const handleSelectSession = (id) => {
    setActiveSessionId(id)
    setShowSessions(false)
  }

  return (
    <div className="chat-container">
      {/* Chat header */}
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="ai-avatar">
            <Bot size={20} color="white" />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1 }}>FinAssist AI</p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>
              <span style={{ color: '#10b981', marginRight: 4 }}>●</span>Online
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleNewChat}
            className="chat-header-btn"
            title="New chat"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => setShowSessions(!showSessions)}
            className="chat-header-btn"
            title="History"
          >
            <Clock size={16} />
          </button>
        </div>
      </div>

      {/* Session list overlay */}
      {showSessions && (
        <div className="sessions-overlay">
          <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(37,99,235,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>Past Conversations</p>
            <button onClick={() => setShowSessions(false)} style={{ width: 30, height: 30, minWidth: 30, padding: 0, borderRadius: '50%', background: 'rgba(37,99,235,0.08)', color: 'var(--primary)', boxShadow: 'none' }}>
              <X size={14} />
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
            {sessions.length === 0 && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: 20, fontSize: '0.85rem' }}>No past conversations</p>
            )}
            {sessions.slice(0, 10).map(session => (
              <div
                key={session.id}
                onClick={() => handleSelectSession(session.id)}
                style={{
                  padding: '12px 14px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', marginBottom: 6,
                  background: session.id === activeSessionId ? 'rgba(37,99,235,0.1)' : 'rgba(37,99,235,0.04)',
                  border: '1px solid rgba(37,99,235,0.08)',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <MessageSquare size={16} color="var(--text-muted)" />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>{session.title}</p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {new Date(session.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message-wrap ${msg.role}`}>
            {msg.role === 'assistant' && (
              <div className="msg-avatar"><Bot size={14} color="white" /></div>
            )}
            <div className={`message-bubble ${msg.role}`}>
              {msg.role === 'assistant' ? (
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message-wrap assistant">
            <div className="msg-avatar"><Bot size={14} color="white" /></div>
            <div className="message-bubble assistant typing-indicator">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="chat-input-area">
        <input
          ref={inputRef}
          type="text"
          placeholder="e.g. I spent ₹500 on lunch…"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={isLoading || !userId}
        />
        <button type="submit" className="send-btn" disabled={isLoading || !userId || !input.trim()}>
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}

const WELCOME_MSG = `Hi! I'm **FinAssist** 👋

I can help you:
- 📝 **Log expenses** — just tell me what you spent
- 🎯 **Set savings goals** — tell me your target
- 📚 **Explain concepts** — ask me about SIP, EPF, tax regimes
- 💰 **Update your income** — tell me your monthly salary

What would you like to do?`
