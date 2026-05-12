import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/query-keys'
import { authClient } from '@/shared/lib/client-auth'

export function useSession() {
  return useQuery({
    queryKey: queryKeys.session(),
    queryFn: async () => {
      const session = await authClient.getSession()
      return session
    },
  })
}
