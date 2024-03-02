import { CreateListData, DeleteListParams, List, SuccessResponse, UpdateListData, GetListsParams } from '~/types'
import axiosClient from './axiosClient'

const listApi = {
  createList(data: CreateListData) {
    return axiosClient.post<undefined, SuccessResponse<List>>('/lists', data)
  },
  getLists(params: GetListsParams) {
    return axiosClient.get<undefined, SuccessResponse<List[]>>('/lists', { params })
  },
  updateList({ listId, data }: { listId: string; data: UpdateListData }) {
    return axiosClient.put(`/lists/${listId}`, data)
  },
  deleteList({ listId, params }: { listId: string; params: DeleteListParams }) {
    return axiosClient.delete(`/lists/${listId}`, { params })
  },
  reopenList(listId: string) {
    return axiosClient.put<undefined, SuccessResponse<undefined>>(`/lists/${listId}/reopen`)
  }
}

export default listApi
