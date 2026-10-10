export interface RegistrationFormValues {
  name: string
  email: string
  password: string
}

export interface LoginFormValues {
  email: string
  password: string
}

export interface ProfileFormValues {
  name: string
  password: string
  mobileNumber: string
  username: string
  email: string
}

export interface PendingRegistration {
  name: string
  email: string
  password: string
}
