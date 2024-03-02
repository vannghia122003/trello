import { User } from '.'

export interface Comment {
  _id: string
  cardId: string
  content: string
  createdAt: string
  updatedAt: string
  user: User
}

export interface CreateCommentData {
  content: string
}

export interface UpdateCommentData {
  content: string
}

export interface AddMemberData {
  memberId: string
}

export interface AddLabelData {
  labelId: string
}
