import { useState, useEffect } from 'react'
import { getAccounts, createAccount, updateAccount, deleteAccount, getNetWorth } from '../api/client'
import { 
  Building2, Wallet, CreditCard, PiggyBank, Plus, 
  Trash2, ArrowUpRight, ArrowDownLeft, X, Sparkles, Check 
} from 'lucide-react'

const ACCOUNT_TYPES = [
  { label: 'Bank Account', value: 'bank', icon: Building2, color: '#2563eb' },
  { label: 'Cash in Hand', value: 'cash', icon: Wallet, color: '#10b981' },
  { label: 'Credit Card', value: 'credit_card', icon: CreditCard, color: '#f59e0b' },
  { label: 'Digital Wallet', value: 'wallet', icon: Wallet, color: '#06b6d4' },
  { label: 'Investment', value: 'investment', icon: PiggyBank, color: '#8b5cf6' },
]

export default function AccountsView({ userId }) {
  const [netWorth, setNetWorth] = useState(null)
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)

  // Add modal state
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [accountType, setAccountType] = useState('bank')
  const [balance, setBalance] = useState('')
  const [currency, setCurrency] = useState('INR')
  const [isDefault, setIsDefault] = useState(false)

  const loadData = () => {
    if (!userId) return
    setLoading(true)
    Promise.all([
      getAccounts(userId),
      getNetWorth(userId)
    ]).then(([accs, nw]) => {
      setAccounts(accs || [])
      setNetWorth(nw || null)
    }).finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [userId])

  const handleCreate = (e) => {
    e.preventDefault()
    if (!name || !userId) return

    createAccount(userId, {
      name,
      account_type: accountType,
      balance: parseFloat(balance) || 0.0,
      currency,
      color: ACCOUNT_TYPES.find(t => t.value === accountType)?.color || '#2563eb',
      is_default: isDefault
    }).then(() => {
      loadData()
      setName('')
      setBalance('')
      setShowAdd(false)
    })
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this account and unlink transactions?')) {
      deleteAccount(userId, id).then(loadData)
    }
  }

  const nwVal = netWorth?.total_net_worth || 0
  const assetsVal = netWorth?.total_assets || 0
  const liabilitiesVal = netWorth?.total_liabilities || 0

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* ── Net Worth Rollup Hero ─────────────────────── */}
      <div className="card card-gradient" style={{ borderRadius: 'var(--radius-lg)', padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Sparkles size={16} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.85 }}>
            Consolidated Net Worth
          </span>
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-1px' }}>
          ₹{nwVal.toLocaleString()}
        </h1>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <div>
            <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>Total Assets</span>
            <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#34d399' }}>₹{assetsVal.toLocaleString()}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>Total Liabilities</span>
            <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f87171' }}>₹{liabilitiesVal.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* ── Accounts List ─────────────────────────────── */}
      <div className="card" style={{ padding: '16px 18px', marginBottom: 0 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>
          <span>Your Linked Accounts</span>
          <span className="muted text-xs">{accounts.length} accounts</span>
        </div>

        {loading ? (
          <p className="muted text-center py-6">Loading accounts…</p>
        ) : accounts.length === 0 ? (
          <div className="text-center py-8">
            <p className="muted">No accounts added yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {accounts.map((acc) => {
              const typeMeta = ACCOUNT_TYPES.find(t => t.value === acc.account_type) || ACCOUNT_TYPES[0]
              const IconComp = typeMeta.icon
              const isCredit = acc.account_type === 'credit_card'

              return (
                <div 
                  key={acc.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 14px',
                    background: '#f8faff',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(37,99,235,0.08)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: `${typeMeta.color}15`,
                      color: typeMeta.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <IconComp size={20} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <p style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>{acc.name}</p>
                        {acc.is_default && (
                          <span className="badge" style={{ background: 'rgba(37,99,235,0.1)', color: 'var(--primary)', fontSize: '0.65rem' }}>
                            Default
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {typeMeta.label} • {acc.currency}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{
                        fontWeight: 800, fontSize: '1rem',
                        color: isCredit && acc.balance > 0 ? '#ef4444' : '#1e293b'
                      }}>
                        ₹{acc.balance.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(acc.id)}
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
              )
            })}
          </div>
        )}
      </div>

      {/* ── Add Account Modal ─────────────────────────── */}
      {showAdd && (
        <div className="modal-backdrop" onClick={() => setShowAdd(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Link New Account</h3>
              <button className="btn-close-modal" onClick={() => setShowAdd(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ padding: '14px 16px 18px 16px', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
              <input 
                type="text" 
                placeholder="Account Name (e.g. HDFC Salary, Wallet)" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>ACCOUNT TYPE</label>
                <select value={accountType} onChange={(e) => setAccountType(e.target.value)} style={{ marginTop: 4 }}>
                  {ACCOUNT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>INITIAL BALANCE / OUTSTANDING (₹)</label>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  value={balance} 
                  onChange={(e) => setBalance(e.target.value)}
                  style={{ marginTop: 4, fontSize: '1.1rem', fontWeight: 700 }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <input 
                  type="checkbox" 
                  id="isDef" 
                  checked={isDefault} 
                  onChange={(e) => setIsDefault(e.target.checked)} 
                  style={{ width: 'auto' }}
                />
                <label htmlFor="isDef" style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-main)' }}>
                  Set as default account for transactions
                </label>
              </div>

              <button type="submit" style={{ marginTop: 8 }}>
                Save Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Add Trigger */}
      <button
        onClick={() => setShowAdd(true)}
        className="floating-add-btn"
        title="Add Account"
      >
        <Plus size={22} />
      </button>
    </div>
  )
}
