import { Background, Card, List, User } from '.'

export enum Visibility {
  Public = 'public',
  Private = 'private'
}

export enum BoardStatus {
  Open = 'open',
  Closed = 'closed',
  Starred = 'starred'
}

export interface DeleteBoardParams {
  deleteType: 'soft' | 'hard'
}

export interface UpdateMemberData {
  role: 'admin' | 'member'
}

export interface Label {
  _id: string
  name: string
  title: string
  hex: string
}

export interface Board {
  _id: string
  title: string
  visibility: Visibility
  ownerId: string
  adminIds: string[]
  memberIds: string[]
  listOrderIds: string[]
  labels: Label[]
  createdAt: string
  updatedAt: string
  _deleted: boolean
  background: Background
}

export interface BoardDetail extends Omit<Board, 'memberIds' | 'adminIds'> {
  cards: Card[]
  lists: List[]
  admins: User[]
  members: User[]
}

export interface CreateBoardData {
  title: string
  visibility: Visibility
  backgroundId: string
}

export interface CreateBoardResponse extends Omit<Board, 'background'> {
  backgroundId: string
}

export interface UpdateBoardData {
  title: string
  listOrderIds: string[]
  visibility: Visibility
  backgroundId: string
}

export interface MovingCardData {
  cardId: string
  prevListId: string
  prevCardOrderIds: string[]
  nextListId: string
  nextCardOrderIds: string[]
}

export interface GetBoardsParams {
  status: BoardStatus
}

export interface CreateLabelData {
  name: string
  title: string
  hex: string
}

export interface UpdateLabelData {
  title: string
  hex: string
}
