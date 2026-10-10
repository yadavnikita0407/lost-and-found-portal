import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { validateRegisterForm } from '../utils/validators'
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

function CheckmarkIcon({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  )
}

const INITIAL_FORM = {
  name: '',
  prn: '',
  email: '',
  mobile: '',
  password: '',
  confirmPassword: '',
}

export default function Register() {
  const { register, isLoading, user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState(INITIAL_FORM)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
    const { name, value } = e.target
    const updatedValue = name === 'prn' ? value.toUpperCase() : value
    setForm((prev) => ({ ...prev, [name]: updatedValue }))

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))

    const { errors } = validateRegisterForm(form)
    if (errors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: errors[name] }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const { errors, isValid } = validateRegisterForm(form)
    if (!isValid) {
      setFieldErrors(errors)
      setTouched({
        name: true,
        prn: true,
        email: true,
        mobile: true,
        password: true,
        confirmPassword: true,
      })
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        name: form.name.trim(),
        prn: form.prn.trim().toUpperCase(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      }

      // Only attach mobile if entered to avoid triggering express-validator optional regex on empty string
      if (form.mobile && form.mobile.trim()) {
        payload.mobile = form.mobile.trim()
      }

      await register(payload)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(
        err.message ||
          'Registration failed. Please check your credentials against the college directory.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const busy = submitting || isLoading

  const hasMinLength = form.password.length >= 6
  const passwordsMatch =
    form.confirmPassword.length > 0 && form.password === form.confirmPassword

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
              to="/login"
              className="border border-bark px-3.5 py-1.5 font-semibold text-bark transition-colors hover:bg-bark hover:text-white"
            >
              Sign in
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
                Directory Verification
              </p>
              <h2 className="mt-3 font-display text-2xl font-medium tracking-tight text-white sm:text-3xl">
                Restricted to authorized college members.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-paper/80">
                To prevent false reports and safeguard personal belongings,
                every registration is validated against the official college
                database.
              </p>

              <div className="mt-8 border-t border-white/15 pt-6">
                <dl className="space-y-4 text-xs leading-relaxed text-paper/75">
                  <div>
                    <dt className="font-semibold text-white">
                      Permanent Registration Number (PRN)
                    </dt>
                    <dd className="mt-0.5">
                      Your university PRN uniquely confirms your enrolled status
                      or staff appointment.
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-white">
                      Matching College Email
                    </dt>
                    <dd className="mt-0.5">
                      The email entered must match the address in the registered
                      student or staff record.
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-white">
                      Instant Account Activation
                    </dt>
                    <dd className="mt-0.5">
                      Once verified against the authorized list, your account is
                      immediately enabled to file reports and claims.
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="relative z-10 mt-8 border-t border-white/15 pt-6 text-xs text-paper/60">
              <p>
                Not found in the roster? Contact the College Examination Cell
                or Student Affairs Desk with your college ID card.
              </p>
            </div>
          </aside>

          {/* Registration Form (Right Column) */}
          <div className="flex items-center justify-center bg-paper px-6 py-12 sm:px-12 lg:col-span-7">
            <div className="w-full max-w-xl border border-rule bg-surface p-8 sm:p-10">
              {/* Form Header */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lake-deep">
                  Registration
                </p>
                <h1 className="mt-2 font-display text-2xl font-medium tracking-tight text-ink sm:text-3xl">
                  Create campus account
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-quiet">
                  Enter your credentials below. Your PRN and email will be
                  checked against the authorized roster.
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
                        Registration could not be completed
                      </p>
                      <p className="mt-0.5 text-xs text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Registration Form */}
              <form
                id="register-form"
                onSubmit={handleSubmit}
                noValidate
                className="mt-6 flex flex-col gap-5"
              >
                {/* Row 1: Full Name & PRN */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="name"
                      className="text-xs font-semibold uppercase tracking-wider text-ink"
                    >
                      Full Name
                      <span className="ml-1 text-lake-deep" aria-hidden="true">
                        *
                      </span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      autoComplete="name"
                      required
                      placeholder="e.g., Rohit Patil"
                      disabled={busy}
                      aria-invalid={
                        touched.name && Boolean(fieldErrors.name)
                      }
                      aria-describedby={
                        fieldErrors.name ? 'name-error' : undefined
                      }
                      className={`w-full border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-quiet/50 transition-colors focus:outline-none focus:ring-1 ${
                        touched.name && fieldErrors.name
                          ? 'border-red-600 focus:border-red-600 focus:ring-red-600/20'
                          : 'border-rule focus:border-lake focus:ring-lake/30'
                      }`}
                    />
                    {touched.name && fieldErrors.name ? (
                      <p id="name-error" className="text-xs text-red-700">
                        {fieldErrors.name}
                      </p>
                    ) : (
                      <p className="text-xs text-quiet">
                        As printed on your college ID
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="prn"
                      className="text-xs font-semibold uppercase tracking-wider text-ink"
                    >
                      PRN / Reg. Number
                      <span className="ml-1 text-lake-deep" aria-hidden="true">
                        *
                      </span>
                    </label>
                    <input
                      id="prn"
                      name="prn"
                      type="text"
                      value={form.prn}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      autoComplete="off"
                      required
                      placeholder="e.g., 21CS042"
                      disabled={busy}
                      aria-invalid={
                        touched.prn && Boolean(fieldErrors.prn)
                      }
                      aria-describedby={
                        fieldErrors.prn ? 'prn-error' : undefined
                      }
                      className={`w-full border bg-surface px-3.5 py-2.5 text-sm text-ink uppercase placeholder:text-quiet/50 placeholder:normal-case transition-colors focus:outline-none focus:ring-1 ${
                        touched.prn && fieldErrors.prn
                          ? 'border-red-600 focus:border-red-600 focus:ring-red-600/20'
                          : 'border-rule focus:border-lake focus:ring-lake/30'
                      }`}
                    />
                    {touched.prn && fieldErrors.prn ? (
                      <p id="prn-error" className="text-xs text-red-700">
                        {fieldErrors.prn}
                      </p>
                    ) : (
                      <p className="text-xs text-quiet">
                        Permanent registration number
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 2: College Email & Mobile */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="email"
                      className="text-xs font-semibold uppercase tracking-wider text-ink"
                    >
                      College Email
                      <span className="ml-1 text-lake-deep" aria-hidden="true">
                        *
                      </span>
                    </label>
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
                    {touched.email && fieldErrors.email ? (
                      <p id="email-error" className="text-xs text-red-700">
                        {fieldErrors.email}
                      </p>
                    ) : (
                      <p className="text-xs text-quiet">
                        Official email on record
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="mobile"
                      className="text-xs font-semibold uppercase tracking-wider text-ink"
                    >
                      Mobile Number
                      <span className="ml-1 text-xs font-normal normal-case text-quiet">
                        (optional)
                      </span>
                    </label>
                    <input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      value={form.mobile}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      autoComplete="tel"
                      placeholder="10-digit number"
                      disabled={busy}
                      aria-invalid={
                        touched.mobile && Boolean(fieldErrors.mobile)
                      }
                      aria-describedby={
                        fieldErrors.mobile ? 'mobile-error' : undefined
                      }
                      className={`w-full border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-quiet/50 transition-colors focus:outline-none focus:ring-1 ${
                        touched.mobile && fieldErrors.mobile
                          ? 'border-red-600 focus:border-red-600 focus:ring-red-600/20'
                          : 'border-rule focus:border-lake focus:ring-lake/30'
                      }`}
                    />
                    {touched.mobile && fieldErrors.mobile ? (
                      <p id="mobile-error" className="text-xs text-red-700">
                        {fieldErrors.mobile}
                      </p>
                    ) : (
                      <p className="text-xs text-quiet">
                        For SMS alerts during item claims
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 3: Password & Confirm Password */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="password"
                      className="text-xs font-semibold uppercase tracking-wider text-ink"
                    >
                      Password
                      <span className="ml-1 text-lake-deep" aria-hidden="true">
                        *
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        autoComplete="new-password"
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

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="confirmPassword"
                      className="text-xs font-semibold uppercase tracking-wider text-ink"
                    >
                      Confirm Password
                      <span className="ml-1 text-lake-deep" aria-hidden="true">
                        *
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={form.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        autoComplete="new-password"
                        required
                        placeholder="••••••••"
                        disabled={busy}
                        aria-invalid={
                          touched.confirmPassword &&
                          Boolean(fieldErrors.confirmPassword)
                        }
                        aria-describedby={
                          fieldErrors.confirmPassword
                            ? 'confirm-error'
                            : undefined
                        }
                        className={`w-full border bg-surface px-3.5 py-2.5 pr-10 text-sm text-ink placeholder:text-quiet/50 transition-colors focus:outline-none focus:ring-1 ${
                          touched.confirmPassword && fieldErrors.confirmPassword
                            ? 'border-red-600 focus:border-red-600 focus:ring-red-600/20'
                            : 'border-rule focus:border-lake focus:ring-lake/30'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        tabIndex={-1}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-quiet transition-colors hover:text-ink focus:outline-none"
                        aria-label={
                          showConfirmPassword
                            ? 'Hide password'
                            : 'Show password'
                        }
                      >
                        {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                    {touched.confirmPassword && fieldErrors.confirmPassword && (
                      <p id="confirm-error" className="text-xs text-red-700">
                        {fieldErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* Password Criteria Notice */}
                {form.password.length > 0 && (
                  <div className="border border-rule/70 bg-paper/60 p-3.5 text-xs">
                    <p className="font-semibold text-ink">
                      Password Requirements:
                    </p>
                    <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:gap-6">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`flex h-4 w-4 items-center justify-center ${
                            hasMinLength
                              ? 'bg-lake-deep text-white'
                              : 'bg-rule text-quiet'
                          }`}
                        >
                          {hasMinLength ? <CheckmarkIcon /> : null}
                        </span>
                        <span
                          className={
                            hasMinLength ? 'text-ink' : 'text-quiet'
                          }
                        >
                          At least 6 characters
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`flex h-4 w-4 items-center justify-center ${
                            passwordsMatch
                              ? 'bg-lake-deep text-white'
                              : 'bg-rule text-quiet'
                          }`}
                        >
                          {passwordsMatch ? <CheckmarkIcon /> : null}
                        </span>
                        <span
                          className={
                            passwordsMatch ? 'text-ink' : 'text-quiet'
                          }
                        >
                          Passwords match
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Terms / Verification Confirmation */}
                <p className="text-xs leading-relaxed text-quiet">
                  By registering, you confirm that you are an active college
                  member. False reporting or fraudulent ownership claims are
                  subject to disciplinary action under university rules.
                </p>

                {/* Submit Button */}
                <button
                  id="register-submit"
                  type="submit"
                  disabled={busy}
                  className="mt-2 flex w-full items-center justify-center gap-2 bg-bark px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? (
                    <>
                      <Spinner />
                      <span>Verifying credentials…</span>
                    </>
                  ) : (
                    <span>Verify &amp; Create Account</span>
                  )}
                </button>
              </form>

              {/* Sign In Link */}
              <div className="mt-8 border-t border-rule pt-6 text-center text-sm text-quiet">
                Already registered with the portal?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-lake-deep underline-offset-4 hover:underline"
                >
                  Sign in here
                </Link>
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
