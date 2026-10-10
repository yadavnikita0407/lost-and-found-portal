const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MOBILE_RE = /^[6-9]\d{9}$/

export function validateEmail(value) {
  const email = (value || '').trim()
  if (!email) return 'Email is required'
  if (!EMAIL_RE.test(email)) return 'Enter a valid email address'
  return ''
}

export function validatePassword(value, { min = 6 } = {}) {
  if (!value) return 'Password is required'
  if (value.length < min) return `Password must be at least ${min} characters`
  return ''
}

export function validateName(value) {
  const name = (value || '').trim()
  if (!name) return 'Full name is required'
  if (name.length < 2) return 'Enter your full name (minimum 2 characters)'
  return ''
}

export function validatePrn(value) {
  const prn = (value || '').trim()
  if (!prn) return 'PRN is required'
  if (!/^[A-Za-z0-9]+$/.test(prn)) return 'PRN must be alphanumeric without spaces or symbols'
  if (prn.length < 3 || prn.length > 20) return 'PRN must be between 3 and 20 characters'
  return ''
}

export function validateMobile(value) {
  const mobile = (value || '').trim()
  if (!mobile) return '' // Optional
  if (!MOBILE_RE.test(mobile)) return 'Enter a valid 10-digit mobile number'
  return ''
}

export function validateConfirmPassword(password, confirm) {
  if (!confirm) return 'Confirm your password'
  if (password !== confirm) return 'Passwords do not match'
  return ''
}

export function validateLoginForm({ email, password }) {
  const errors = {
    email: validateEmail(email),
    password: validatePassword(password, { min: 6 }),
  }
  return {
    errors,
    isValid: !Object.values(errors).some(Boolean),
  }
}

export function validateRegisterForm(values) {
  const errors = {
    name: validateName(values.name),
    prn: validatePrn(values.prn),
    email: validateEmail(values.email),
    mobile: validateMobile(values.mobile),
    password: validatePassword(values.password, { min: 6 }),
    confirmPassword: validateConfirmPassword(
      values.password,
      values.confirmPassword,
    ),
  }
  return {
    errors,
    isValid: !Object.values(errors).some(Boolean),
  }
}

