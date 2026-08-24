import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Bot, X, Bell, FileText, Repeat, Layers, PiggyBank, Building2 } from 'lucide-react'
import Dashboard from './components/Dashboard'
import LogView from './components/LogView'
import ProfileView from './components/ProfileView'
import GoalsView from './components/GoalsView'
import SubscriptionsView from './components/SubscriptionsView'
import AccountsView from './components/AccountsView'
import BudgetsView from './components/BudgetsView'
import InvestmentsAndDebtView from './components/InvestmentsAndDebtView'
import ReportsView from './components/ReportsView'
import BottomNav from './components/BottomNav'
import SplashView from './components/SplashView'
import AuthView from './components/AuthView'
import OnboardingChat from './components/OnboardingChat'
import CategoryDetailView from './components/CategoryDetailView'
import ChatView from './components/ChatView'
import { AuthProvider, useAuth } from './context/AuthContext'
import './App.css'

function ProtectedRoute({ children, requireOnboarding = true }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" />
  if (requireOnboarding && !user.onboarding_complete) return <Navigate to="/onboarding" />
  return children
}

const SHELL_EXCLUDED_PATHS = ['/', '/login', '/onboarding']

function AppContent() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [showChat, setShowChat] = useState(false)
  const [showQuickMenu, setShowQuickMenu] = useState(false)

  if (loading) return null

  const isShellHidden = !user || SHELL_EXCLUDED_PATHS.includes(location.pathname)

  return (
    <div className="app">
      {!isShellHidden && (
        <header className="app-header">
          <img 
            src="/logo.png" 
            alt="FinAssist" 
            style={{ height: '32px', objectFit: 'contain', cursor: 'pointer' }} 
            onClick={() => navigate('/dashboard')}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button 
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              style={{
                width: 32, height: 32, minWidth: 32, padding: 0,
                borderRadius: '50%', background: 'rgba(37,99,235,0.08)',
                color: 'var(--primary)', boxShadow: 'none'
              }}
              title="More Features"
            >
              <Layers size={16} />
            </button>
            {user && <span className="user-badge" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>{user.name}</span>}
          </div>
        </header>
      )}

      {/* Quick Navigation Drawer */}
      {showQuickMenu && (
        <div className="modal-backdrop" onClick={() => setShowQuickMenu(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">More Modules</h3>
              <button className="btn-close-modal" onClick={() => setShowQuickMenu(false)}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '16px 20px 28px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div 
                className="card" 
                style={{ padding: '14px', marginBottom: 0, cursor: 'pointer', textAlign: 'center' }}
                onClick={() => { navigate('/accounts'); setShowQuickMenu(false); }}
              >
                <Building2 size={24} color="#2563eb" style={{ margin: '0 auto 6px' }} />
                <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>Accounts & Balances</p>
              </div>

              <div 
                className="card" 
                style={{ padding: '14px', marginBottom: 0, cursor: 'pointer', textAlign: 'center' }}
                onClick={() => { navigate('/subscriptions'); setShowQuickMenu(false); }}
              >
                <Repeat size={24} color="#06b6d4" style={{ margin: '0 auto 6px' }} />
                <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>Subscriptions & Bills</p>
              </div>

              <div 
                className="card" 
                style={{ padding: '14px', marginBottom: 0, cursor: 'pointer', textAlign: 'center' }}
                onClick={() => { navigate('/budgets'); setShowQuickMenu(false); }}
              >
                <Layers size={24} color="#f59e0b" style={{ margin: '0 auto 6px' }} />
                <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>Category Budgets</p>
              </div>

              <div 
                className="card" 
                style={{ padding: '14px', marginBottom: 0, cursor: 'pointer', textAlign: 'center' }}
                onClick={() => { navigate('/investments'); setShowQuickMenu(false); }}
              >
                <PiggyBank size={24} color="#10b981" style={{ margin: '0 auto 6px' }} />
                <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>Investments & Debts</p>
              </div>

              <div 
                className="card" 
                style={{ padding: '14px', marginBottom: 0, cursor: 'pointer', textAlign: 'center', gridColumn: 'span 2' }}
                onClick={() => { navigate('/reports'); setShowQuickMenu(false); }}
              >
                <FileText size={24} color="#8b5cf6" style={{ margin: '0 auto 6px' }} />
                <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>Statements & PDF Reports</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className={!isShellHidden ? 'app-main pb-20' : ''}>
        <Routes>
          <Route path="/" element={<SplashView />} />
          <Route path="/login" element={<AuthView />} />

          <Route path="/onboarding" element={
            <ProtectedRoute requireOnboarding={false}>
              <OnboardingChat />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard userId={user?.id} />
            </ProtectedRoute>
          } />

          <Route path="/transactions" element={
            <ProtectedRoute>
              <LogView userId={user?.id} />
            </ProtectedRoute>
          } />

          <Route path="/subscriptions" element={
            <ProtectedRoute>
              <SubscriptionsView userId={user?.id} />
            </ProtectedRoute>
          } />

          <Route path="/accounts" element={
            <ProtectedRoute>
              <AccountsView userId={user?.id} />
            </ProtectedRoute>
          } />

          <Route path="/budgets" element={
            <ProtectedRoute>
              <BudgetsView userId={user?.id} />
            </ProtectedRoute>
          } />

          <Route path="/investments" element={
            <ProtectedRoute>
              <InvestmentsAndDebtView userId={user?.id} />
            </ProtectedRoute>
          } />

          <Route path="/reports" element={
            <ProtectedRoute>
              <ReportsView userId={user?.id} />
            </ProtectedRoute>
          } />

          <Route path="/goals" element={
            <ProtectedRoute>
              <GoalsView userId={user?.id} />
            </ProtectedRoute>
          } />

          <Route path="/category/:subcat" element={
            <ProtectedRoute>
              <CategoryDetailView userId={user?.id} />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfileView />
            </ProtectedRoute>
          } />

          {/* Legacy /log redirect */}
          <Route path="/log" element={<Navigate to="/transactions" />} />
        </Routes>
      </main>

      {/* Floating AI Chat Button */}
      {!isShellHidden && !showChat && (
        <button
          className="floating-ai-btn"
          onClick={() => setShowChat(true)}
          title="Open AI Advisor"
        >
          <Bot size={24} />
        </button>
      )}

      {/* Full-screen Chat Overlay */}
      {showChat && (
        <div className="chat-overlay">
          <div className="chat-overlay-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Bot size={20} color="var(--primary)" />
              <h3 style={{ color: 'var(--text-main)' }}>AI Advisor</h3>
            </div>
            <button className="btn-close-overlay" onClick={() => setShowChat(false)}>
              <X size={18} />
            </button>
          </div>
          <ChatView userId={user?.id} />
        </div>
      )}

      {!isShellHidden && <BottomNav />}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
