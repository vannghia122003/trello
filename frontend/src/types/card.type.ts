import { Label, User } from '.'

export interface Card {
  _id: string
  listId: string
  title: string
  description: string
  cover: string
  labels: Label[]
  memberIds: string[]
  comments: string[]
  attachments: string[]
  createdAt: string
  updatedAt: string
  _deleted: boolean
  FE_PlaceholderCard?: boolean
}

export interface CardDetail extends Omit<Card, 'memberIds'> {
  members: User[]
}

export interface CreateCardData {
  boardId: string
  listId: string
  title: string
}

export interface UpdateCardData {
  title?: string
  cover?: string
  description?: string
}

export interface DeleteCardParams {
  deleteType: 'soft' | 'hard'
}

export interface GetCardsParams {
  boardId: string
  status: 'open' | 'closed'
}
