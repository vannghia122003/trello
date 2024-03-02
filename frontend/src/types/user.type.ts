export interface User {
  _id: string
  email: string
  username: string
  fullName: string
  avatar: string
  createdAt: string
  updatedAt: string
}

export interface GetUsersParams {
  q?: string
}

export interface UpdateMeData {
  username: string
  fullName: string
  avatar: string
}

export interface ChangePasswordData {
  oldPassword: string
  newPassword: string
}
