import { BoardStatus, DeleteType, Role } from '.'
import { ParamsDictionary } from 'express-serve-static-core'

export interface CreateBoardReqBody {
  title: string
  visibility: Visibility
  backgroundId: string
}

export interface BoardIdReqParams extends ParamsDictionary {
  boardId: string
}

export enum Visibility {
  Public = 'public',
  Private = 'private'
}

export interface UpdateBoardReqBody {
  title: string
  visibility: Visibility
  listOrderIds: string[]
  backgroundId: string
}

export interface MovingCardReqBody {
  cardId: string
  prevListId: string
  prevCardOrderIds: string[]
  nextListId: string
  nextCardOrderIds: string[]
}

export interface DeleteBoardReqQuery {
  deleteType: DeleteType
}

export interface GetBoardsReqQuery {
  status: BoardStatus
}

export interface InviteUsersReqBody {
  userIds: string[]
}

export interface MemberIdReqParams {
  memberId: string
}

export interface UpdateMemberReqBody {
  role: Role
}

export interface CreateLabelReqBody {
  title: string
  name: string
  hex: string
}

export interface UpdateLabelReqBody {
  title: string
  hex: string
}

export interface LabelIdReqParams {
  labelId: string
}
