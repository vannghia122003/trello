export interface List {
  _id: string
  boardId: string
  title: string
  cardOrderIds: string[]
  createdAt: string
  updatedAt: string
  _deleted: boolean
}

export interface CreateListData {
  title: string
  boardId: string
}

export interface UpdateListData {
  title: string
  boardId: string
  cardOrderIds: string[]
}

export interface GetListsParams {
  boardId: string
  status: 'open' | 'closed'
}
export interface DeleteListParams {
  deleteType: 'soft' | 'hard'
}
