import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function ChartIcon({ className = '' }) {
  return (
    <svg className={`h-4 w-4 shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}

function DocumentIcon({ className = '' }) {
  return (
    <svg className={`h-4 w-4 shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function CheckCircleIcon({ className = '' }) {
  return (
    <svg className={`h-4 w-4 shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function UsersIcon({ className = '' }) {
  return (
    <svg className={`h-4 w-4 shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}

function ArrowLeftIcon({ className = '' }) {
  return (
    <svg className={`h-4 w-4 shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  )
}

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const links = [
    { label: 'Admin Overview', path: '/admin/dashboard', icon: ChartIcon },
    { label: 'Manage Reports', path: '/admin/reports', icon: DocumentIcon },
    { label: 'Review Claims', path: '/admin/claims', icon: CheckCircleIcon },
    { label: 'User Accounts', path: '/admin/users', icon: UsersIcon },
  ]

  const handleSignOut = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="w-full shrink-0 border-b border-rule bg-surface lg:w-64 lg:border-b-0 lg:border-r">
      <div className="flex flex-col justify-between h-full p-4 sm:p-6">
        <div>
          {/* Admin Header */}
          <div className="border-b border-rule pb-4 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-lake-deep">
              Administration
            </span>
            <h2 className="font-display text-lg font-medium text-ink mt-0.5">
              Admin Console
            </h2>
          </div>

          {/* Navigation links */}
          <nav className="flex flex-row flex-wrap gap-1 lg:flex-col" aria-label="Admin navigation">
            {links.map((link) => {
              const active = location.pathname === link.path
              const Icon = link.icon
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    active
                      ? 'bg-bark text-white'
                      : 'text-quiet hover:bg-paper hover:text-ink'
                  }`}
                >
                  <Icon className={active ? 'text-white' : 'text-quiet'} />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 border-t border-rule pt-4 flex flex-col gap-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-xs font-semibold text-lake-deep hover:underline"
          >
            <ArrowLeftIcon />
            <span>Return to Portal</span>
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="text-left text-xs font-semibold text-red-700 hover:underline pt-2"
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  )
}
