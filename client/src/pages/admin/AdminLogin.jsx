import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Footer from '../../components/common/Footer'

export default function AdminLogin() {
  const navigate = useNavigate()
  const { login, logout, user } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // If already logged in as admin, redirect to admin dashboard
  if (user && user.role === 'admin') {
    navigate('/admin/dashboard', { replace: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const loggedUser = await login(email.trim(), password)
      if (loggedUser?.role !== 'admin') {
        logout()
        setError('Access denied. This console is restricted to designated campus administrators and security officers.')
        return
      }
      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed. Please verify administrative credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      {/* Institutional Top Bar */}
      <header className="border-b border-rule bg-surface py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center border border-bark bg-bark text-xs font-bold text-surface">
              LF
            </span>
            <div className="flex flex-col">
              <span className="font-display text-sm font-semibold tracking-tight text-ink">
                Administrative Terminal
              </span>
              <span className="text-[10px] tracking-wider uppercase text-quiet">
                Campus Security & Property Registry
              </span>
            </div>
          </Link>

          <Link
            to="/login"
            className="text-xs font-semibold uppercase tracking-wider text-quiet hover:text-ink"
          >
            Student/Staff Portal &rarr;
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="border border-rule bg-surface p-8 sm:p-10 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="border-b border-rule pb-5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-lake-deep font-semibold">
                Authorized Personnel Only
              </span>
              <h1 className="mt-1 font-display text-2xl font-medium tracking-tight text-ink">
                Admin Console Access
              </h1>
              <p className="mt-1 text-xs text-quiet">
                Sign in with institutional administrative privileges to moderate registry items, approve custody claims, and oversee operations.
              </p>
            </div>

            {error && (
              <div className="mt-6 border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="adminEmail"
                  className="block text-xs font-semibold uppercase tracking-wider text-bark"
                >
                  Administrative Email
                </label>
                <input
                  id="adminEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@college.edu"
                  required
                  autoComplete="email"
                  className="mt-1.5 w-full border border-rule bg-surface px-3 py-2 text-xs font-sans text-ink placeholder-quiet focus:border-lake focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="adminPassword"
                  className="block text-xs font-semibold uppercase tracking-wider text-bark"
                >
                  Console Password
                </label>
                <input
                  id="adminPassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  className="mt-1.5 w-full border border-rule bg-surface px-3 py-2 text-xs font-sans text-ink placeholder-quiet focus:border-lake focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full border border-bark bg-bark py-2.5 text-xs font-semibold uppercase tracking-wider text-surface transition-colors hover:bg-lake-deep disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : 'Enter Admin Console'}
                </button>
              </div>
            </form>

            {/* Quick Demo Helper Hint */}
            <div className="mt-6 border-t border-rule pt-4 text-[11px] text-quiet">
              <span className="font-semibold text-ink">Institutional Staff Hint:</span>
              <p className="mt-0.5">
                Default console test account: <code className="bg-paper px-1 py-0.5 font-mono text-[10px]">admin@college.edu</code> / <code className="bg-paper px-1 py-0.5 font-mono text-[10px]">Password123</code>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
