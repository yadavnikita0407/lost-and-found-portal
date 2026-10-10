import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { validateLoginForm } from '../utils/validators'
import Footer from '../components/common/Footer'
import campusImage from '../assets/campus.jpg'

function Spinner({ className = 'h-4 w-4' }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
  )
}

function EyeIcon({ className = 'h-4 w-4' }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  )
}

function EyeOffIcon({ className = 'h-4 w-4' }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
      />
    </svg>
  )
}

function InstitutionalSeal() {
  return (
    <svg
      className="h-10 w-10 text-white/80"
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <rect x="4" y="4" width="32" height="32" stroke="currentColor" />
      <path d="M4 20h32M20 4v32" stroke="currentColor" strokeOpacity="0.4" />
      <circle cx="20" cy="20" r="9" stroke="currentColor" />
      <path
        d="M16 20l2.5 2.5L24 17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Login() {
  const { login, isLoading, user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState(() => {
    const savedEmail =
      typeof window !== 'undefined'
        ? localStorage.getItem('remembered_email')
        : null
    return {
      email: savedEmail || '',
      password: '',
      rememberEmail: Boolean(savedEmail),
    }
  })
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [touched, setTouched] = useState({})

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard', {
        replace: true,
      })
    }
  }, [user, navigate])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const val = type === 'checkbox' ? checked : value
    setForm((prev) => ({ ...prev, [name]: val }))

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))

    const { errors } = validateLoginForm(form)
    if (errors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: errors[name] }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const { errors, isValid } = validateLoginForm(form)
    if (!isValid) {
      setFieldErrors(errors)
      setTouched({ email: true, password: true })
      return
    }

    setSubmitting(true)
    try {
      if (form.rememberEmail) {
        localStorage.setItem('remembered_email', form.email.trim())
      } else {
        localStorage.removeItem('remembered_email')
      }

      const data = await login({
        email: form.email.trim(),
        password: form.password,
      })

      navigate(
        data.user.role === 'admin' ? '/admin/dashboard' : '/dashboard',
        { replace: true },
      )
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setSubmitting(false)
    }
  }

  const busy = submitting || isLoading

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      {/* ── Top Header Navigation ────────────────────────────────────────── */}
      <nav className="border-b border-rule bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="font-display text-lg font-medium tracking-tight text-ink transition-colors hover:text-lake-deep"
            >
              Lost &amp; Found
            </Link>
            <span
              className="hidden h-4 w-px bg-rule sm:inline-block"
              aria-hidden="true"
            />
            <span className="hidden text-xs font-semibold uppercase tracking-wider text-quiet sm:inline-block">
              Campus Portal
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <Link
              to="/"
              className="text-quiet transition-colors hover:text-ink"
            >
              Back to overview
            </Link>
            <Link
              to="/register"
              className="border border-bark px-3.5 py-1.5 font-semibold text-bark transition-colors hover:bg-bark hover:text-white"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Main Two-Column Layout ───────────────────────────────────────── */}
      <main className="flex-1">
        <div className="mx-auto grid min-h-[calc(100svh-12rem)] max-w-6xl lg:grid-cols-12">
          {/* Institutional Panel (Desktop Left Column) */}
          <aside className="relative flex flex-col justify-between overflow-hidden bg-bark px-8 py-12 text-paper sm:px-12 lg:col-span-5">
            <img
              src={campusImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center opacity-30"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 bg-bark/85"
              aria-hidden="true"
            />

            <div className="relative z-10">
              <InstitutionalSeal />
              <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                Authorized Access
              </p>
              <h2 className="mt-3 font-display text-2xl font-medium tracking-tight text-white sm:text-3xl">
                Campus property registry and claim management.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-paper/80">
                Sign in with your verified college credentials to report lost
                belongings, search found items, or track pending ownership
                claims under administrative supervision.
              </p>

              <div className="mt-8 border-t border-white/15 pt-6">
                <dl className="space-y-4 text-xs leading-relaxed text-paper/75">
                  <div>
                    <dt className="font-semibold text-white">
                      Institutional Directory
                    </dt>
                    <dd className="mt-0.5">
                      Access is restricted to currently enrolled students and
                      verified staff on the official college roll.
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-white">
                      Physical Custody
                    </dt>
                    <dd className="mt-0.5">
                      Found property is held securely at the central campus desk
                      until claims are formally verified.
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="relative z-10 mt-8 border-t border-white/15 pt-6 text-xs text-paper/60">
              <p>
                Inquiries regarding credential issues can be directed to the
                Campus Administrative Office.
              </p>
            </div>
          </aside>

          {/* Sign In Form (Right Column) */}
          <div className="flex items-center justify-center bg-paper px-6 py-12 sm:px-12 lg:col-span-7">
            <div className="w-full max-w-md border border-rule bg-surface p-8 sm:p-10">
              {/* Form Header */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lake-deep">
                  Authentication
                </p>
                <h1 className="mt-2 font-display text-2xl font-medium tracking-tight text-ink sm:text-3xl">
                  Sign in to your account
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-quiet">
                  Enter your registered institutional email and password to
                  continue.
                </p>
              </div>

              {/* Error Message Box */}
              {error && (
                <div
                  role="alert"
                  className="mt-6 border-l-4 border-red-700 bg-red-50 p-4 text-sm text-red-900"
                >
                  <div className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-red-700"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-9.25a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 6a.875.875 0 100-1.75.875.875 0 000 1.75z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <p className="font-semibold text-red-900">
                        Unable to sign in
                      </p>
                      <p className="mt-0.5 text-xs text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form
                id="login-form"
                onSubmit={handleSubmit}
                noValidate
                className="mt-6 flex flex-col gap-5"
              >
                {/* Email Address */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="email"
                      className="text-xs font-semibold uppercase tracking-wider text-ink"
                    >
                      College Email
                      <span className="ml-1 text-lake-deep" aria-hidden="true">
                        *
                      </span>
                    </label>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="email"
                    required
                    placeholder="student@college.edu"
                    disabled={busy}
                    aria-invalid={
                      touched.email && Boolean(fieldErrors.email)
                    }
                    aria-describedby={
                      fieldErrors.email ? 'email-error' : undefined
                    }
                    className={`w-full border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-quiet/50 transition-colors focus:outline-none focus:ring-1 ${
                      touched.email && fieldErrors.email
                        ? 'border-red-600 focus:border-red-600 focus:ring-red-600/20'
                        : 'border-rule focus:border-lake focus:ring-lake/30'
                    }`}
                  />
                  {touched.email && fieldErrors.email && (
                    <p id="email-error" className="text-xs text-red-700">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-xs font-semibold uppercase tracking-wider text-ink"
                    >
                      Password
                      <span className="ml-1 text-lake-deep" aria-hidden="true">
                        *
                      </span>
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      autoComplete="current-password"
                      required
                      placeholder="••••••••"
                      disabled={busy}
                      aria-invalid={
                        touched.password && Boolean(fieldErrors.password)
                      }
                      aria-describedby={
                        fieldErrors.password ? 'password-error' : undefined
                      }
                      className={`w-full border bg-surface px-3.5 py-2.5 pr-10 text-sm text-ink placeholder:text-quiet/50 transition-colors focus:outline-none focus:ring-1 ${
                        touched.password && fieldErrors.password
                          ? 'border-red-600 focus:border-red-600 focus:ring-red-600/20'
                          : 'border-rule focus:border-lake focus:ring-lake/30'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      tabIndex={-1}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-quiet transition-colors hover:text-ink focus:outline-none"
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {touched.password && fieldErrors.password && (
                    <p id="password-error" className="text-xs text-red-700">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                {/* Remember Email Option */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex cursor-pointer items-center gap-2 select-none">
                    <input
                      type="checkbox"
                      name="rememberEmail"
                      checked={form.rememberEmail}
                      onChange={handleChange}
                      disabled={busy}
                      className="h-4 w-4 rounded-none border-rule text-bark focus:ring-lake"
                    />
                    <span className="text-xs text-quiet">
                      Remember email on this browser
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  id="login-submit"
                  type="submit"
                  disabled={busy}
                  className="mt-2 flex w-full items-center justify-center gap-2 bg-bark px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? (
                    <>
                      <Spinner />
                      <span>Authenticating…</span>
                    </>
                  ) : (
                    <span>Sign in to Portal</span>
                  )}
                </button>
              </form>

              {/* Registration Link */}
              <div className="mt-8 border-t border-rule pt-6 text-center text-sm text-quiet">
                New to the campus portal?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-lake-deep underline-offset-4 hover:underline"
                >
                  Register here
                </Link>
              </div>

              {/* Administrative Hint */}
              <div className="mt-4 border-t border-rule/60 pt-4 text-center">
                <p className="text-xs text-quiet/80">
                  Duty officer or administrator?{' '}
                  <Link
                    to="/admin/login"
                    className="font-medium text-quiet underline underline-offset-4 hover:text-ink"
                  >
                    Go to Admin Portal
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <Footer />
    </div>
  )
}
