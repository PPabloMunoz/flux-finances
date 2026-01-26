import { useQuery } from '@tanstack/react-query'
import { getUserPreferencesAction } from '@/features/auth'

export function useUserPreferences() {
  return useQuery({
    queryKey: ['user-preferences'],
    queryFn: async () => {
      const res = await getUserPreferencesAction()
      if (!res.ok) throw new Error(res.error)
      return res.data
    },
  })
}
