import { ChangePasswordData, GetUsersParams, SuccessResponse, UpdateMeData, User } from '~/types'
import axiosClient from './axiosClient'

const userApi = {
  getMe() {
    return axiosClient.get<undefined, SuccessResponse<User>>('/users/me')
  },

  updateMe(data: UpdateMeData) {
    return axiosClient.put<undefined, SuccessResponse<User>>('/users/me', data)
  },

  changePassword(data: ChangePasswordData) {
    return axiosClient.put<undefined, SuccessResponse<User>>('/users/change-password', data)
  },

  uploadImage(data: FormData) {
    return axiosClient.post<undefined, SuccessResponse<string[]>>('/users/upload-image', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  deleteImage(urlId: string) {
    return axiosClient.delete<undefined, SuccessResponse<undefined>>(`/users/delete-image/${urlId}`)
  },

  getUsers(params: GetUsersParams) {
    return axiosClient.get<undefined, SuccessResponse<User[]>>('/users', { params })
  }
}

export default userApi
