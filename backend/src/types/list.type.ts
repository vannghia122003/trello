import { DeleteType, ListStatus } from '.'

export interface CreateListReqBody {
  boardId: string
  title: string
}

export interface ListIdReqParams {
  listId: string
}

export interface UpdateListReqBody {
  title: string
  boardId: string
  cardOrderIds: string[]
}

export interface DeleteListReqQuery {
  deleteType: DeleteType
}

export interface GetListReqQuery {
  boardId: string
  status: ListStatus
}
