import { LoginData, RegisterData, SuccessResponse, TokenResponse } from '~/types'
import axiosClient from './axiosClient'

const authApi = {
  register(data: RegisterData) {
    return axiosClient.post<undefined, SuccessResponse<undefined>>('/auth/register', data)
  },
  login(data: LoginData) {
    return axiosClient.post<undefined, SuccessResponse<TokenResponse>>('/auth/login', data)
  },
  logout(data: { refreshToken: string }) {
    return axiosClient.post('/auth/logout', data)
  },
  refreshToken(data: { refreshToken: string }) {
    return axiosClient.post<undefined, SuccessResponse<TokenResponse>>('/auth/refresh-token', data)
  }
}

export default authApi
