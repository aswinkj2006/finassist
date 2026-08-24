import { useState, useEffect } from 'react'
import { X, TrendingUp, Tag, PieChart as PieIcon, ListFilter, IndianRupee } from 'lucide-react'
import { getTransactions } from '../api/client'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'

export default function CategoryDetailModal({ category, userId, onClose }) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (category?.name && userId) {
      setLoading(true)
      getTransactions(userId, { category: category.name, limit: 20 })
        .then(setTransactions)
        .finally(() => setLoading(false))
    }
  }, [category, userId])

  if (!category) return null

  const subtags = category.subtags_breakdown || []
  const COLORS = ['#6366f1', '#06b6d4', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6']

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div 
              className="modal-icon-badge" 
              style={{ background: `${category.color}20`, color: category.color }}
            >
              <Tag size={20} />
            </div>
            <div>
              <h3 className="modal-title">{category.name}</h3>
              <p className="modal-subtitle">Detailed Insights & Breakdown</p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Content Scrollable */}
        <div className="modal-scroll-body">
          {/* Key Metrics Banner */}
          <div className="category-modal-banner" style={{ background: `linear-gradient(135deg, ${category.color} 0%, #1e293b 100%)` }}>
            <div>
              <span className="banner-label" style={{ color: 'rgba(255,255,255,0.85)' }}>This Month's Spend</span>
              <h2 className="banner-value" style={{ color: '#ffffff' }}>₹{category.spend_this_month.toLocaleString()}</h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="banner-label" style={{ color: 'rgba(255,255,255,0.85)' }}>Share of Expenses</span>
              <h3 className="banner-subvalue" style={{ color: '#ffffff' }}>{category.percentage_of_total}%</h3>
            </div>
          </div>

          {/* Sub-tag Breakdown Chart & List */}
          {subtags.length > 0 && (
            <div className="modal-card">
              <div className="section-title">
                <span>Sub-tag Distribution</span>
                <span className="text-sm muted">{subtags.length} tags</span>
              </div>
              
              <div style={{ width: '100%', height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subtags}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={68}
                      paddingAngle={3}
                    >
                      {subtags.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val) => `₹${val.toLocaleString()}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="subtag-list">
                {subtags.map((st, i) => (
                  <div key={st.name} className="subtag-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="subtag-dot" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="subtag-name">{st.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="subtag-amt">₹{st.amount.toLocaleString()}</span>
                      <span className="subtag-pct">{st.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Budget Limit Progress (if set) */}
          {category.budget_limit && (
            <div className="modal-card">
              <div className="section-title">
                <span>Monthly Budget</span>
                <span className="text-sm" style={{ color: (category.budget_used_pct || 0) > 100 ? '#ef4444' : 'var(--primary)' }}>
                  {(category.budget_used_pct || 0).toFixed(0)}% Used
                </span>
              </div>
              <div className="progress-bar-track">
                <div 
                  className="progress-bar-fill" 
                  style={{ 
                    width: `${Math.min(category.budget_used_pct || 0, 100)}%`,
                    background: (category.budget_used_pct || 0) > 100 ? '#ef4444' : category.color
                  }} 
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.8rem' }}>
                <span className="muted">Spent: ₹{category.spend_this_month.toLocaleString()}</span>
                <span className="muted">Limit: ₹{category.budget_limit.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Recent Transactions in Category */}
          <div className="modal-card">
            <div className="section-title">
              <span>Recent Transactions</span>
              <span className="text-sm muted">{transactions.length} items</span>
            </div>

            {loading ? (
              <p className="muted text-center py-4">Loading transactions…</p>
            ) : transactions.length === 0 ? (
              <p className="muted text-center py-4">No recent transactions in this category.</p>
            ) : (
              <div className="category-tx-list">
                {transactions.map((tx) => (
                  <div key={tx.id} className="category-tx-row">
                    <div>
                      <p className="category-tx-note">{tx.note || tx.tags || tx.subcategory || 'Expense'}</p>
                      <p className="category-tx-meta">{tx.date} • {tx.tags || 'General'}</p>
                    </div>
                    <div className="category-tx-amt">
                      -₹{tx.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
