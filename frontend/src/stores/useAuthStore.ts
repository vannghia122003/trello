import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { User } from '~/types'
import { getAccessTokenFromLocalStorage, getProfileFromLocalStorage } from '~/utils/auth'

interface State {
  isAuthenticated: boolean
  profile: User | null
}

interface Actions {
  setIsAuthenticated: (value: boolean) => void
  setProfile: (profile: User | null) => void
}

const useAuthStore = create<State & Actions>()(
  immer((set) => ({
    isAuthenticated: Boolean(getAccessTokenFromLocalStorage()),
    profile: getProfileFromLocalStorage(),
    setIsAuthenticated(value) {
      set((state) => {
        state.isAuthenticated = value
      })
    },
    setProfile(profile) {
      set((state) => {
        state.profile = profile
      })
    }
  }))
)

export default useAuthStore
