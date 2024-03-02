import { useMutation, useQueryClient } from '@tanstack/react-query'
import cardApi from '~/api/card.api'
import { QUERY_KEYS } from '~/utils/constants'

function useUpdateCard(cardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cardApi.updateCard,
    onSuccess() {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOARD] }),
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CARD, cardId] })
      ])
    }
  })
}
export default useUpdateCard
