import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { type ChangeEvent, type FormEvent, useState } from 'react'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { Link, useNavigate } from 'react-router-dom'
import { FormField } from '../components/FormField'
import { useAuth } from '../contexts/AuthContext'
import { auth } from '../lib/firebase'
import {
  formatFirebaseAuthError,
  validateRegistrationForm,
} from '../lib/validation'
import type { RegistrationFormValues } from '../types/user'

const initialFormValues: RegistrationFormValues = {
  name: '',
  email: '',
  password: '',
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { setTransientRegistration } = useAuth()

  const [formValues, setFormValues] = useState<RegistrationFormValues>(initialFormValues)
  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationFormValues, string>>>({})
  const [submitError, setSubmitError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange =
    (field: keyof RegistrationFormValues) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target
      setFormValues((previous) => ({ ...previous, [field]: value }))
      setErrors((previous) => ({ ...previous, [field]: '' }))
      setSubmitError('')
    }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors = validateRegistrationForm(formValues)
    const hasErrors = Object.values(nextErrors).some(Boolean)

    setErrors(nextErrors)

    if (hasErrors) {
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const trimmedName = formValues.name.trim()
      const trimmedEmail = formValues.email.trim()

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        trimmedEmail,
        formValues.password,
      )

      await updateProfile(userCredential.user, { displayName: trimmedName })

      const transientData = {
        name: trimmedName,
        email: trimmedEmail,
        password: formValues.password,
      }

      setTransientRegistration(transientData)
      navigate('/profile', { replace: true, state: transientData })
    } catch (error) {
      const message = formatFirebaseAuthError(error)
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pageShell">
      <div className="pageCard"> 
        <div className="pageHeader">
          <div className="eyebrow">
            <UserPlus size={16} />
            Internship registration
          </div>
          <h1>Create your account</h1>
          <p>Set up your profile to continue with verification.</p>
        </div>

        <form className="authForm" onSubmit={handleSubmit} noValidate>
          <FormField
            label="Name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Enter your full name"
            value={formValues.name}
            onChange={handleChange('name')}
            error={errors.name}
          />

          <FormField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={formValues.email}
            onChange={handleChange('email')}
            error={errors.email}
          />

          <FormField
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Minimum 8 characters"
            value={formValues.password}
            onChange={handleChange('password')}
            error={errors.password}
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
              <p>{submitError}</p>
              {submitError.includes('already exists') ? (
                <p>
                  <Link to="/login" className="linkButton">
                    Go to login
                  </Link>
                </p>
              ) : null}
            </div>
          ) : null}

          <button type="submit" className="primaryButton" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="authSwitch">
          Already have an account?{' '}
          <Link to="/login" className="linkButton">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
