import { UseQueryOptions, useQuery } from '@tanstack/react-query'
import backgroundApi from '~/api/background.api'
import { Background, SuccessResponse } from '~/types'
import { QUERY_KEYS } from '~/utils/constants'

type UseBackgroundQueryOptions = Omit<UseQueryOptions<SuccessResponse<Background[]>>, 'queryKey' | 'queryFn'>

function useBackground(options: UseBackgroundQueryOptions) {
  return useQuery({
    ...options,
    queryKey: [QUERY_KEYS.BACKGROUND],
    queryFn: backgroundApi.getAllBackground
  })
}

export default useBackground
