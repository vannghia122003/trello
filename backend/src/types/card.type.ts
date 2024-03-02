import { CardStatus, DeleteType } from '.'

export interface CreateCardReqBody {
  boardId: string
  listId: string
  title: string
}

export interface CardIdReqParams {
  cardId: string
}

export interface DeleteCardReqQuery {
  deleteType: DeleteType
}

export interface UpdateCardReqBody {
  title?: string
  cover?: string
  description?: string
}

export interface GetCardsReqQuery {
  boardId: string
  status: CardStatus
}

export interface DeleteCardReqQuery {
  deleteType: DeleteType
}

export interface AddMemberReqBody {
  memberId: string
}

export interface AddLabelReqBody {
  labelId: string
}
