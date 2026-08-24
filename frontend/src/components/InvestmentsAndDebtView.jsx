import { useState, useEffect } from 'react'
import { 
  getInvestments, createInvestment, updateInvestment, deleteInvestment,
  getDebts, createDebt, updateDebt, deleteDebt
} from '../api/client'
import { 
  TrendingUp, Users, Plus, Trash2, X, Check, ArrowDownLeft, ArrowUpRight, PiggyBank 
} from 'lucide-react'

export default function InvestmentsAndDebtView({ userId }) {
  const [activeTab, setActiveTab] = useState('investments') // 'investments' or 'debts'
  const [investments, setInvestments] = useState([])
  const [debts, setDebts] = useState([])
  const [loading, setLoading] = useState(true)

  // Add modal state
  const [showAdd, setShowAdd] = useState(false)
  const [invName, setInvName] = useState('')
  const [assetType, setAssetType] = useState('mutual_fund')
  const [investedAmt, setInvestedAmt] = useState('')
  const [currentVal, setCurrentVal] = useState('')
  const [invNotes, setInvNotes] = useState('')

  const [debtType, setDebtType] = useState('borrowed') // 'borrowed' (I owe) or 'lent' (Owed to me)
  const [counterparty, setCounterparty] = useState('')
  const [debtAmt, setDebtAmt] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [debtNotes, setDebtNotes] = useState('')

  const loadData = () => {
    if (!userId) return
    setLoading(true)
    Promise.all([
      getInvestments(userId),
      getDebts(userId)
    ]).then(([invs, dList]) => {
      setInvestments(invs || [])
      setDebts(dList || [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [userId])

  const handleCreateInvestment = (e) => {
    e.preventDefault()
    if (!invName || !userId) return

    createInvestment(userId, {
      name: invName,
      asset_type: assetType,
      invested_amount: parseFloat(investedAmt) || 0.0,
      current_value: parseFloat(currentVal) || parseFloat(investedAmt) || 0.0,
      notes: invNotes
    }).then(() => {
      loadData()
      setInvName('')
      setInvestedAmt('')
      setCurrentVal('')
      setShowAdd(false)
    })
  }

  const handleCreateDebt = (e) => {
    e.preventDefault()
    if (!counterparty || !debtAmt || !userId) return

    createDebt(userId, {
      debt_type: debtType,
      counterparty_name: counterparty,
      amount: parseFloat(debtAmt),
      settled_amount: 0.0,
      due_date: dueDate || null,
      notes: debtNotes
    }).then(() => {
      loadData()
      setCounterparty('')
      setDebtAmt('')
      setShowAdd(false)
    })
  }

  const handleDeleteInv = (id) => deleteInvestment(userId, id).then(loadData)
  const handleDeleteDebt = (id) => deleteDebt(userId, id).then(loadData)

  const handleSettleDebt = (d) => {
    updateDebt(userId, d.id, { settled_amount: d.amount }).then(loadData)
  }

  const totalPortfolioValue = investments.reduce((s, i) => s + i.current_value, 0)
  const totalInvested = investments.reduce((s, i) => s + i.invested_amount, 0)
  const totalReturns = totalPortfolioValue - totalInvested

  const totalBorrowed = debts.filter(d => d.debt_type === 'borrowed').reduce((s, d) => s + (d.amount - d.settled_amount), 0)
  const totalLent = debts.filter(d => d.debt_type === 'lent').reduce((s, d) => s + (d.amount - d.settled_amount), 0)

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* ── Hero Banner ───────────────────────────────── */}
      <div className="card card-gradient" style={{ borderRadius: 'var(--radius-lg)', padding: '20px 22px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.85 }}>
          {activeTab === 'investments' ? 'Investment Portfolio' : 'Debt & IOUs Ledger'}
        </span>

        {activeTab === 'investments' ? (
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-1px', margin: '4px 0' }}>
              ₹{totalPortfolioValue.toLocaleString()}
            </h1>
            <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: '0.82rem', opacity: 0.9 }}>
              <span>Invested: ₹{totalInvested.toLocaleString()}</span>
              <span style={{ color: totalReturns >= 0 ? '#34d399' : '#f87171', fontWeight: 700 }}>
                {totalReturns >= 0 ? '+' : ''}₹{totalReturns.toLocaleString()}
              </span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
            <div>
              <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>I Owe (Borrowings)</span>
              <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f87171' }}>₹{totalBorrowed.toLocaleString()}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>Owed to Me (Lent)</span>
              <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#34d399' }}>₹{totalLent.toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Tab Switcher ──────────────────────────────── */}
      <div style={{ display: 'flex', background: 'rgba(37,99,235,0.06)', padding: 4, borderRadius: 'var(--radius-full)' }}>
        <button
          type="button"
          onClick={() => setActiveTab('investments')}
          style={{
            flex: 1, padding: '8px', fontSize: '0.82rem',
            background: activeTab === 'investments' ? '#ffffff' : 'transparent',
            color: activeTab === 'investments' ? 'var(--primary)' : 'var(--text-muted)',
            borderRadius: 'var(--radius-full)', boxShadow: activeTab === 'investments' ? 'var(--card-shadow)' : 'none'
          }}
        >
          Investments (SIP/Stocks/FD)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('debts')}
          style={{
            flex: 1, padding: '8px', fontSize: '0.82rem',
            background: activeTab === 'debts' ? '#ffffff' : 'transparent',
            color: activeTab === 'debts' ? 'var(--primary)' : 'var(--text-muted)',
            borderRadius: 'var(--radius-full)', boxShadow: activeTab === 'debts' ? 'var(--card-shadow)' : 'none'
          }}
        >
          Debts & Loans (Who-Owes-Who)
        </button>
      </div>

      {/* ── Content List ──────────────────────────────── */}
      <div className="card" style={{ padding: '4px 0', marginBottom: 0 }}>
        {loading ? (
          <p className="muted text-center py-8">Loading items…</p>
        ) : activeTab === 'investments' ? (
          investments.length === 0 ? (
            <div className="text-center py-10">
              <p style={{ fontSize: '1.8rem', marginBottom: 6 }}>📈</p>
              <p className="muted" style={{ fontWeight: 600 }}>No investments logged</p>
              <p className="muted text-xs mt-1">Track your Mutual Funds, SIPs, Fixed Deposits, and Stocks.</p>
            </div>
          ) : (
            investments.map((inv, idx) => (
              <div 
                key={inv.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 18px',
                  borderBottom: idx < investments.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none'
                }}
              >
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>{inv.name}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {inv.asset_type.toUpperCase()} • Invested: ₹{inv.invested_amount.toLocaleString()}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                      ₹{inv.current_value.toLocaleString()}
                    </p>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: inv.current_value >= inv.invested_amount ? '#10b981' : '#ef4444' }}>
                      {inv.current_value >= inv.invested_amount ? '+' : ''}{(inv.current_value - inv.invested_amount).toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteInv(inv.id)}
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
          debts.length === 0 ? (
            <div className="text-center py-10">
              <p style={{ fontSize: '1.8rem', marginBottom: 6 }}>🤝</p>
              <p className="muted" style={{ fontWeight: 600 }}>No debts or loans recorded</p>
              <p className="muted text-xs mt-1">Keep track of money borrowed or lent to friends and family.</p>
            </div>
          ) : (
            debts.map((d, idx) => {
              const isSettled = d.settled_amount >= d.amount
              const remaining = Math.max(0, d.amount - d.settled_amount)

              return (
                <div 
                  key={d.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 18px',
                    borderBottom: idx < debts.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                    opacity: isSettled ? 0.5 : 1
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <p style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>{d.counterparty_name}</p>
                      <span className="badge" style={{
                        background: d.debt_type === 'borrowed' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                        color: d.debt_type === 'borrowed' ? '#ef4444' : '#10b981',
                        fontSize: '0.65rem'
                      }}>
                        {d.debt_type === 'borrowed' ? 'I Owe' : 'Owed to Me'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {isSettled ? 'Fully Settled' : d.due_date ? `Due: ${d.due_date}` : 'No due date'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: d.debt_type === 'borrowed' ? '#ef4444' : '#10b981' }}>
                      ₹{remaining.toLocaleString()}
                    </span>

                    {!isSettled && (
                      <button
                        onClick={() => handleSettleDebt(d)}
                        style={{
                          background: 'rgba(16,185,129,0.1)', color: '#10b981',
                          padding: 6, width: 28, height: 28, minWidth: 28,
                          borderRadius: 6, boxShadow: 'none'
                        }}
                        title="Mark as Settled"
                      >
                        <Check size={13} />
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteDebt(d.id)}
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
            })
          )
        )}
      </div>

      {/* ── Add Modal ─────────────────────────────────── */}
      {showAdd && (
        <div className="modal-backdrop" onClick={() => setShowAdd(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {activeTab === 'investments' ? 'Add Investment' : 'Record Loan / Debt'}
              </h3>
              <button className="btn-close-modal" onClick={() => setShowAdd(false)}>
                <X size={16} />
              </button>
            </div>

            {activeTab === 'investments' ? (
              <form onSubmit={handleCreateInvestment} style={{ padding: '18px 20px 32px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input 
                  type="text" 
                  placeholder="Asset Name (e.g. Parag Parikh Flexi Cap, HDFC FD)"
                  value={invName}
                  onChange={(e) => setInvName(e.target.value)}
                  required
                />

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>ASSET TYPE</label>
                  <select value={assetType} onChange={(e) => setAssetType(e.target.value)} style={{ marginTop: 4 }}>
                    <option value="mutual_fund">Mutual Fund / SIP</option>
                    <option value="stock">Direct Stocks</option>
                    <option value="fixed_deposit">Fixed Deposit</option>
                    <option value="gold">Gold / Sovereign Gold Bonds</option>
                    <option value="crypto">Crypto</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>INVESTED AMOUNT (₹)</label>
                    <input 
                      type="number" 
                      placeholder="₹ Invested" 
                      value={investedAmt} 
                      onChange={(e) => setInvestedAmt(e.target.value)}
                      style={{ marginTop: 4 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>CURRENT VALUE (₹)</label>
                    <input 
                      type="number" 
                      placeholder="₹ Current" 
                      value={currentVal} 
                      onChange={(e) => setCurrentVal(e.target.value)}
                      style={{ marginTop: 4 }}
                    />
                  </div>
                </div>

                <button type="submit" style={{ marginTop: 8 }}>
                  Save Investment
                </button>
              </form>
            ) : (
              <form onSubmit={handleCreateDebt} style={{ padding: '18px 20px 32px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setDebtType('borrowed')}
                    style={{
                      flex: 1, padding: '9px', fontSize: '0.85rem',
                      background: debtType === 'borrowed' ? '#ef4444' : 'rgba(0,0,0,0.05)',
                      color: debtType === 'borrowed' ? 'white' : 'var(--text-muted)',
                      boxShadow: 'none'
                    }}
                  >
                    I Borrowed (I Owe)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDebtType('lent')}
                    style={{
                      flex: 1, padding: '9px', fontSize: '0.85rem',
                      background: debtType === 'lent' ? '#10b981' : 'rgba(0,0,0,0.05)',
                      color: debtType === 'lent' ? 'white' : 'var(--text-muted)',
                      boxShadow: 'none'
                    }}
                  >
                    I Lent (Owed to Me)
                  </button>
                </div>

                <input 
                  type="text" 
                  placeholder="Person / Entity Name (e.g. John Doe, Bank Loan)" 
                  value={counterparty}
                  onChange={(e) => setCounterparty(e.target.value)}
                  required
                />

                <input 
                  type="number" 
                  placeholder="Amount (₹)" 
                  value={debtAmt}
                  onChange={(e) => setDebtAmt(e.target.value)}
                  required
                  style={{ fontSize: '1.2rem', fontWeight: 700, textAlign: 'center' }}
                />

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>DUE DATE (OPTIONAL)</label>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={{ marginTop: 4 }} />
                </div>

                <button type="submit" style={{ marginTop: 8 }}>
                  Save Loan Record
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Floating Add Trigger */}
      <button
        onClick={() => setShowAdd(true)}
        className="floating-add-btn"
        title="Add Entry"
      >
        <Plus size={22} />
      </button>
    </div>
  )
}
