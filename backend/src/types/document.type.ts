import { Background, Board, Card, List, User } from '~/models'

export interface GetBoardDocument extends Omit<Board, 'ownerIds' | 'memberIds'> {
  lists: List[]
  cards: Card[]
  background: Background
  owners: Omit<User, 'password'>[]
  members: Omit<User, 'password'>[]
}

export interface BoardListDocument extends Omit<Board, 'backgroundId'> {
  background: Background
}

export interface ListDocument extends List {
  cards: Card[]
}

export interface CardDetailDocument extends Omit<Card, 'memberIds'> {
  members: User[]
}
