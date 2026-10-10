import { Eye, EyeOff, LogIn } from 'lucide-react'
import { type ChangeEvent, type FormEvent, useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { Link, useNavigate } from 'react-router-dom'
import { FormField } from '../components/FormField'
import { useAuth } from '../contexts/AuthContext'
import { auth } from '../lib/firebase'
import { formatFirebaseAuthError, validateLoginForm } from '../lib/validation'
import type { LoginFormValues } from '../types/user'

const initialFormValues: LoginFormValues = {
  email: '',
  password: '',
}

export function LoginPage() {
  const navigate = useNavigate()
  const { clearTransientRegistration } = useAuth()

  const [formValues, setFormValues] = useState<LoginFormValues>(initialFormValues)
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormValues, string>>>({})
  const [submitError, setSubmitError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange =
    (field: keyof LoginFormValues) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target
      setFormValues((previous) => ({ ...previous, [field]: value }))
      setErrors((previous) => ({ ...previous, [field]: '' }))
      setSubmitError('')
    }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors = validateLoginForm(formValues)
    const hasErrors = Object.values(nextErrors).some(Boolean)
    setErrors(nextErrors)

    if (hasErrors) {
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      await signInWithEmailAndPassword(auth, formValues.email.trim(), formValues.password)
      clearTransientRegistration()
      navigate('/profile', { replace: true })
    } catch (error) {
      setSubmitError(formatFirebaseAuthError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pageShell">
      <div className="pageCard">
        <div className="pageHeader">
          <div className="eyebrow">
            <LogIn size={16} />
            Welcome back
          </div>
          <h1>Sign in to your account</h1>
          <p>Access your internship profile and continue your validation.</p>
        </div>

        <form className="authForm" onSubmit={handleSubmit} noValidate>
          <FormField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={formValues.email}
            onChange={handleChange('email')}
            error={errors.email}
            placeholder="name@example.com"
          />

          <FormField
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={formValues.password}
            onChange={handleChange('password')}
            error={errors.password}
            placeholder="Enter your password"
            action={
              <button
                type="button"
                className="passwordToggle"
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />

          {submitError ? (
            <div className="statusBox error" role="alert">
              {submitError}
            </div>
          ) : null}

          <button type="submit" className="primaryButton" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="authSwitch">
          New here?{' '}
          <Link to="/register" className="linkButton">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
