import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { 
  Utensils, Fuel, Home, Car, Zap, ShoppingBag, 
  Film, HeartPulse, Package, Tag, ArrowUpRight, ArrowDownRight, TrendingUp, Sparkles, PieChart as PieIcon 
} from 'lucide-react'

// Icon map fallback
const ICON_MAP = {
  Utensils: Utensils,
  Fuel: Fuel,
  Home: Home,
  Car: Car,
  Zap: Zap,
  ShoppingBag: ShoppingBag,
  Film: Film,
  HeartPulse: HeartPulse,
  Package: Package,
  Tag: Tag
}

const PIE_COLORS = ['#2563eb', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b', '#f97316', '#3b82f6']

export default function CategoryPillGrid({ categories = [], onSelectCategory }) {
  if (!categories || categories.length === 0) {
    return (
      <div className="card text-center py-6">
        <p className="muted">No category spend recorded this month.</p>
      </div>
    )
  }

  // Active categories with spending for the pie chart
  const categoriesWithSpend = categories.filter(c => c.spend_this_month > 0)
  const pieData = categoriesWithSpend.length > 0 ? categoriesWithSpend : categories.slice(0, 5)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* 2x1 Scrollable Table / Grid Container */}
      <div 
        style={{
          display: 'grid',
          gridAutoFlow: 'column',
          gridTemplateRows: 'repeat(2, auto)',
          gridAutoColumns: 'calc(50% - 6px)',
          gap: 10,
          overflowX: 'auto',
          paddingBottom: 4,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {categories.map((cat, idx) => {
          const IconComponent = ICON_MAP[cat.icon] || Tag
          const isUp = cat.trend_percentage > 0
          const isNeutral = cat.trend_percentage === 0

          return (
            <div
              key={cat.name || idx}
              className="category-pill-card"
              style={{ minWidth: 155, margin: 0 }}
              onClick={() => onSelectCategory(cat)}
              role="button"
              tabIndex={0}
            >
              {/* Top row: Icon + Name + Mini Trend */}
              <div className="pill-top-row">
                <div 
                  className="pill-icon-wrap" 
                  style={{ background: `${cat.color}15`, color: cat.color }}
                >
                  <IconComponent size={16} />
                </div>
                <span className="pill-title">{cat.name}</span>
                
                <div className={`pill-trend ${isUp ? 'up' : isNeutral ? 'neutral' : 'down'}`}>
                  {isUp ? <ArrowUpRight size={12} /> : isNeutral ? null : <ArrowDownRight size={12} />}
                  <span>{Math.abs(cat.trend_percentage).toFixed(0)}%</span>
                </div>
              </div>

              {/* Middle row: Spend Amount */}
              <div className="pill-amount-row">
                <span className="pill-amount">₹{cat.spend_this_month.toLocaleString()}</span>
                {cat.percentage_of_total > 0 && (
                  <span className="pill-pct">{cat.percentage_of_total}%</span>
                )}
              </div>

              {/* Bottom mini indicator (Top sub-tag or budget progress) */}
              <div className="pill-meta-row">
                {cat.budget_limit ? (
                  <div className="pill-budget-mini">
                    <div className="pill-budget-track">
                      <div 
                        className="pill-budget-bar" 
                        style={{ 
                          width: `${Math.min(cat.budget_used_pct || 0, 100)}%`,
                          background: (cat.budget_used_pct || 0) > 100 ? '#ef4444' : cat.color 
                        }} 
                      />
                    </div>
                    <span className="pill-subtext">
                      {(cat.budget_used_pct || 0).toFixed(0)}% budget
                    </span>
                  </div>
                ) : (
                  <span className="pill-subtext">
                    {cat.subtags_breakdown?.[0]?.name ? `${cat.subtags_breakdown[0].name} (${cat.subtags_breakdown[0].pct}%)` : 'Tap for insights'}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Category Distribution Dynamic Pie Chart in the extra space below */}
      <div className="card" style={{ padding: '16px 18px', marginBottom: 0 }}>
        <div className="section-title" style={{ marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <PieIcon size={16} color="var(--primary)" />
            <span>Category Distribution</span>
          </div>
          <span className="muted text-xs">Share of Spend</span>
        </div>

        <div style={{ width: '100%', height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="spend_this_month"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={44}
                outerRadius={70}
                paddingAngle={3}
              >
                {pieData.map((entry, index) => (
                  <Cell 
                    key={`pie-${index}`} 
                    fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(val) => `₹${Number(val).toLocaleString()}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 4 }}>
          {categories.slice(0, 4).map((c, i) => (
            <div 
              key={c.name} 
              onClick={() => onSelectCategory(c)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', cursor: 'pointer' }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color || PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
              <span style={{ fontWeight: 600, color: 'var(--text-main)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span>
              <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>₹{c.spend_this_month.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
