import type { LoginFormValues, ProfileFormValues, RegistrationFormValues } from '../types/user'

const NAME_REGEX = /^[A-Za-z]+(?: [A-Za-z]+)*$/
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).+$/
const MOBILE_REGEX = /^\d{10}$/
const USERNAME_REGEX = /^(?=.*[A-Za-z0-9])[A-Za-z0-9]+(?:[._-][A-Za-z0-9]+)?$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const MIN_PASSWORD_LENGTH = 8

export function validateRegistrationName(value: string): string {
  if (!value.trim()) {
    return 'Name is required.'
  }

  if (!NAME_REGEX.test(value.trim())) {
    return 'Use alphabetic characters only, with spaces between names.'
  }

  return ''
}

export function validateRegistrationEmail(value: string): string {
  const trimmed = value.trim()

  if (!trimmed) {
    return 'Email is required.'
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Enter a valid email address.'
  }

  return ''
}

export function validateRegistrationPassword(value: string): string {
  if (!value) {
    return 'Password is required.'
  }

  if (value.length < MIN_PASSWORD_LENGTH) {
    return 'Password must be at least 8 characters long.'
  }

  if (!PASSWORD_REGEX.test(value)) {
    return 'Password must include at least one letter and one number.'
  }

  return ''
}

export function validateProfileName(value: string): string {
  return validateRegistrationName(value)
}

export function validateProfilePassword(value: string): string {
  if (!value.trim()) {
    return 'Password is required.'
  }

  if (value.length < MIN_PASSWORD_LENGTH) {
    return 'Password must be at least 8 characters long.'
  }

  if (!PASSWORD_REGEX.test(value)) {
    return 'Password must include at least one letter and one number.'
  }

  return ''
}

export function validateProfileMobileNumber(value: string): string {
  const trimmed = value.trim()

  if (!trimmed) {
    return 'Mobile number is required.'
  }

  if (!MOBILE_REGEX.test(trimmed)) {
    return 'Enter exactly 10 digits with no spaces or country code.'
  }

  return ''
}

export function validateProfileUsername(value: string): string {
  const trimmed = value.trim()

  if (!trimmed) {
    return 'Username is required.'
  }

  if (!USERNAME_REGEX.test(trimmed)) {
    return 'Username can contain letters, numbers, and one optional . _ or - character.'
  }

  return ''
}

export function validateProfileEmail(value: string): string {
  return validateRegistrationEmail(value)
}

export function validateLoginEmail(value: string): string {
  return validateRegistrationEmail(value)
}

export function validateLoginPassword(value: string): string {
  if (!value.trim()) {
    return 'Password is required.'
  }

  return ''
}

export function validateRegistrationForm(values: RegistrationFormValues): Record<keyof RegistrationFormValues, string> {
  return {
    name: validateRegistrationName(values.name),
    email: validateRegistrationEmail(values.email),
    password: validateRegistrationPassword(values.password),
  }
}

export function validateLoginForm(values: LoginFormValues): Record<keyof LoginFormValues, string> {
  return {
    email: validateLoginEmail(values.email),
    password: validateLoginPassword(values.password),
  }
}

export function validateProfileForm(values: ProfileFormValues): Record<keyof ProfileFormValues, string> {
  return {
    name: validateProfileName(values.name),
    password: validateProfilePassword(values.password),
    mobileNumber: validateProfileMobileNumber(values.mobileNumber),
    username: validateProfileUsername(values.username),
    email: validateProfileEmail(values.email),
  }
}

export function formatFirebaseAuthError(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error ? String((error as { code?: string }).code) : ''
  const message = error instanceof Error ? error.message : String(error)
  const diagnostic = `${code} ${message}`.toLowerCase()

  if (diagnostic.includes('email-already-in-use')) {
    return 'An account already exists for this email.'
  }

  if (diagnostic.includes('weak-password')) {
    return 'Password is too weak. Use at least 8 characters with letters and numbers.'
  }

  if (diagnostic.includes('invalid-email')) {
    return 'Please enter a valid email address.'
  }

  if (diagnostic.includes('invalid-credential') || diagnostic.includes('wrong-password') || diagnostic.includes('user-not-found')) {
    return 'The email or password is incorrect.'
  }

  if (diagnostic.includes('user-disabled')) {
    return 'This account has been disabled. Please contact support.'
  }

  if (diagnostic.includes('network-request-failed') || diagnostic.includes('unavailable') || diagnostic.includes('timeout')) {
    return 'The network is unavailable right now. Please try again.'
  }

  if (diagnostic.includes('permission-denied')) {
    return 'Firestore denied access to this profile. Confirm that you are signed in, the profile document uses your Firebase UID, and the latest rules are published for the configured project.'
  }

  if (diagnostic.includes('unauthenticated')) {
    return 'Your session has expired. Please sign in again before saving your profile.'
  }

  if (diagnostic.includes('failed-precondition')) {
    return 'Firestore is not ready for this operation. Confirm that the default database exists and try again.'
  }

  if (diagnostic.includes('firestore/not-found') || diagnostic.includes('database (default)')) {
    return 'The configured Firestore database was not found. Create the default database in the Firebase project used by this app.'
  }

  if (diagnostic.includes('too-many-requests')) {
    return 'Too many attempts. Please wait a moment and try again.'
  }

  return 'Something went wrong. Please try again.'
}
