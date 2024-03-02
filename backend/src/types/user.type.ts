export interface GetUsersReqQuery {
  q?: string
}

export interface UpdateMeReqBody {
  username: string
  fullName: string
  avatar: string
}

export interface ChangePasswordReqBody {
  oldPassword: string
  newPassword: string
}
