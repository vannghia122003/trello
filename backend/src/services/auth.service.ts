import { StatusCodes } from 'http-status-codes'
import { JsonWebTokenError } from 'jsonwebtoken'
import env from '~/config/environment'
import db from '~/config/mongodb'
import { RefreshToken, User } from '~/models'
import { LoginReqBody, RegisterReqBody, TokenType } from '~/types'
import ApiError from '~/utils/ApiError'
import { comparePassword, hashPassword } from '~/utils/bcrypt'
import { generateRandomNumber } from '~/utils/helpers'
import { generateToken, verifyToken } from '~/utils/jwt'

const authService = {
  async register(data: RegisterReqBody) {
    const avatar = `https://picsum.photos/id/${generateRandomNumber()}/200/200`
    db.users.insertOne(new User({ ...data, password: hashPassword(data.password), avatar }))
  },

  async login({ email, password }: LoginReqBody) {
    const user = await db.users.findOne({ email })
    if (user && comparePassword(password, user.password)) {
      const [accessToken, refreshToken] = await Promise.all([
        generateToken(
          { userId: user._id, tokenType: TokenType.AccessToken },
          env.SECRET_KEY_ACCESS_TOKEN,
          env.ACCESS_TOKEN_EXPIRES_IN
        ),
        generateToken(
          { userId: user._id, tokenType: TokenType.RefreshToken },
          env.SECRET_KEY_REFRESH_TOKEN,
          env.REFRESH_TOKEN_EXPIRES_IN
        )
      ])
      const { userId, exp } = await verifyToken(refreshToken, env.SECRET_KEY_REFRESH_TOKEN)
      await db.refreshTokens.insertOne(new RefreshToken({ token: refreshToken, userId, exp }))
      return { accessToken, refreshToken }
    }

    throw new ApiError({
      status: StatusCodes.UNAUTHORIZED,
      message: 'email or password is incorrect'
    })
  },

  async logout(refreshToken: string) {
    db.refreshTokens.deleteOne({ token: refreshToken })
  },
  async refreshToken(token: string) {
    try {
      const [{ userId, exp }, refreshToken] = await Promise.all([
        verifyToken(token, env.SECRET_KEY_REFRESH_TOKEN as string),
        db.refreshTokens.findOne({ token })
      ])
      if (!refreshToken) {
        throw new ApiError({
          message: 'refresh token does not exist',
          status: StatusCodes.UNAUTHORIZED
        })
      }

      const [newAccessToken, newRefreshToken] = await Promise.all([
        generateToken(
          { userId, tokenType: TokenType.AccessToken },
          env.SECRET_KEY_ACCESS_TOKEN,
          env.ACCESS_TOKEN_EXPIRES_IN
        ),
        generateToken({ userId, token_type: TokenType.RefreshToken, exp }, env.SECRET_KEY_REFRESH_TOKEN),
        db.refreshTokens.deleteOne({ token })
      ])

      await db.refreshTokens.insertOne(new RefreshToken({ token: newRefreshToken, userId, exp }))
      return { accessToken: newAccessToken, refreshToken: newRefreshToken }
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw new ApiError({
          message: error.message,
          status: StatusCodes.UNAUTHORIZED
        })
      }
      throw error
    }
  }
}

export default authService
