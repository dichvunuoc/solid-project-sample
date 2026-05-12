/**
 * Theme Store
 *
 * Example Zustand store for global client state management.
 *
 * Usage Guidelines:
 * - Use Zustand for: Global UI state (theme, sidebar, modals), client-side preferences
 * - Use TanStack Query for: Server state (API data, caching)
 * - Use Event Bus for: Cross-feature communication
 * - Use Local State for: Component-specific state
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface ThemeStore {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    set => ({
      theme: 'system',
      setTheme: theme => set({ theme }),
      toggleTheme: () =>
        set(state => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
    }),
    {
      name: 'theme-storage', // localStorage key
    }
  )
)
