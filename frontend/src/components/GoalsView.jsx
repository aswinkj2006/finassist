import { useState, useEffect } from 'react'
import { getGoals, createGoal, updateGoal, deleteGoal } from '../api/client'
import { Target, Trash2, Plus, X, PiggyBank } from 'lucide-react'

export default function GoalsView({ userId }) {
  const [goals, setGoals] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [title, setTitle] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [updateId, setUpdateId] = useState(null)
  const [addSaved, setAddSaved] = useState('')
  const [savedInput, setSavedInput] = useState({})

  const loadGoals = () => getGoals(userId).then(setGoals).catch(() => {})
  useEffect(() => { if (userId) loadGoals() }, [userId])

  const handleAdd = (e) => {
    e.preventDefault()
    if (!title || !targetAmount) return
    createGoal(userId, {
      title,
      target_amount: parseFloat(targetAmount),
      target_date: targetDate || null,
      saved_so_far: 0,
    }).then(() => {
      loadGoals()
      setTitle(''); setTargetAmount(''); setTargetDate('')
      setShowAdd(false)
    })
  }

  const handleDelete = (id) => deleteGoal(userId, id).then(loadGoals)

  const handleAddSavings = (goal) => {
    const extra = parseFloat(savedInput[goal.id] || 0)
    if (!extra || extra <= 0) return
    updateGoal(userId, goal.id, { saved_so_far: (goal.saved_so_far || 0) + extra }).then(() => {
      loadGoals()
      setSavedInput(prev => ({ ...prev, [goal.id]: '' }))
    })
  }

  const totalTarget = goals.reduce((s, g) => s + g.target_amount, 0)
  const totalSaved = goals.reduce((s, g) => s + (g.saved_so_far || 0), 0)

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Hero */}
      <div className="card card-gradient" style={{ borderRadius: 'var(--radius-lg)', padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <Target size={20} color="rgba(255,255,255,0.8)" />
          <p style={{ fontSize: '0.78rem', fontWeight: 600, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Savings Goals
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '0.78rem', opacity: 0.75, marginBottom: 3 }}>Total Saved</p>
            <p style={{ fontSize: '1.6rem', fontWeight: 700, color: 'white', letterSpacing: '-0.5px' }}>₹{totalSaved.toLocaleString()}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.78rem', opacity: 0.75, marginBottom: 3 }}>Total Target</p>
            <p style={{ fontSize: '1.6rem', fontWeight: 700, color: 'white', letterSpacing: '-0.5px' }}>₹{totalTarget.toLocaleString()}</p>
          </div>
        </div>
        {totalTarget > 0 && (
          <div style={{ marginTop: 14 }}>
            <div className="progress-bar-track" style={{ height: 6, background: 'rgba(255,255,255,0.25)' }}>
              <div className="progress-bar-fill" style={{
                width: `${Math.min((totalSaved / totalTarget) * 100, 100)}%`,
                background: '#fff',
              }} />
            </div>
            <p style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: 5 }}>
              {((totalSaved / totalTarget) * 100).toFixed(1)}% of all goals funded
            </p>
          </div>
        )}
      </div>

      {/* Goal Cards */}
      {goals.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '44px 20px' }}>
          <PiggyBank size={40} color="var(--text-light)" style={{ marginBottom: 12 }} />
          <p style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-main)' }}>No goals yet</p>
          <p className="muted" style={{ fontSize: '0.85rem' }}>Tap the + button to create your first savings goal</p>
        </div>
      ) : (
        goals.map(goal => {
          const pct = goal.target_amount > 0 ? Math.min((goal.saved_so_far || 0) / goal.target_amount * 100, 100) : 0
          const remaining = Math.max(0, goal.target_amount - (goal.saved_so_far || 0))
          const isDone = pct >= 100

          return (
            <div key={goal.id} className="card" style={{ marginBottom: 0, padding: '20px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 12,
                    background: isDone ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isDone ? <span style={{ fontSize: '1.2rem' }}>🎉</span> : <Target size={18} color="var(--primary)" />}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{goal.title}</p>
                    {goal.target_date && (
                      <p className="muted" style={{ fontSize: '0.75rem' }}>By {goal.target_date}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(goal.id)}
                  style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', padding: 7, width: 32, height: 32, minWidth: 32, borderRadius: 'var(--radius-sm)', boxShadow: 'none' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Progress */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isDone ? '#10b981' : 'var(--primary)' }}>
                  ₹{(goal.saved_so_far || 0).toLocaleString()} saved
                </span>
                <span className="muted" style={{ fontSize: '0.8rem' }}>₹{goal.target_amount.toLocaleString()} target</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{
                  width: `${pct}%`,
                  background: isDone
                    ? 'linear-gradient(90deg, #10b981, #06b6d4)'
                    : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isDone ? '#10b981' : 'var(--primary)' }}>
                  {pct.toFixed(0)}%
                </span>
                {!isDone && (
                  <span className="muted" style={{ fontSize: '0.75rem' }}>₹{remaining.toLocaleString()} left</span>
                )}
                {isDone && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981' }}>Complete! 🎉</span>
                )}
              </div>

              {/* Add savings input */}
              {!isDone && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <input
                    type="number"
                    placeholder="Add savings (₹)"
                    value={savedInput[goal.id] || ''}
                    onChange={e => setSavedInput(prev => ({ ...prev, [goal.id]: e.target.value }))}
                    style={{ flex: 1, padding: '9px 14px', fontSize: '0.85rem', marginBottom: 0, borderRadius: 'var(--radius-sm)' }}
                  />
                  <button
                    onClick={() => handleAddSavings(goal)}
                    style={{ width: 'auto', padding: '9px 16px', fontSize: '0.85rem', borderRadius: 'var(--radius-sm)', boxShadow: '0 2px 8px rgba(99,102,241,0.25)' }}
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          )
        })
      )}

      {/* Add Goal Modal */}
      {showAdd && (
        <div className="modal-backdrop" onClick={() => setShowAdd(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">New Savings Goal</h3>
              <button className="btn-close-modal" onClick={() => setShowAdd(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAdd} style={{ padding: '14px 16px 18px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input placeholder="Goal name (e.g. Emergency Fund, Bike)" value={title} onChange={e => setTitle(e.target.value)} required />
              <input placeholder="Target amount (₹)" type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} required />
              <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
              <button type="submit" style={{ marginTop: 4 }}>Create Goal</button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Add Trigger */}
      <button
        onClick={() => setShowAdd(true)}
        className="floating-add-btn"
        title="Add Goal"
      >
        <Plus size={22} />
      </button>
    </div>
  )
}
