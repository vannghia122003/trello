import { User } from '~/types'

export const LocalStorageEventTarget = new EventTarget()

export const setAccessTokenToLocalStorage = (accessToken: string) => {
  localStorage.setItem('accessToken', accessToken)
}

export const setRefreshTokenToLocalStorage = (refreshToken: string) => {
  localStorage.setItem('refreshToken', refreshToken)
}

export const clearLocalStorage = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('profile')
  const clearLocalStorageEvent = new Event('clearLocalStorage')
  LocalStorageEventTarget.dispatchEvent(clearLocalStorageEvent)
}

export const getAccessTokenFromLocalStorage = () => localStorage.getItem('accessToken') || ''
export const getRefreshTokenFromLocalStorage = () => localStorage.getItem('refreshToken') || ''

export const setProfileToLocalStorage = (profile: User) => {
  localStorage.setItem('profile', JSON.stringify(profile))
}

export const getProfileFromLocalStorage = (): User | null => {
  const result = localStorage.getItem('profile')
  return result ? JSON.parse(result) : null
}
