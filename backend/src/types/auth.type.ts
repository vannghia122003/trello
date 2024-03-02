export interface RegisterReqBody {
  email: string
  password: string
  username: string
  fullName: string
}

export interface LoginReqBody {
  email: string
  password: string
}

export interface LogoutReqBody {
  refreshToken: string
}

export interface RefreshTokenReqBody {
  refreshToken: string
}
