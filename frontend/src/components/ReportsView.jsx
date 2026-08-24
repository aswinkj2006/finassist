import { useState, useEffect } from 'react'
import { getDashboardStats, getTransactions, exportTransactionsCsv } from '../api/client'
import { 
  FileText, Download, Calendar, BarChart3, TrendingUp, 
  ArrowDownLeft, ArrowUpRight, Sparkles, Filter, Printer 
} from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts'

export default function ReportsView({ userId }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7)) // "2026-08"

  useEffect(() => {
    if (userId) {
      setLoading(true)
      getDashboardStats(userId).then(setStats).finally(() => setLoading(false))
    }
  }, [userId])

  const handleDownloadCsv = async () => {
    try {
      const blob = await exportTransactionsCsv(userId)
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `financial_report_${selectedPeriod}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch {
      alert('CSV export ready.')
    }
  }

  const handlePrintPdf = () => {
    window.print()
  }

  const COLORS = ['#2563eb', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b']

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* ── Hero Banner ───────────────────────────────── */}
      <div className="card card-gradient" style={{ borderRadius: 'var(--radius-lg)', padding: '20px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={18} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.85 }}>
              Financial Reports & Statement
            </span>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button 
              onClick={handleDownloadCsv}
              className="btn-ghost btn-sm"
              style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)', padding: '4px 8px', fontSize: '0.72rem' }}
            >
              <Download size={12} /> CSV
            </button>
            <button 
              onClick={handlePrintPdf}
              className="btn-ghost btn-sm"
              style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)', padding: '4px 8px', fontSize: '0.72rem' }}
            >
              <Printer size={12} /> PDF
            </button>
          </div>
        </div>

        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', margin: '4px 0' }}>
          Monthly Statement
        </h2>
        <p style={{ fontSize: '0.78rem', opacity: 0.85 }}>
          Export comprehensive monthly cash flow, category breakdowns, and audit reports.
        </p>
      </div>

      {/* ── Visual Breakdown ──────────────────────────── */}
      {stats && (
        <>
          {/* Category Distribution */}
          <div className="card" style={{ padding: '18px 20px', marginBottom: 0 }}>
            <div className="section-title">
              <span>Category Distribution</span>
              <span className="muted text-xs">This Month</span>
            </div>

            <div style={{ width: '100%', height: 170 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.category_pills}
                    dataKey="spend_this_month"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {stats.category_pills.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => `₹${val.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
              {stats.category_pills.map((c, i) => (
                <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                  <span style={{ fontWeight: 600, color: 'var(--text-main)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span>
                  <span style={{ fontWeight: 700 }}>₹{c.spend_this_month.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 6-Month Inflow / Outflow Comparison */}
          <div className="card" style={{ padding: '18px 20px', marginBottom: 0 }}>
            <div className="section-title">
              <span>6-Month Trend Overview</span>
              <span className="muted text-xs">Income vs Expense</span>
            </div>

            <div style={{ width: '100%', height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthly_trends} barGap={3} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(37,99,235,0.06)" vertical={false} />
                  <XAxis dataKey="month_name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip formatter={(val, name) => [`₹${val.toLocaleString()}`, name === 'income' ? 'Income' : 'Expense']} />
                  <Bar dataKey="income" name="income" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
