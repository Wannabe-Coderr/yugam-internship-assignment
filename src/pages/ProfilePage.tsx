import { CheckCircle2, Eye, EyeOff, LogOut, ShieldCheck } from 'lucide-react'
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FormField } from '../components/FormField'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/firebase'
import {
  buildProfileDefaults,
  getProfile,
  saveProfile,
  type SavedProfile,
} from '../services/profileService'
import {
  formatFirebaseAuthError,
  validateProfileForm,
} from '../lib/validation'
import type { PendingRegistration, ProfileFormValues } from '../types/user'

export function ProfilePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, transientRegistration, clearTransientRegistration, logout } = useAuth()

  const routeState = (location.state ?? null) as PendingRegistration | null
  const [savedProfile, setSavedProfile] = useState<SavedProfile | null>(null)

  useEffect(() => {
    if (!user?.uid) {
      return
    }

    let isMounted = true

    getProfile(user)
      .then((profile) => {
        if (isMounted) {
          setSavedProfile(profile)
        }
      })
      .catch((error) => {
        if (import.meta.env.DEV) {
          console.error('Unable to load saved profile', {
            operation: 'read',
            projectId: db.app.options.projectId ?? 'missing',
            code:
              typeof error === 'object' && error !== null && 'code' in error
                ? String(error.code)
                : 'unknown',
          })
        }
        if (isMounted) {
          setSavedProfile(null)
        }
      })

    return () => {
      isMounted = false
    }
  }, [user])

  const defaultFormValues = useMemo(
    () =>
      buildProfileDefaults({
        user,
        transientRegistration,
        routeState,
        savedProfile,
      }),
    [user, transientRegistration, routeState, savedProfile],
  )

  const [formOverrides, setFormOverrides] = useState<{
    uid: string | undefined
    values: Partial<ProfileFormValues>
  }>(() => ({ uid: user?.uid, values: {} }))
  const formValues: ProfileFormValues = {
    ...defaultFormValues,
    ...(formOverrides.uid === user?.uid ? formOverrides.values : {}),
  }
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormValues, string>>>({})
  const [submitError, setSubmitError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange =
    (field: keyof ProfileFormValues) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target
      setFormOverrides((previous) => ({
        uid: user?.uid,
        values: {
          ...(previous.uid === user?.uid ? previous.values : {}),
          [field]: value,
        },
      }))
      setErrors((previous) => ({ ...previous, [field]: '' }))
      setSubmitError('')
      setSuccessMessage('')
    }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch {
      setSubmitError('Unable to log out right now. Please try again.')
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!user) {
      navigate('/login', { replace: true })
      return
    }

    const nextErrors = validateProfileForm(formValues)
    const hasErrors = Object.values(nextErrors).some(Boolean)
    setErrors(nextErrors)

    if (hasErrors) {
      setSuccessMessage('')
      return
    }

    setSubmitError('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      await saveProfile(user, {
        name: formValues.name.trim(),
        email: formValues.email.trim(),
        mobileNumber: formValues.mobileNumber.trim(),
        username: formValues.username.trim(),
      })

      clearTransientRegistration()
      setSuccessMessage('Profile validated and saved successfully.')
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
          <div className="headerRow">
            <div className="eyebrow">
              <ShieldCheck size={16} />
              Profile validation
            </div>
            <button type="button" className="secondaryButton small" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
          <h1>Complete your profile</h1>
          <p>
            Please review the prefilled details below and add the remaining required information.
          </p>
        </div>

        {submitError ? (
          <div className="statusBox error" role="alert">
            {submitError}
          </div>
        ) : null}

        {successMessage ? (
          <div className="statusBox success" role="status">
            <CheckCircle2 size={18} />
            {successMessage}
          </div>
        ) : null}

        <form className="authForm" onSubmit={handleSubmit} noValidate>
          <div className="formGrid">
            <FormField
              label="Name"
              name="name"
              type="text"
              value={formValues.name}
              onChange={handleChange('name')}
              error={errors.name}
              placeholder="Enter your full name"
            />

            <FormField
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formValues.password}
              onChange={handleChange('password')}
              error={errors.password}
              placeholder="Minimum 8 characters"
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

            <FormField
              label="Mobile Number"
              name="mobileNumber"
              type="tel"
              inputMode="numeric"
              value={formValues.mobileNumber}
              onChange={handleChange('mobileNumber')}
              error={errors.mobileNumber}
              placeholder="9876543210"
            />

            <FormField
              label="Username"
              name="username"
              type="text"
              value={formValues.username}
              onChange={handleChange('username')}
              error={errors.username}
              placeholder="atul_123"
            />

            <FormField
              label="Email"
              name="email"
              type="email"
              value={formValues.email}
              onChange={handleChange('email')}
              error={errors.email}
              placeholder="name@example.com"
            />
          </div>

          <button type="submit" className="primaryButton" disabled={isSubmitting}>
            {isSubmitting ? 'Validating profile...' : 'Validate'}
          </button>
        </form>
      </div>
    </div>
  )
}
