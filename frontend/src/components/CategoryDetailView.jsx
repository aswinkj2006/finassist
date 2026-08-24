import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTransactions } from '../api/client'

export default function CategoryDetailView({ userId }) {
  const { subcat } = useParams()
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [duration, setDuration] = useState('10') // '10', '30', or ''

  useEffect(() => {
    if (userId) {
      setLoading(true)
      getTransactions(userId, 0, 100, subcat, duration)
        .then(data => {
          setTransactions(data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [userId, subcat, duration])

  const total = transactions.reduce((sum, tx) => sum + tx.amount, 0)

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: 'transparent', color: 'var(--text-main)', padding: '0 8px', width: 'auto', boxShadow: 'none' }}
        >
          ← Back
        </button>
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600, flex: 1, textAlign: 'center' }}>
          {subcat}
        </h2>
        <div style={{ width: '48px' }} /> {/* Spacer to balance flex */}
      </div>

      <section className="card card-gradient">
        <h3 style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>Total Spent</h3>
        <h1 className="amount">₹{total.toLocaleString()}</h1>
      </section>

      <section className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Transactions</h3>
          <select 
            value={duration} 
            onChange={(e) => setDuration(e.target.value)}
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.9rem' }}
          >
            <option value="10">Last 10 Days</option>
            <option value="30">Last 1 Month</option>
            <option value="">All Time</option>
          </select>
        </div>

        {loading ? (
          <p className="muted text-center py-4">Loading...</p>
        ) : transactions.length > 0 ? (
          <ul style={{ margin: 0, padding: 0 }}>
            {transactions.map(tx => (
              <li key={tx.id} className="list-item" style={{ cursor: 'default' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{tx.note || subcat}</div>
                  <div className="muted" style={{ fontSize: '0.8rem' }}>{tx.date} • {tx.category}</div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--danger)' }}>-₹{tx.amount.toLocaleString()}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted text-center py-4">No transactions found for this period.</p>
        )}
      </section>
    </div>
  )
}
