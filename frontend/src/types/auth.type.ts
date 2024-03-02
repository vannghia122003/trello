export interface RegisterData {
  email: string
  password: string
  username: string
  fullName: string
}

export interface LoginData {
  email: string
  password: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
}
