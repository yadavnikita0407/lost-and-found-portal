import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getNotifications, markAllRead } from '../../api/notificationsApi'
import { formatRelativeTime } from '../../utils/formatDate'

function BellIcon({ className = '' }) {
  return (
    <svg className={`h-5 w-5 shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  )
}

function UserIcon({ className = '' }) {
  return (
    <svg className={`h-5 w-5 shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function SignOutIcon({ className = '' }) {
  return (
    <svg className={`h-4 w-4 shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  )
}

function MenuIcon({ className = '' }) {
  return (
    <svg className={`h-5 w-5 shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

function CloseIcon({ className = '' }) {
  return (
    <svg className={`h-5 w-5 shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifMenuOpen, setNotifMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const userMenuRef = useRef(null)
  const notifMenuRef = useRef(null)

  // Fetch notifications
  useEffect(() => {
    if (!user) return
    let isMounted = true

    getNotifications()
      .then((res) => {
        if (!isMounted) return
        setNotifications(res.data || [])
        setUnreadCount(res.unreadCount || 0)
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [user, location.pathname])

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) {
        setNotifMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch {
      // noop
    }
  }

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Browse Registry', path: '/items' },
    { label: 'My Reports', path: '/my-reports' },
    { label: 'My Claims', path: '/my-claims' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="border-b border-rule bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        {/* Brand identity */}
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="flex items-baseline gap-2 font-display text-lg font-medium tracking-tight text-ink transition-colors hover:text-lake-deep"
          >
            <span>Lost &amp; Found</span>
            <span className="h-3.5 w-px bg-rule" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-wider text-quiet">
              Portal
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden items-center gap-1 md:flex ml-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  isActive(link.path)
                    ? 'border-b-2 border-bark text-ink'
                    : 'text-quiet hover:text-ink'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right utility actions */}
        <div className="flex items-center gap-3">
          {/* Action Button: Report */}
          <Link
            to="/report/lost"
            className="hidden sm:inline-flex bg-lake px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-lake-deep"
          >
            + Report Item
          </Link>

          {/* Notifications Popover */}
          <div className="relative" ref={notifMenuRef}>
            <button
              type="button"
              onClick={() => {
                setNotifMenuOpen((prev) => !prev)
                setUserMenuOpen(false)
              }}
              aria-label="View notifications"
              className="relative p-2 text-quiet transition-colors hover:text-ink focus:outline-none"
            >
              <BellIcon />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center bg-red-600 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notifMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-1 w-80 sm:w-96 border border-rule bg-surface p-0 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                <div className="flex items-center justify-between border-b border-rule bg-paper/60 px-4 py-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-xs text-lake-deep hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-72 divide-y divide-rule/60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-center text-xs text-quiet">
                      No notifications at this time.
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        className={`p-3 text-xs transition-colors hover:bg-paper/40 ${
                          !n.isRead ? 'bg-lake/5' : ''
                        }`}
                      >
                        <p className="text-ink font-medium leading-relaxed">
                          {n.message}
                        </p>
                        <p className="mt-1 text-[11px] text-quiet">
                          {formatRelativeTime(n.createdAt)}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-rule bg-paper/40 p-2 text-center">
                  <Link
                    to="/notifications"
                    onClick={() => setNotifMenuOpen(false)}
                    className="text-xs font-semibold text-lake-deep hover:underline"
                  >
                    View all notifications →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User profile menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => {
                setUserMenuOpen((prev) => !prev)
                setNotifMenuOpen(false)
              }}
              className="flex items-center gap-2 border border-rule bg-paper/60 px-2.5 py-1.5 text-xs text-ink transition-colors hover:bg-paper focus:outline-none"
            >
              <UserIcon className="h-4 w-4 text-quiet" />
              <span className="hidden font-medium sm:inline-block max-w-[120px] truncate">
                {user?.name || 'Account'}
              </span>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-1 w-64 border border-rule bg-surface p-0 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                <div className="border-b border-rule bg-paper/40 p-4">
                  <p className="font-semibold text-ink text-sm truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-quiet truncate">{user?.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="border border-rule bg-surface px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-lake-deep">
                      {user?.role || 'STUDENT'}
                    </span>
                    {user?.prn && (
                      <span className="text-[11px] font-mono text-quiet">
                        PRN: {user.prn}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-1">
                  <Link
                    to="/my-reports"
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-3 py-2 text-xs text-ink hover:bg-paper"
                  >
                    My Reported Items
                  </Link>
                  <Link
                    to="/my-claims"
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-3 py-2 text-xs text-ink hover:bg-paper"
                  >
                    My Ownership Claims
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-3 py-2 text-xs font-semibold text-lake-deep hover:bg-paper"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-700 hover:bg-red-50"
                  >
                    <SignOutIcon />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="p-2 text-quiet hover:text-ink md:hidden focus:outline-none"
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-rule bg-surface px-6 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 text-xs font-semibold uppercase tracking-wider ${
                  isActive(link.path) ? 'text-lake-deep font-bold' : 'text-quiet'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/report/lost"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 block bg-lake py-2 text-center text-xs font-semibold uppercase tracking-wider text-white"
            >
              + Report Item
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
