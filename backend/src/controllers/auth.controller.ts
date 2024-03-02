import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { StatusCodes } from 'http-status-codes'
import authService from '~/services/auth.service'
import { LoginReqBody, LogoutReqBody, RegisterReqBody, RefreshTokenReqBody } from '~/types'
import catchAsync from '~/utils/catchAsync'

const authController = {
  register: catchAsync(async (req: Request<ParamsDictionary, undefined, RegisterReqBody>, res: Response) => {
    await authService.register(req.body)
    res.status(StatusCodes.CREATED).json({ message: 'Register account successfully' })
  }),

  login: catchAsync(async (req: Request<ParamsDictionary, undefined, LoginReqBody>, res: Response) => {
    const data = await authService.login(req.body)
    res.status(StatusCodes.OK).json({ message: 'Login successfully', data })
  }),

  logout: catchAsync(async (req: Request<ParamsDictionary, undefined, LogoutReqBody>, res: Response) => {
    await authService.logout(req.body.refreshToken)
    res.status(StatusCodes.NO_CONTENT).json()
  }),

  refreshToken: catchAsync(async (req: Request<ParamsDictionary, undefined, RefreshTokenReqBody>, res: Response) => {
    const data = await authService.refreshToken(req.body.refreshToken)
    res.status(StatusCodes.OK).json({ message: 'Refresh token successfully ', data })
  })
}

export default authController
