import { useMutation, useQueryClient } from '@tanstack/react-query'
import boardApi from '~/api/board.api'
import { QUERY_KEYS } from '~/utils/constants'

function useUpdateBoard(boardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: boardApi.updateBoard,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOARD, boardId] })
    }
  })
}

export default useUpdateBoard
