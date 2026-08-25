import { useState, useEffect } from 'react'
import { getIncomeSources, createIncomeSource, deleteIncomeSource } from '../api/client'
import { Trash2, LogOut, User, IndianRupee, Plus, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function ProfileView() {
  const { user, logout, refreshUser } = useAuth()
  const navigate = useNavigate()

  // Refresh user data from DB on mount to ensure income is up-to-date
  useEffect(() => {
    if (user?.id) refreshUser(user.id)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) return null

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Profile Card */}
      <section className="card" style={{ textAlign: 'center', padding: '30px 24px' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 14px',
          boxShadow: '0 6px 20px rgba(99,102,241,0.35)',
        }}>
          <User size={34} color="white" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>{user.name}</h2>
        <p className="muted" style={{ fontSize: '0.88rem', marginBottom: 20 }}>{user.email}</p>

        {/* Income pill */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 12,
          background: 'rgba(99,102,241,0.08)',
          border: '1.5px solid rgba(99,102,241,0.15)',
          borderRadius: 'var(--radius-full)',
          padding: '10px 22px',
          marginBottom: 20,
        }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IndianRupee size={18} color="var(--primary)" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Monthly Net Income</p>
            <p style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '-0.03em' }}>
              {user.monthly_net_income
                ? `₹${user.monthly_net_income.toLocaleString()}`
                : 'Not set — chat with AI to update'}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            background: 'rgba(239,68,68,0.08)',
            color: '#ef4444',
            border: '1.5px solid rgba(239,68,68,0.2)',
            boxShadow: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            borderRadius: 'var(--radius-full)',
          }}
        >
          <LogOut size={16} />
          Log Out
        </button>
      </section>

      {/* Feature Modules Directory */}
      <section className="card" style={{ padding: '18px 20px' }}>
        <div className="section-title" style={{ marginBottom: 12 }}>
          <span>Financial Modules</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div 
            onClick={() => navigate('/accounts')}
            style={{ padding: '12px', background: '#f8faff', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(37,99,235,0.08)', cursor: 'pointer' }}
          >
            <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>Accounts & Net Worth</p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Bank, cash, cards</p>
          </div>

          <div 
            onClick={() => navigate('/subscriptions')}
            style={{ padding: '12px', background: '#f8faff', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(37,99,235,0.08)', cursor: 'pointer' }}
          >
            <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>Subscriptions & Bills</p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Auto-logging & alerts</p>
          </div>

          <div 
            onClick={() => navigate('/budgets')}
            style={{ padding: '12px', background: '#f8faff', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(37,99,235,0.08)', cursor: 'pointer' }}
          >
            <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>Category Budgets</p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Limits & envelope mode</p>
          </div>

          <div 
            onClick={() => navigate('/investments')}
            style={{ padding: '12px', background: '#f8faff', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(37,99,235,0.08)', cursor: 'pointer' }}
          >
            <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>Investments & Debts</p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>SIP, stocks & loans</p>
          </div>

          <div 
            onClick={() => navigate('/reports')}
            style={{ padding: '12px', background: '#f8faff', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(37,99,235,0.08)', cursor: 'pointer', gridColumn: 'span 2' }}
          >
            <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>Statements & Reports</p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Visual charts, CSV & PDF export</p>
          </div>
        </div>
      </section>

      <IncomeSourceSection userId={user.id} />
    </div>
  )
}

function IncomeSourceSection({ userId }) {
  const [incomes, setIncomes] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')
  const [frequency, setFrequency] = useState('monthly')

  const loadIncomes = () => getIncomeSources(userId).then(setIncomes)
  useEffect(() => { loadIncomes() }, [userId])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!label || !amount) return
    createIncomeSource(userId, { label, amount: parseFloat(amount), frequency }).then(() => {
      loadIncomes()
      setLabel(''); setAmount('')
      setShowAdd(false)
    })
  }

  const handleDelete = (id) => deleteIncomeSource(userId, id).then(loadIncomes)

  const FREQ_COLORS = { monthly: '#6366f1', yearly: '#10b981', weekly: '#f59e0b' }

  return (
    <section className="card" style={{ marginBottom: 0 }}>
      <div className="section-title" style={{ marginBottom: 14 }}>
        <span>Income Sources</span>
        <button
          onClick={() => setShowAdd(true)}
          className="btn-sm"
          style={{ width: 'auto', boxShadow: '0 2px 8px rgba(99,102,241,0.25)' }}
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {incomes.length === 0 && (
        <p className="muted" style={{ textAlign: 'center', padding: '16px 0', fontSize: '0.85rem' }}>
          No income sources added yet.
        </p>
      )}

      {incomes.map(inc => (
        <div key={inc.id} className="list-item">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: `${FREQ_COLORS[inc.frequency] || '#6366f1'}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <IndianRupee size={16} color={FREQ_COLORS[inc.frequency] || '#6366f1'} />
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{inc.label}</p>
              <p className="muted" style={{ fontSize: '0.75rem' }}>{inc.frequency}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#10b981' }}>₹{inc.amount.toLocaleString()}</p>
            <button onClick={() => handleDelete(inc.id)} style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', padding: 7, width: 32, height: 32, minWidth: 32, borderRadius: 'var(--radius-sm)', boxShadow: 'none' }}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}

      {/* Add modal */}
      {showAdd && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 150, background: 'rgba(30,27,75,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', maxWidth: 480, left: '50%', transform: 'translateX(-50%)' }}
          onClick={() => setShowAdd(false)}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0', padding: '28px 22px 36px', width: '100%', boxShadow: '0 -8px 40px rgba(0,0,0,0.15)', animation: 'slideUpOverlay 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700 }}>Add Income Source</h3>
              <button onClick={() => setShowAdd(false)} style={{ width: 32, height: 32, minWidth: 32, padding: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.07)', color: 'var(--text-muted)', boxShadow: 'none' }}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input placeholder="Label (e.g. Salary, Freelance)" value={label} onChange={e => setLabel(e.target.value)} required />
              <input placeholder="Amount (₹)" type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
              <select value={frequency} onChange={e => setFrequency(e.target.value)}>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="weekly">Weekly</option>
              </select>
              <button type="submit">Add Income Source</button>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
