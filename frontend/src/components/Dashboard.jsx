import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDashboardStats } from '../api/client'
import { cacheDashboardData, getCachedDashboardData } from '../utils/offlineSync'
import SwipeCarousel from './SwipeCarousel'
import CategoryPillGrid from './CategoryPillGrid'
import CategoryDetailModal from './CategoryDetailModal'
import { 
  Building2, Wallet, CreditCard, PiggyBank, 
  TrendingUp, AlertTriangle, Bell, ArrowUpRight, ArrowDownRight, Sparkles,
  CheckCircle2, Plus, SlidersHorizontal, ChevronRight
} from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts'
import './Dashboard.css'

export default function Dashboard({ userId }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(getCachedDashboardData())
  const [loading, setLoading] = useState(!stats)
  const [selectedCategory, setSelectedCategory] = useState(null)

  const activeUserId = userId || user?.id

  const loadData = () => {
    if (!activeUserId) return
    getDashboardStats(activeUserId)
      .then((data) => {
        setStats(data)
        cacheDashboardData(data)
        setLoading(false)
      })
      .catch((err) => {
        console.warn('Dashboard load failed, fallback to cache', err)
        setLoading(false)
      })
  }

  useEffect(() => {
    loadData()
  }, [activeUserId])

  if (loading && !stats) {
    return (
      <div className="fade-in py-12 text-center">
        <div className="card">
          <p className="muted">Loading your dashboard insights…</p>
        </div>
      </div>
    )
  }

  const s = stats || {
    net_worth: 0,
    total_assets: 0,
    total_liabilities: 0,
    total_income_this_month: 0,
    total_expense_this_month: 0,
    savings_rate: 0,
    category_pills: [],
    monthly_trends: [],
    anomalies: [],
    upcoming_reminders: [],
    budgets: [],
    accounts: []
  }

  // ─── SWIPEABLE CAROUSEL 1: HIGH-LEVEL OVERVIEW SLIDES ──────────────────

  // Slide 1: Consolidated Net Worth & Total Assets/Liabilities
  const NetWorthSlide = (
    <div className="carousel-card net-worth-card">
      <div className="card-top-tag">
        <Sparkles size={14} />
        <span>Consolidated Net Worth</span>
      </div>
      <h1 className="net-worth-amount">₹{s.net_worth.toLocaleString()}</h1>

      <div className="net-worth-metrics-row">
        <div>
          <span className="metric-label">Total Assets</span>
          <p className="metric-val text-success">₹{s.total_assets.toLocaleString()}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className="metric-label">Total Liabilities</span>
          <p className="metric-val text-danger">₹{s.total_liabilities.toLocaleString()}</p>
        </div>
      </div>

      <div className="accounts-pill-strip">
        {s.accounts.slice(0, 3).map((acc) => (
          <div key={acc.id} className="acc-mini-chip" onClick={() => navigate('/accounts')}>
            <span className="acc-mini-name">{acc.name}</span>
            <span className="acc-mini-bal">₹{acc.balance.toLocaleString()}</span>
          </div>
        ))}
        {s.accounts.length > 3 && (
          <div className="acc-mini-chip more" onClick={() => navigate('/accounts')}>
            +{s.accounts.length - 3} more
          </div>
        )}
      </div>
    </div>
  )

  // Slide 2: Monthly Inflow vs Outflow & Savings Pace
  const CashFlowSlide = (
    <div className="carousel-card cash-flow-card">
      <div className="card-top-tag">
        <TrendingUp size={14} />
        <span>Monthly Cash Flow (This Month)</span>
      </div>

      <div className="cash-flow-stats-grid">
        <div className="cash-box income">
          <span className="cash-box-label">Inflow (Income)</span>
          <h2 className="cash-box-amt">₹{s.total_income_this_month.toLocaleString()}</h2>
        </div>
        <div className="cash-box expense">
          <span className="cash-box-label">Outflow (Spend)</span>
          <h2 className="cash-box-amt">₹{s.total_expense_this_month.toLocaleString()}</h2>
        </div>
      </div>

      <div className="savings-rate-bar-wrap">
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
          <span className="font-semibold">Savings Rate</span>
          <span className="font-bold text-primary">{s.savings_rate.toFixed(1)}%</span>
        </div>
        <div className="progress-bar-track">
          <div 
            className="progress-bar-fill" 
            style={{ 
              width: `${Math.min(Math.max(s.savings_rate, 0), 100)}%`,
              background: 'linear-gradient(90deg, #2563eb, #06b6d4)'
            }} 
          />
        </div>
      </div>
    </div>
  )

  // Slide 3: Anomaly & Outlier Spend Alerts (if any)
  const AnomalySlide = s.anomalies.length > 0 ? (
    <div className="carousel-card anomaly-card">
      <div className="card-top-tag warning">
        <AlertTriangle size={14} />
        <span>Spend Anomalies Detected ({s.anomalies.length})</span>
      </div>

      <div className="anomaly-items-list">
        {s.anomalies.slice(0, 2).map((a) => (
          <div key={a.id} className="anomaly-row">
            <div>
              <p className="anomaly-title">{a.title}</p>
              <p className="anomaly-reason">{a.reason}</p>
            </div>
            <span className="anomaly-amt">₹{a.amount.toLocaleString()}</span>
          </div>
        ))}
      </div>
      <p className="muted text-xs text-center mt-2">Unusually high transactions flagged automatically.</p>
    </div>
  ) : (
    <div className="carousel-card anomaly-card">
      <div className="card-top-tag success">
        <CheckCircle2 size={14} />
        <span>Spending Health: Optimal</span>
      </div>
      <div style={{ padding: '16px 0', textAlign: 'center' }}>
        <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>No unusual spending spikes</p>
        <p className="muted text-xs mt-1">All category expenses are within your typical monthly ranges.</p>
      </div>
    </div>
  )

  const overviewSlides = [NetWorthSlide, CashFlowSlide, AnomalySlide]

  // ─── SWIPEABLE CAROUSEL 2: DEEP INSIGHTS SLIDES ────────────────────────

  // Slide 2.1: Category Budget Gauges & Envelope View
  const BudgetsSlide = (
    <div className="carousel-card">
      <div className="section-title">
        <span>Category Budgets</span>
        <button 
          className="btn-ghost btn-sm" 
          onClick={() => navigate('/budgets')}
        >
          Manage
        </button>
      </div>

      {s.budgets.length === 0 ? (
        <div className="text-center py-4">
          <p className="muted text-sm">No budgets set for this month.</p>
          <button 
            className="btn-sm mt-2" 
            style={{ width: 'auto', margin: '8px auto 0' }}
            onClick={() => navigate('/budgets')}
          >
            + Set Category Budget
          </button>
        </div>
      ) : (
        <div className="budget-slides-list">
          {s.budgets.slice(0, 3).map((b) => (
            <div key={b.id} className="budget-slide-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                <span className="font-semibold">{b.category}</span>
                <span style={{ color: b.is_overbudget ? '#ef4444' : 'var(--text-main)', fontWeight: 700 }}>
                  ₹{b.spent_so_far.toLocaleString()} / ₹{b.monthly_limit.toLocaleString()}
                </span>
              </div>
              <div className="progress-bar-track">
                <div 
                  className="progress-bar-fill" 
                  style={{ 
                    width: `${Math.min(b.percentage_used, 100)}%`,
                    background: b.is_overbudget ? '#ef4444' : b.percentage_used > 80 ? '#f59e0b' : '#10b981'
                  }} 
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // Slide 2.2: Upcoming Subscriptions & Bill Reminders (5d/1d due)
  const RemindersSlide = (
    <div className="carousel-card">
      <div className="section-title">
        <span>Upcoming Bills & Due Dates</span>
        <button 
          className="btn-ghost btn-sm" 
          onClick={() => navigate('/subscriptions')}
        >
          View All
        </button>
      </div>

      {s.upcoming_reminders.length === 0 ? (
        <div className="text-center py-4">
          <p className="muted text-sm">No bills or subscriptions due in the next 7 days.</p>
        </div>
      ) : (
        <div className="reminder-slides-list">
          {s.upcoming_reminders.slice(0, 3).map((r, i) => (
            <div key={i} className={`reminder-slide-item ${r.is_urgent ? 'urgent' : ''}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className={`reminder-badge ${r.is_urgent ? 'urgent' : ''}`}>
                  <Bell size={14} />
                </div>
                <div>
                  <p className="reminder-name">{r.name}</p>
                  <p className="reminder-due">{r.days_left === 0 ? 'Due today!' : r.days_left === 1 ? 'Due tomorrow' : `Due in ${r.days_left} days`}</p>
                </div>
              </div>
              <span className="reminder-amt">₹{r.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // Slide 2.3: Month-over-Month Cash Flow Trend Comparison Chart
  const TrendsSlide = (
    <div className="carousel-card">
      <div className="section-title">
        <span>6-Month Inflow vs Outflow</span>
        <span className="muted text-xs">Income & Expense</span>
      </div>

      <div style={{ width: '100%', height: 140 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={s.monthly_trends} barGap={3} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(37,99,235,0.06)" vertical={false} />
            <XAxis dataKey="month_name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip 
              formatter={(val, name) => [`₹${val.toLocaleString()}`, name === 'income' ? 'Income' : 'Expense']}
            />
            <Bar dataKey="income" name="income" fill="#2563eb" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  const insightSlides = [BudgetsSlide, RemindersSlide, TrendsSlide]

  return (
    <div className="dashboard-view fade-in">
      {/* ── 1. Top Swipeable Overview Carousel ───────────────── */}
      <SwipeCarousel 
        title="Portfolio & Cash Flow" 
        items={overviewSlides} 
      />

      {/* ── 2. Primary 2x3 Category Spend Pill Grid ─────────── */}
      <div className="section-header-row mt-4">
        <div>
          <h2 className="section-main-title">Category Spending</h2>
          <p className="section-sub-title">Top categories this month • Tap for deep insights</p>
        </div>
        <button 
          className="btn-ghost btn-sm" 
          onClick={() => navigate('/transactions')}
        >
          Filter
        </button>
      </div>

      <CategoryPillGrid 
        categories={s.category_pills} 
        onSelectCategory={(cat) => setSelectedCategory(cat)} 
      />

      {/* ── 3. Bottom Swipeable Deep Insights Carousel ──────── */}
      <div className="mt-4">
        <SwipeCarousel 
          title="Smart Insights & Forecasts" 
          items={insightSlides} 
        />
      </div>

      {/* ── 4. Floating Deep-Dive Modal on Category Tap ─────── */}
      {selectedCategory && (
        <CategoryDetailModal
          category={selectedCategory}
          userId={activeUserId}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </div>
  )
}
