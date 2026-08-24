import { useState, useEffect } from 'react'
import { 
  getSubscriptions, createSubscription, updateSubscription, deleteSubscription,
  getRecurring, createRecurring, updateRecurring, deleteRecurring,
  getCategories, getAccounts
} from '../api/client'
import { 
  Repeat, Bell, Plus, Trash2, Pause, Play, X, Calendar, 
  Sparkles, CheckCircle2, ArrowUpRight, ArrowDownLeft 
} from 'lucide-react'

export default function SubscriptionsView({ userId }) {
  const [activeTab, setActiveTab] = useState('subscriptions') // 'subscriptions' or 'recurring'
  const [subscriptions, setSubscriptions] = useState([])
  const [recurring, setRecurring] = useState([])
  const [categories, setCategories] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)

  // Add modal state
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Entertainment')
  const [accountId, setAccountId] = useState('')
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [txType, setTxType] = useState('expense')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [reminder5d, setReminder5d] = useState(true)
  const [reminder1d, setReminder1d] = useState(true)

  const loadData = () => {
    if (!userId) return
    setLoading(true)
    Promise.all([
      getSubscriptions(userId),
      getRecurring(userId),
      getCategories(userId),
      getAccounts(userId)
    ]).then(([subs, recs, cats, accs]) => {
      setSubscriptions(subs || [])
      setRecurring(recs || [])
      setCategories(cats || [])
      setAccounts(accs || [])
      if (accs?.length > 0 && !accountId) {
        setAccountId(accs[0].id)
      }
    }).finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [userId])

  const handleCreate = (e) => {
    e.preventDefault()
    if (!name || !amount || !userId) return

    if (activeTab === 'subscriptions') {
      createSubscription(userId, {
        name,
        amount: parseFloat(amount),
        category,
        account_id: accountId ? parseInt(accountId, 10) : null,
        billing_cycle: billingCycle,
        start_date: startDate,
        next_due_date: startDate,
        status: 'active',
        reminder_5d: reminder5d,
        reminder_1d: reminder1d
      }).then(() => {
        loadData()
        resetForm()
      })
    } else {
      createRecurring(userId, {
        name,
        amount: parseFloat(amount),
        transaction_type: txType,
        category,
        account_id: accountId ? parseInt(accountId, 10) : null,
        frequency: billingCycle,
        start_date: startDate,
        next_due_date: startDate,
        status: 'active',
        reminder_5d: reminder5d,
        reminder_1d: reminder1d
      }).then(() => {
        loadData()
        resetForm()
      })
    }
  }

  const resetForm = () => {
    setName('')
    setAmount('')
    setShowAdd(false)
  }

  const handleToggleStatus = (item, isSub) => {
    const nextStatus = item.status === 'active' ? 'paused' : 'active'
    if (isSub) {
      updateSubscription(userId, item.id, { status: nextStatus }).then(loadData)
    } else {
      updateRecurring(userId, item.id, { status: nextStatus }).then(loadData)
    }
  }

  const handleDelete = (id, isSub) => {
    if (isSub) {
      deleteSubscription(userId, id).then(loadData)
    } else {
      deleteRecurring(userId, id).then(loadData)
    }
  }

  const totalMonthlySubs = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + (s.billing_cycle === 'yearly' ? s.amount / 12 : s.amount), 0)

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* ── Hero Banner ───────────────────────────────── */}
      <div className="card card-gradient" style={{ borderRadius: 'var(--radius-lg)', padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Repeat size={18} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.85 }}>
            Automated Expenses
          </span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-1px' }}>
          ₹{totalMonthlySubs.toFixed(0)} <span style={{ fontSize: '0.9rem', fontWeight: 500, opacity: 0.8 }}>/ month</span>
        </h1>
        <p style={{ fontSize: '0.78rem', opacity: 0.85, marginTop: 4 }}>
          {subscriptions.filter(s => s.status === 'active').length} active subscriptions • Auto-logged on billing date
        </p>
      </div>

      {/* ── Tab Switcher ──────────────────────────────── */}
      <div style={{ display: 'flex', background: 'rgba(37,99,235,0.06)', padding: 4, borderRadius: 'var(--radius-full)' }}>
        <button
          type="button"
          onClick={() => setActiveTab('subscriptions')}
          style={{
            flex: 1, padding: '8px', fontSize: '0.82rem',
            background: activeTab === 'subscriptions' ? '#ffffff' : 'transparent',
            color: activeTab === 'subscriptions' ? 'var(--primary)' : 'var(--text-muted)',
            borderRadius: 'var(--radius-full)', boxShadow: activeTab === 'subscriptions' ? 'var(--card-shadow)' : 'none'
          }}
        >
          Subscriptions
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('recurring')}
          style={{
            flex: 1, padding: '8px', fontSize: '0.82rem',
            background: activeTab === 'recurring' ? '#ffffff' : 'transparent',
            color: activeTab === 'recurring' ? 'var(--primary)' : 'var(--text-muted)',
            borderRadius: 'var(--radius-full)', boxShadow: activeTab === 'recurring' ? 'var(--card-shadow)' : 'none'
          }}
        >
          Recurring Bills & EMIs
        </button>
      </div>

      {/* ── Subscriptions / Recurring List ────────────── */}
      <div className="card" style={{ padding: '4px 0', marginBottom: 0 }}>
        {loading ? (
          <p className="muted text-center py-8">Loading automated items…</p>
        ) : activeTab === 'subscriptions' ? (
          subscriptions.length === 0 ? (
            <div className="text-center py-10">
              <p style={{ fontSize: '1.8rem', marginBottom: 6 }}>📺</p>
              <p className="muted" style={{ fontWeight: 600 }}>No subscriptions tracked</p>
              <p className="muted text-xs mt-1">Add your Netflix, Spotify, or Gym memberships.</p>
            </div>
          ) : (
            subscriptions.map((s, idx) => (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 18px',
                  borderBottom: idx < subscriptions.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                  opacity: s.status === 'paused' ? 0.55 : 1
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>{s.name}</p>
                    <span className="badge" style={{ background: 'rgba(37,99,235,0.08)', color: 'var(--primary)', fontSize: '0.65rem' }}>
                      {s.billing_cycle}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Next: {s.next_due_date}</span>
                    <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#cbd5e1' }} />
                    <span style={{ fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Bell size={11} /> 5d & 1d alerts
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                    ₹{s.amount.toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleToggleStatus(s, true)}
                    style={{
                      background: s.status === 'active' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                      color: s.status === 'active' ? '#f59e0b' : '#10b981',
                      padding: 6, width: 28, height: 28, minWidth: 28,
                      borderRadius: 6, boxShadow: 'none'
                    }}
                    title={s.status === 'active' ? 'Pause subscription' : 'Resume subscription'}
                  >
                    {s.status === 'active' ? <Pause size={13} /> : <Play size={13} />}
                  </button>
                  <button
                    onClick={() => handleDelete(s.id, true)}
                    style={{
                      background: 'rgba(239,68,68,0.08)', color: '#ef4444',
                      padding: 6, width: 28, height: 28, minWidth: 28,
                      borderRadius: 6, boxShadow: 'none'
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )
        ) : (
          recurring.length === 0 ? (
            <div className="text-center py-10">
              <p style={{ fontSize: '1.8rem', marginBottom: 6 }}>📅</p>
              <p className="muted" style={{ fontWeight: 600 }}>No recurring bills or income</p>
              <p className="muted text-xs mt-1">Add recurring Rent, Salary, Wifi, or Loan EMIs.</p>
            </div>
          ) : (
            recurring.map((r, idx) => (
              <div
                key={r.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 18px',
                  borderBottom: idx < recurring.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                  opacity: r.status === 'paused' ? 0.55 : 1
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>{r.name}</p>
                    <span className="badge" style={{ background: r.transaction_type === 'income' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: r.transaction_type === 'income' ? '#10b981' : '#ef4444', fontSize: '0.65rem' }}>
                      {r.transaction_type}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Due: {r.next_due_date} ({r.frequency})</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: r.transaction_type === 'income' ? '#10b981' : '#ef4444' }}>
                    {r.transaction_type === 'income' ? '+' : '-'}₹{r.amount.toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleToggleStatus(r, false)}
                    style={{
                      background: 'rgba(0,0,0,0.05)', color: 'var(--text-muted)',
                      padding: 6, width: 28, height: 28, minWidth: 28,
                      borderRadius: 6, boxShadow: 'none'
                    }}
                  >
                    {r.status === 'active' ? <Pause size={13} /> : <Play size={13} />}
                  </button>
                  <button
                    onClick={() => handleDelete(r.id, false)}
                    style={{
                      background: 'rgba(239,68,68,0.08)', color: '#ef4444',
                      padding: 6, width: 28, height: 28, minWidth: 28,
                      borderRadius: 6, boxShadow: 'none'
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )
        )}
      </div>

      {/* ── Add Modal ─────────────────────────────────── */}
      {showAdd && (
        <div className="modal-backdrop" onClick={() => setShowAdd(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {activeTab === 'subscriptions' ? 'Add Subscription' : 'Add Recurring Bill'}
              </h3>
              <button className="btn-close-modal" onClick={() => setShowAdd(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ padding: '14px 16px 18px 16px', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
              <input 
                type="text" 
                placeholder={activeTab === 'subscriptions' ? 'Service Name (e.g. Netflix, Spotify)' : 'Bill Name (e.g. Rent, Electricity, Salary)'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <input 
                type="number" 
                placeholder="Amount (₹)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                style={{ fontSize: '1.2rem', fontWeight: 700, textAlign: 'center' }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>BILLING CYCLE</label>
                  <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)} style={{ marginTop: 4 }}>
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>CATEGORY</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ marginTop: 4 }}>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>BILLED FROM ACCOUNT</label>
                <select value={accountId} onChange={(e) => setAccountId(e.target.value)} style={{ marginTop: 4 }}>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name} (₹{a.balance.toLocaleString()})</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>START / DUE DATE</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ marginTop: 4 }} />
              </div>

              <div style={{ background: '#f8faff', padding: 10, borderRadius: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <strong>Smart Reminders</strong>: Automatic alerts will be triggered 5 days and 1 day before charge date.
              </div>

              <button type="submit" style={{ marginTop: 6 }}>
                Save & Activate Auto-Logger
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Add Trigger */}
      <button
        onClick={() => setShowAdd(true)}
        className="floating-add-btn"
        title="Add Subscription or Bill"
      >
        <Plus size={22} />
      </button>
    </div>
  )
}
