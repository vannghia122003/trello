import { StatusCodes } from 'http-status-codes'
import omit from 'lodash/omit'
import { ObjectId } from 'mongodb'
import sharp from 'sharp'
import db from '~/config/mongodb'
import ApiError from '~/utils/ApiError'
import { CloudinaryFile, uploadImageToCloudinary } from '~/utils/file'
import { UpdateMeReqBody, ChangePasswordReqBody } from '~/types'
import { hashPassword } from '~/utils/bcrypt'

const userService = {
  async getMe(userId: string) {
    const user = await db.users.findOne({ _id: new ObjectId(userId) })
    if (!user) {
      throw new ApiError({
        status: StatusCodes.NOT_FOUND,
        message: 'User not found'
      })
    }
    return omit(user, ['password', 'verifyToken'])
  },

  async updateMe(userId: string, data: UpdateMeReqBody) {
    const result = await db.users.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      {
        $set: data,
        $currentDate: { updatedAt: true }
      },
      { projection: { password: 0 }, returnDocument: 'after' }
    )
    return result
  },

  async changePassword(userId: string, data: ChangePasswordReqBody) {
    await db.users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: { password: hashPassword(data.newPassword) },
        $currentDate: { updated_at: true }
      }
    )
  },

  async uploadImage(files: CloudinaryFile[]) {
    if (!files || files.length === 0) {
      throw new ApiError({
        status: StatusCodes.BAD_REQUEST,
        message: 'No files provided'
      })
    }
    const result = await Promise.all(
      files.map(async (file) => {
        const resizedBuffer: Buffer = await sharp(file.buffer).toBuffer()
        const url = await uploadImageToCloudinary(resizedBuffer)
        return url
      })
    )

    return result
  },

  async getUsers(q?: string) {
    if (q) {
      return db.users
        .find({ $text: { $search: `"${q}"` } })
        .project({ password: 0 })
        .toArray()
    }
    return db.users.find().project({ password: 0 }).toArray()
  }
}

export default userService
