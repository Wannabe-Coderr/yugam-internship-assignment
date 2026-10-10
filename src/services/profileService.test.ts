import { describe, expect, it } from 'vitest'
import { buildProfileDefaults } from './profileService'

describe('profile defaults', () => {
  it('prefills registration data for the immediate registration flow', () => {
    const values = buildProfileDefaults({
      user: { uid: 'user-1', displayName: 'New User', email: 'new@example.com' },
      transientRegistration: {
        name: 'New User',
        email: 'new@example.com',
        password: 'Password123',
      },
    })

    expect(values).toEqual({
      name: 'New User',
      password: 'Password123',
      mobileNumber: '',
      username: '',
      email: 'new@example.com',
    })
  })

  it('uses saved profile values for returning users without restoring a password', () => {
    const values = buildProfileDefaults({
      user: { uid: 'user-1', displayName: 'Saved Name', email: 'saved@example.com' },
      savedProfile: {
        uid: 'user-1',
        name: 'Saved Name',
        email: 'saved@example.com',
        mobileNumber: '9876543210',
        username: 'saved_user',
      },
    })

    expect(values).toEqual({
      name: 'Saved Name',
      password: '',
      mobileNumber: '9876543210',
      username: 'saved_user',
      email: 'saved@example.com',
    })
  })
})
