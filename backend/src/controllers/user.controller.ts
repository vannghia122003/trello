import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import userService from '~/services/user.service'
import catchAsync from '~/utils/catchAsync'
import { CloudinaryFile, deleteImageFromCloudinary } from '~/utils/file'
import { TokenPayload } from '~/utils/jwt'
import { ChangePasswordReqBody, GetUsersReqQuery, UpdateMeReqBody } from '~/types'

const userController = {
  getUsers: catchAsync(async (req: Request<undefined, undefined, undefined, GetUsersReqQuery>, res: Response) => {
    const data = await userService.getUsers(req.query.q)
    res.status(StatusCodes.OK).json({ message: 'Get users successfully', data })
  }),

  getMe: catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.decodeAccessToken as TokenPayload
    const data = await userService.getMe(userId)
    res.status(StatusCodes.OK).json({ message: 'Get profile successfully', data })
  }),

  updateMe: catchAsync(async (req: Request<undefined, undefined, UpdateMeReqBody>, res: Response) => {
    const { userId } = req.decodeAccessToken as TokenPayload
    const data = await userService.updateMe(userId, req.body)
    res.status(StatusCodes.OK).json({ message: 'Update profile successfully', data })
  }),

  changePassword: catchAsync(async (req: Request<undefined, undefined, ChangePasswordReqBody>, res: Response) => {
    const { userId } = req.decodeAccessToken as TokenPayload
    const data = await userService.changePassword(userId, req.body)
    res.status(StatusCodes.OK).json({ message: 'Change password successfully', data })
  }),

  uploadImage: catchAsync(async (req: Request, res: Response) => {
    const data = await userService.uploadImage(req.files as CloudinaryFile[])
    return res.json({
      message: 'Upload images successfully',
      data
    })
  }),

  deleteImage: catchAsync(async (req: Request, res: Response) => {
    const publicId = `trello/${req.params.urlId}`
    const data = await deleteImageFromCloudinary(publicId)
    res.status(StatusCodes.OK).json({ message: 'Delete image successfully', data })
  })
}

export default userController
