import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { JsonWebTokenError } from 'jsonwebtoken'
import env from '~/config/environment'
import ApiError from '~/utils/ApiError'
import { verifyToken } from '~/utils/jwt'

export const verifyAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  const bearerToken = req.headers.authorization?.split(' ')
  if (!bearerToken) {
    return next(
      new ApiError({
        status: StatusCodes.UNAUTHORIZED,
        message: 'access token is required'
      })
    )
  }
  if (bearerToken[0] !== 'Bearer') {
    return next(
      new ApiError({
        message: 'access token is invalid',
        status: StatusCodes.UNAUTHORIZED
      })
    )
  }

  try {
    const decoded = await verifyToken(bearerToken[1], env.SECRET_KEY_ACCESS_TOKEN)
    req.decodeAccessToken = decoded
  } catch (error) {
    return next(
      new ApiError({
        message: (error as JsonWebTokenError).message,
        status: StatusCodes.UNAUTHORIZED
      })
    )
  }
  next()
}

export const isLoggedIn = (middleware: (req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization) return middleware(req, res, next)
    next()
  }
}
