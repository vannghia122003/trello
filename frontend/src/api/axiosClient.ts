import axios, { AxiosError, HttpStatusCode, InternalAxiosRequestConfig } from 'axios'
import { toast } from 'react-toastify'
import {
  clearLocalStorage,
  getAccessTokenFromLocalStorage,
  getRefreshTokenFromLocalStorage,
  setAccessTokenToLocalStorage,
  setRefreshTokenToLocalStorage
} from '~/utils/auth'
import { API_URL } from '~/utils/constants'
import { isUnauthorizedError } from '~/utils/error'
import authApi from './auth.api'

let refreshTokenRequest: Promise<{
  accessToken: string
  refreshToken: string
}> | null = null

const axiosClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

axiosClient.interceptors.request.use(
  function (config) {
    const accessToken = getAccessTokenFromLocalStorage()
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  function (error) {
    // Làm gì đó với lỗi request
    return Promise.reject(error)
  }
)

axiosClient.interceptors.response.use(
  function (response) {
    // Bất kì mã trạng thái nào nằm trong tầm 2xx đều khiến hàm này được trigger
    // Làm gì đó với dữ liệu response
    return response.data
  },
  async function (error: AxiosError) {
    // Bất kì mã trạng thái nào lọt ra ngoài tầm 2xx đều khiến hàm này được trigger\
    // Làm gì đó với lỗi response
    if (![HttpStatusCode.UnprocessableEntity, HttpStatusCode.Unauthorized].includes(error.response?.status as number)) {
      const data: any | undefined = error.response?.data
      const message = data?.message || error.message
      toast.error(message)
    }

    if (isUnauthorizedError<{ message: string }>(error)) {
      const config = error.config
      if (error.response?.data.message === 'jwt expired' && config?.url !== '/auth/refresh-token') {
        refreshTokenRequest = refreshTokenRequest ? refreshTokenRequest : handleRefreshToken()
        const { accessToken, refreshToken } = await refreshTokenRequest
        refreshTokenRequest = null
        if (config?.headers) config.headers.Authorization = accessToken
        if (config?.url === '/auth/logout') return authApi.logout({ refreshToken })
        return axiosClient(config as InternalAxiosRequestConfig)
      }
    }

    return Promise.reject(error)
  }
)

const handleRefreshToken = async () => {
  const token = getRefreshTokenFromLocalStorage()
  try {
    const res = await authApi.refreshToken({ refreshToken: token })
    const { accessToken, refreshToken } = res.data
    setAccessTokenToLocalStorage(accessToken)
    setRefreshTokenToLocalStorage(refreshToken)
    return { accessToken, refreshToken }
  } catch (error) {
    clearLocalStorage()
    toast.info('Login session has expired')
    throw error
  }
}

export default axiosClient
