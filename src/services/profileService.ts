import type { User } from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import type { PendingRegistration, ProfileFormValues } from '../types/user'

export interface ProfilePayload {
  name: string
  email: string
  mobileNumber: string
  username: string
}

export interface SavedProfile {
  uid: string
  name: string
  email: string
  mobileNumber: string
  username: string
  createdAt?: unknown
  updatedAt?: unknown
}

export function buildProfileDefaults({
  user,
  transientRegistration,
  routeState,
  savedProfile,
}: {
  user: { displayName?: string | null; email?: string | null; uid?: string } | null
  transientRegistration?: PendingRegistration | null
  routeState?: PendingRegistration | null
  savedProfile?: SavedProfile | null
}): ProfileFormValues {
  const pendingRegistration = routeState ?? transientRegistration

  return {
    name: pendingRegistration?.name ?? savedProfile?.name ?? user?.displayName ?? '',
    password: pendingRegistration?.password ?? '',
    mobileNumber: savedProfile?.mobileNumber ?? '',
    username: savedProfile?.username ?? '',
    email: pendingRegistration?.email ?? savedProfile?.email ?? user?.email ?? '',
  }
}

function requireCurrentUser(user: User): User {
  const currentUser = auth.currentUser

  if (!currentUser) {
    throw Object.assign(new Error('Authentication is required to access a profile.'), {
      code: 'auth/unauthenticated',
    })
  }

  if (currentUser.uid !== user.uid) {
    throw Object.assign(new Error('The signed-in user does not own this profile.'), {
      code: 'firestore/permission-denied',
    })
  }

  return currentUser
}

export async function getProfile(user: User): Promise<SavedProfile | null> {
  const currentUser = requireCurrentUser(user)
  const profileRef = doc(db, 'profiles', currentUser.uid)
  const snapshot = await getDoc(profileRef)

  if (!snapshot.exists()) {
    return null
  }

  const data = snapshot.data() as Partial<SavedProfile>

  return {
    uid: data.uid ?? currentUser.uid,
    name: String(data.name ?? ''),
    email: String(data.email ?? ''),
    mobileNumber: String(data.mobileNumber ?? ''),
    username: String(data.username ?? ''),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  }
}

export async function saveProfile(user: User, profile: ProfilePayload): Promise<void> {
  try {
    const currentUser = requireCurrentUser(user)
    const profileRef = doc(db, 'profiles', currentUser.uid)
    const existingProfile = await getDoc(profileRef)
    const profileData = {
      uid: currentUser.uid,
      name: profile.name.trim(),
      email: profile.email.trim(),
      mobileNumber: profile.mobileNumber.trim(),
      username: profile.username.trim(),
    }

    if (existingProfile.exists()) {
      await setDoc(
        profileRef,
        {
          ...profileData,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
      return
    }

    await setDoc(profileRef, {
      ...profileData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Profile save failed', {
        operation: 'save',
        projectId: db.app.options.projectId ?? 'missing',
        code:
          typeof error === 'object' && error !== null && 'code' in error
            ? String(error.code)
            : 'unknown',
      })
    }
    throw error
  }
}
