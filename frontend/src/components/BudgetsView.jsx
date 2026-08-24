import { useState, useEffect } from 'react'
import { getBudgets, createOrUpdateBudget, deleteBudget, getCategories } from '../api/client'
import { PieChart, Plus, Trash2, X, AlertTriangle, ShieldCheck, Layers } from 'lucide-react'

export default function BudgetsView({ userId }) {
  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const [envelopeMode, setEnvelopeMode] = useState(false)
  const [loading, setLoading] = useState(true)

  // Add modal state
  const [showAdd, setShowAdd] = useState(false)
  const [category, setCategory] = useState('')
  const [monthlyLimit, setMonthlyLimit] = useState('')
  const [alertThreshold, setAlertThreshold] = useState(0.8)
  const [envelopeAllocated, setEnvelopeAllocated] = useState('')

  const currentMonthYear = new Date().toISOString().slice(0, 7) // "2026-08"

  const loadData = () => {
    if (!userId) return
    setLoading(true)
    Promise.all([
      getBudgets(userId, currentMonthYear),
      getCategories(userId)
    ]).then(([bList, cats]) => {
      setBudgets(bList || [])
      setCategories(cats || [])
      if (cats?.length > 0 && !category) {
        setCategory(cats[0].name)
      }
    }).finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [userId])

  const handleSaveBudget = (e) => {
    e.preventDefault()
    if (!category || !monthlyLimit || !userId) return

    createOrUpdateBudget(userId, {
      category,
      monthly_limit: parseFloat(monthlyLimit),
      month_year: currentMonthYear,
      alert_threshold: parseFloat(alertThreshold),
      envelope_allocated: envelopeAllocated ? parseFloat(envelopeAllocated) : 0.0
    }).then(() => {
      loadData()
      setMonthlyLimit('')
      setEnvelopeAllocated('')
      setShowAdd(false)
    })
  }

  const handleDelete = (id) => {
    deleteBudget(userId, id).then(loadData)
  }

  const totalBudgeted = budgets.reduce((s, b) => s + b.monthly_limit, 0)
  const totalSpent = budgets.reduce((s, b) => s + b.spent_so_far, 0)
  const totalEnvelope = budgets.reduce((s, b) => s + b.envelope_allocated, 0)

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* ── Hero Overview ─────────────────────────────── */}
      <div className="card card-gradient" style={{ borderRadius: 'var(--radius-lg)', padding: '20px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.85 }}>
            Monthly Budget Control
          </span>
          <button
            onClick={() => setEnvelopeMode(!envelopeMode)}
            className="btn-ghost btn-sm"
            style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)', padding: '3px 8px', fontSize: '0.72rem' }}
          >
            <Layers size={12} /> {envelopeMode ? 'Envelope Mode: ON' : 'Envelope Mode'}
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
          <div>
            <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>Total Spent</span>
            <p style={{ fontSize: '1.4rem', fontWeight: 700 }}>₹{totalSpent.toLocaleString()}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>
              {envelopeMode ? 'Total Allocated' : 'Total Budgeted'}
            </span>
            <p style={{ fontSize: '1.4rem', fontWeight: 700 }}>
              ₹{(envelopeMode ? totalEnvelope : totalBudgeted).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="progress-bar-track" style={{ height: 6, background: 'rgba(255,255,255,0.2)', marginTop: 12 }}>
          <div 
            className="progress-bar-fill" 
            style={{ 
              width: `${totalBudgeted > 0 ? Math.min((totalSpent / totalBudgeted) * 100, 100) : 0}%`,
              background: totalSpent > totalBudgeted ? '#ef4444' : '#34d399'
            }} 
          />
        </div>
      </div>

      {/* ── Category Budgets List ─────────────────────── */}
      <div className="card" style={{ padding: '16px 18px', marginBottom: 0 }}>
        <div className="section-title">
          <span>Active Category Budgets</span>
          <span className="muted text-xs">{budgets.length} budgets</span>
        </div>

        {loading ? (
          <p className="muted text-center py-6">Loading budgets…</p>
        ) : budgets.length === 0 ? (
          <div className="text-center py-8">
            <p style={{ fontSize: '1.8rem', marginBottom: 6 }}>🎯</p>
            <p className="muted" style={{ fontWeight: 600 }}>No category budgets set</p>
            <p className="muted text-xs mt-1">Set spending limits on Food, Fuel, Shopping and get alerted.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {budgets.map((b) => (
              <div key={b.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{b.category}</span>
                    {b.is_overbudget && (
                      <span className="badge" style={{ background: '#fef2f2', color: '#ef4444', fontSize: '0.65rem' }}>
                        Overbudget!
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: b.is_overbudget ? '#ef4444' : 'var(--text-main)' }}>
                      ₹{b.spent_so_far.toLocaleString()} / ₹{b.monthly_limit.toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleDelete(b.id)}
                      style={{
                        background: 'transparent', color: '#94a3b8',
                        padding: 2, width: 'auto', boxShadow: 'none'
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="progress-bar-track">
                  <div 
                    className="progress-bar-fill" 
                    style={{ 
                      width: `${Math.min(b.percentage_used, 100)}%`,
                      background: b.is_overbudget ? '#ef4444' : b.percentage_used >= 80 ? '#f59e0b' : '#2563eb'
                    }} 
                  />
                </div>

                {envelopeMode && b.envelope_allocated > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    <span>Envelope Allocated: ₹{b.envelope_allocated.toLocaleString()}</span>
                    <span>Remaining: ₹{Math.max(0, b.envelope_allocated - b.spent_so_far).toLocaleString()}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add / Update Budget Modal ─────────────────── */}
      {showAdd && (
        <div className="modal-backdrop" onClick={() => setShowAdd(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Set Category Budget</h3>
              <button className="btn-close-modal" onClick={() => setShowAdd(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} style={{ padding: '14px 16px 18px 16px', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>CATEGORY</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ marginTop: 4 }}>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>MONTHLY LIMIT (₹)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 5000"
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(e.target.value)}
                  required
                  style={{ marginTop: 4, fontSize: '1.1rem', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>ALERT THRESHOLD</label>
                <select value={alertThreshold} onChange={(e) => setAlertThreshold(e.target.value)} style={{ marginTop: 4 }}>
                  <option value="0.8">Notify at 80% used</option>
                  <option value="0.9">Notify at 90% used</option>
                  <option value="1.0">Notify only when exceeded</option>
                </select>
              </div>

              {envelopeMode && (
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>ENVELOPE ALLOCATION (₹)</label>
                  <input 
                    type="number" 
                    placeholder="Strict envelope amount"
                    value={envelopeAllocated}
                    onChange={(e) => setEnvelopeAllocated(e.target.value)}
                    style={{ marginTop: 4 }}
                  />
                </div>
              )}

              <button type="submit" style={{ marginTop: 8 }}>
                Save Budget
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Add Trigger */}
      <button
        onClick={() => setShowAdd(true)}
        className="floating-add-btn"
        title="Set Budget"
      >
        <Plus size={22} />
      </button>
    </div>
  )
}
