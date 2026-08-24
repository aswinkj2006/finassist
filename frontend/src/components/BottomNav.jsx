import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Receipt, Target, User } from 'lucide-react'
import './BottomNav.css'

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <LayoutDashboard className="icon" size={22} />
        <span className="label">Home</span>
      </NavLink>
      <NavLink to="/transactions" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <Receipt className="icon" size={22} />
        <span className="label">Transactions</span>
      </NavLink>
      <NavLink to="/goals" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <Target className="icon" size={22} />
        <span className="label">Goals</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <User className="icon" size={22} />
        <span className="label">Profile</span>
      </NavLink>
    </nav>
  )
}
