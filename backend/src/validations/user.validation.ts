import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import { ObjectId } from 'mongodb'
import db from '~/config/mongodb'
import ApiError from '~/utils/ApiError'
import { comparePassword } from '~/utils/bcrypt'
import { USERNAME_RULE, USERNAME_RULE_MESSAGE, validateSchema } from '~/utils/validators'

const userValidation = {
  getUsers(req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
      q: Joi.string().required().trim().optional()
    })
    validateSchema(schema, req, next, 'query')
  },

  async updateMe(req: Request, res: Response, next: NextFunction) {
    const userId = req.decodeAccessToken?.userId as string
    const user = await db.users.findOne({ username: req.body.username })
    const schema = Joi.object({
      username: Joi.string()
        .required()
        .trim()
        .min(2)
        .max(20)
        .pattern(USERNAME_RULE)
        .message(USERNAME_RULE_MESSAGE)
        .custom((value: string, helpers) => {
          if (value === user?.username && !user._id.equals(userId))
            return helpers.message({ custom: 'username already exists' })
          return value
        }),
      fullName: Joi.string().required().trim().min(5).max(30),
      avatar: Joi.string().required().trim().uri()
    })
    validateSchema(schema, req, next, 'body')
  },

  async changePassword(req: Request, res: Response, next: NextFunction) {
    const userId = req.decodeAccessToken?.userId as string
    const user = await db.users.findOne({ _id: new ObjectId(userId) })
    if (!user) {
      return next(
        new ApiError({
          message: 'User not found',
          status: StatusCodes.NOT_FOUND
        })
      )
    }

    const schema = Joi.object({
      oldPassword: Joi.string()
        .required()
        .trim()
        .min(6)
        .custom((value: string, helpers) => {
          if (!comparePassword(value, user.password)) return helpers.message({ custom: 'old password is incorrect' })
          return value
        }),
      newPassword: Joi.string().required().trim().min(6)
    })
    validateSchema(schema, req, next, 'body')
  }
}

export default userValidation
