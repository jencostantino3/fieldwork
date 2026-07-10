import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Briefcase, ChevronDown, LogOut, User, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const [open, setOpen]     = useState(false)
  const [drop, setDrop]     = useState(false)
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  const navLinks = [
    { to: '/jobs',      label: 'Find Work' },
    { to: '/companies', label: 'Teams & Orgs' },
    { to: '/pricing',   label: 'Pricing' },
  ]

  return (
    <nav className="sticky top-0 z-40 bg-brand-navy shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-field rounded-md flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Field<span className="text-field-400">Work</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive ? 'text-field-400' : 'text-gray-300 hover:text-white'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDrop(!drop)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white"
                >
                  <div className="w-8 h-8 rounded-full bg-field-600 flex items-center justify-center text-white text-xs font-bold">
                    {(profile?.name || user.email || '?').charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {drop && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1">
                    {profile?.role === 'employer' && (
                      <Link
                        to="/dashboard"
                        onClick={() => setDrop(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setDrop(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={() => { setDrop(false); handleLogout() }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold bg-field text-white rounded-lg hover:bg-field-700 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 text-gray-300 hover:text-white"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-brand-900 border-t border-brand-800 px-4 pb-4">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block py-3 text-gray-300 hover:text-white font-medium"
            >
              {l.label}
            </NavLink>
          ))}
          {user ? (
            <>
              {profile?.role === 'employer' && (
                <Link to="/dashboard" onClick={() => setOpen(false)} className="block py-3 text-gray-300 hover:text-white font-medium">
                  Dashboard
                </Link>
              )}
              <Link to="/profile" onClick={() => setOpen(false)} className="block py-3 text-gray-300 hover:text-white font-medium">
                Profile
              </Link>
              <button onClick={handleLogout} className="block py-3 text-red-400 font-medium w-full text-left">
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/login" onClick={() => setOpen(false)} className="block py-3 text-gray-300 hover:text-white font-medium">
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className="block text-center py-3 bg-field text-white font-semibold rounded-lg"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
