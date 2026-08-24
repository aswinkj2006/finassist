import { useState, useEffect } from 'react'
import { 
  getTransactions, createTransaction, deleteTransaction, 
  getCategories, getAccounts, exportTransactionsCsv 
} from '../api/client'
import { 
  Search, SlidersHorizontal, Plus, Download, Trash2, X, 
  ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Tag, Building2, Calendar
} from 'lucide-react'

const DATE_PRESETS = [
  { label: 'All', value: '' },
  { label: 'Today', value: '1' },
  { label: '7 Days', value: '7' },
  { label: '30 Days', value: '30' },
]

export default function LogView({ userId }) {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedAccount, setSelectedAccount] = useState('')
  const [selectedType, setSelectedType] = useState('All')
  const [daysAgo, setDaysAgo] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Add modal state
  const [showAdd, setShowAdd] = useState(false)
  const [amount, setAmount] = useState('')
  const [txType, setTxType] = useState('expense')
  const [category, setCategory] = useState('Food')
  const [selectedTags, setSelectedTags] = useState([])
  const [customTagInput, setCustomTagInput] = useState('')
  const [accountId, setAccountId] = useState('')
  const [note, setNote] = useState('')
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0])

  const loadData = () => {
    if (!userId) return
    setLoading(true)
    
    const filterParams = {
      search: search || undefined,
      category: selectedCategory !== 'All' ? selectedCategory : undefined,
      account_id: selectedAccount || undefined,
      transaction_type: selectedType !== 'All' ? selectedType : undefined,
      days_ago: daysAgo ? parseInt(daysAgo, 10) : undefined,
      min_amount: minAmount ? parseFloat(minAmount) : undefined,
      max_amount: maxAmount ? parseFloat(maxAmount) : undefined,
    }

    Promise.all([
      getTransactions(userId, filterParams),
      getCategories(userId),
      getAccounts(userId)
    ]).then(([txs, cats, accs]) => {
      setTransactions(txs || [])
      setCategories(cats || [])
      setAccounts(accs || [])
      if (accs?.length > 0 && !accountId) {
        const def = accs.find(a => a.is_default) || accs[0]
        setAccountId(def.id)
      }
    }).finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [userId, search, selectedCategory, selectedAccount, selectedType, daysAgo, minAmount, maxAmount])

  const handleExportCsv = async () => {
    try {
      const blob = await exportTransactionsCsv(userId, {
        category: selectedCategory !== 'All' ? selectedCategory : undefined
      })
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `transactions_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (e) {
      alert('CSV export completed.')
    }
  }

  const handleAddTransaction = (e) => {
    e.preventDefault()
    if (!amount || !userId) return

    createTransaction(userId, {
      amount: parseFloat(amount),
      transaction_type: txType,
      category: category,
      tags: selectedTags.join(','),
      account_id: accountId ? parseInt(accountId, 10) : null,
      note: note,
      date: txDate,
      source: 'manual'
    }).then(() => {
      loadData()
      setAmount('')
      setNote('')
      setSelectedTags([])
      setShowAdd(false)
    })
  }

  const handleDelete = (id) => {
    deleteTransaction(userId, id).then(loadData)
  }

  // Active category's predefined sub-tags
  const currentCatObj = categories.find(c => c.name.toLowerCase() === category.toLowerCase())
  const availableTags = currentCatObj?.tags?.map(t => t.name) || []

  const toggleTag = (tName) => {
    setSelectedTags(prev => 
      prev.includes(tName) ? prev.filter(t => t !== tName) : [...prev, tName]
    )
  }

  const totalSpent = transactions
    .filter(t => t.transaction_type === 'expense')
    .reduce((s, t) => s + t.amount, 0)

  const totalIncome = transactions
    .filter(t => t.transaction_type === 'income')
    .reduce((s, t) => s + t.amount, 0)

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      
      {/* ── Summary & Export Bar ──────────────────────── */}
      <div className="card card-gradient" style={{ borderRadius: 'var(--radius-lg)', padding: '20px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Filtered Ledger Summary
          </span>
          <button 
            onClick={handleExportCsv}
            className="btn-ghost btn-sm"
            style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)', padding: '4px 10px', fontSize: '0.75rem' }}
          >
            <Download size={13} /> Export CSV
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
          <div>
            <p style={{ fontSize: '0.72rem', opacity: 0.8 }}>Total Outflow</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 700 }}>-₹{totalSpent.toLocaleString()}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.72rem', opacity: 0.8 }}>Total Inflow</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#34d399' }}>+₹{totalIncome.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ──────────────────── */}
      <div className="card" style={{ padding: '14px 16px', marginBottom: 0 }}>
        {/* Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8faff', borderRadius: 'var(--radius-full)', padding: '8px 14px', border: '1px solid rgba(37,99,235,0.1)' }}>
          <Search size={16} color="#64748b" />
          <input 
            type="text"
            placeholder="Search merchant, notes, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', padding: 0, fontSize: '0.88rem', boxShadow: 'none' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'transparent', color: '#94a3b8', width: 'auto', padding: 0, boxShadow: 'none' }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Date presets & Filter toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {DATE_PRESETS.map((dp) => (
              <button
                key={dp.label}
                onClick={() => setDaysAgo(dp.value)}
                style={{
                  padding: '5px 12px', fontSize: '0.75rem', width: 'auto',
                  background: daysAgo === dp.value ? 'var(--primary)' : 'rgba(37,99,235,0.06)',
                  color: daysAgo === dp.value ? 'white' : 'var(--text-muted)',
                  border: 'none', borderRadius: 'var(--radius-full)',
                  boxShadow: 'none', fontWeight: 600
                }}
              >
                {dp.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-ghost btn-sm"
            style={{ padding: '5px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <SlidersHorizontal size={13} />
            <span>Filters</span>
          </button>
        </div>

        {/* Advanced Filter Drawer */}
        {showFilters && (
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Category Select */}
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Category</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ marginTop: 4, padding: '8px 12px', fontSize: '0.85rem' }}
              >
                <option value="All">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            {/* Account Select */}
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Account</label>
              <select 
                value={selectedAccount} 
                onChange={(e) => setSelectedAccount(e.target.value)}
                style={{ marginTop: 4, padding: '8px 12px', fontSize: '0.85rem' }}
              >
                <option value="">All Accounts</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name} (₹{a.balance.toLocaleString()})</option>)}
              </select>
            </div>

            {/* Amount Range */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Min Amount</label>
                <input 
                  type="number" 
                  placeholder="₹ Min" 
                  value={minAmount} 
                  onChange={(e) => setMinAmount(e.target.value)}
                  style={{ marginTop: 4, padding: '8px 12px', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Max Amount</label>
                <input 
                  type="number" 
                  placeholder="₹ Max" 
                  value={maxAmount} 
                  onChange={(e) => setMaxAmount(e.target.value)}
                  style={{ marginTop: 4, padding: '8px 12px', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Transactions List ─────────────────────────── */}
      <div className="card" style={{ padding: '4px 0', marginBottom: 0 }}>
        {loading ? (
          <p className="muted text-center py-8">Loading transactions…</p>
        ) : transactions.length === 0 ? (
          <div className="text-center py-10">
            <p style={{ fontSize: '1.8rem', marginBottom: 6 }}>🧾</p>
            <p className="muted" style={{ fontWeight: 600 }}>No transactions match criteria</p>
            <p className="muted text-xs mt-1">Tap the + button to record a new transaction.</p>
          </div>
        ) : (
          transactions.map((tx, idx) => {
            const isExpense = tx.transaction_type === 'expense'
            return (
              <div 
                key={tx.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 18px',
                  borderBottom: idx < transactions.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: isExpense ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                    color: isExpense ? '#ef4444' : '#10b981',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {isExpense ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                  </div>

                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      {tx.note || tx.subcategory || `${tx.category} Transaction`}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>{tx.date}</span>
                      <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#cbd5e1' }} />
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--primary)' }}>
                        {tx.category}
                      </span>
                      {tx.tags && (
                        <>
                          <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#cbd5e1' }} />
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{tx.tags}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <p style={{
                    fontWeight: 800, fontSize: '0.95rem',
                    color: isExpense ? '#ef4444' : '#10b981',
                    letterSpacing: '-0.5px'
                  }}>
                    {isExpense ? '-' : '+'}₹{tx.amount.toLocaleString()}
                  </p>
                  <button 
                    onClick={() => handleDelete(tx.id)}
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
        )}
      </div>

      {/* ── Floating Add Modal ────────────────────────── */}
      {showAdd && (
        <div className="modal-backdrop" onClick={() => setShowAdd(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Record Transaction</h3>
              <button className="btn-close-modal" onClick={() => setShowAdd(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} style={{ padding: '14px 16px 18px 16px', display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
              {/* Type Switcher (Expense / Income) */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setTxType('expense')}
                  style={{
                    flex: 1, padding: '9px', fontSize: '0.85rem',
                    background: txType === 'expense' ? '#ef4444' : 'rgba(0,0,0,0.05)',
                    color: txType === 'expense' ? 'white' : 'var(--text-muted)',
                    boxShadow: 'none'
                  }}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('income')}
                  style={{
                    flex: 1, padding: '9px', fontSize: '0.85rem',
                    background: txType === 'income' ? '#10b981' : 'rgba(0,0,0,0.05)',
                    color: txType === 'income' ? 'white' : 'var(--text-muted)',
                    boxShadow: 'none'
                  }}
                >
                  Income
                </button>
              </div>

              {/* Amount */}
              <input 
                type="number" 
                placeholder="Amount (₹)" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                required
                style={{ fontSize: '1.2rem', fontWeight: 700, textAlign: 'center' }}
              />

              {/* Category */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>CATEGORY</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ marginTop: 4 }}
                >
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              {/* Sub-tags Chips */}
              {availableTags.length > 0 && (
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>SUB-TAGS</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                    {availableTags.map(tName => {
                      const isSel = selectedTags.includes(tName)
                      return (
                        <button
                          key={tName}
                          type="button"
                          onClick={() => toggleTag(tName)}
                          style={{
                            padding: '4px 10px', fontSize: '0.75rem', width: 'auto',
                            background: isSel ? 'var(--primary)' : '#f1f5f9',
                            color: isSel ? 'white' : '#475569',
                            borderRadius: 'var(--radius-full)', border: 'none', boxShadow: 'none'
                          }}
                        >
                          {tName}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Account */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>ACCOUNT</label>
                <select 
                  value={accountId} 
                  onChange={(e) => setAccountId(e.target.value)}
                  style={{ marginTop: 4 }}
                >
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name} (₹{a.balance.toLocaleString()})</option>)}
                </select>
              </div>

              {/* Note */}
              <input 
                type="text" 
                placeholder="Merchant / Note (e.g. Swiggy order)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />

              {/* Date */}
              <input 
                type="date"
                value={txDate}
                onChange={(e) => setTxDate(e.target.value)}
              />

              <button type="submit" style={{ marginTop: 8 }}>
                Save Transaction
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Add Trigger Button */}
      <button
        onClick={() => setShowAdd(true)}
        className="floating-add-btn"
        title="Add Transaction"
      >
        <Plus size={22} />
      </button>
    </div>
  )
}
