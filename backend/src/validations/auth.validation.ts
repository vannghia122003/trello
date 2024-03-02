import { NextFunction, Request, Response } from 'express'
import Joi from 'joi'
import db from '~/config/mongodb'
import { LoginReqBody, RegisterReqBody } from '~/types'
import { USERNAME_RULE, USERNAME_RULE_MESSAGE, validateSchema } from '~/utils/validators'

const authValidation = {
  async register(req: Request, res: Response, next: NextFunction) {
    const [email, username] = await Promise.all([
      (await db.users.findOne({ email: req.body.email.trim() }))?.email,
      (await db.users.findOne({ username: req.body.username.trim() }))?.username
    ])

    const schema = Joi.object<RegisterReqBody>({
      email: Joi.string()
        .required()
        .trim()
        .email()
        .custom((value: string, helpers) => {
          if (value === email) return helpers.message({ custom: 'email already exists' })
          return value
        }),
      password: Joi.string().required().trim().min(6),
      username: Joi.string()
        .required()
        .trim()
        .min(2)
        .max(20)
        .pattern(USERNAME_RULE)
        .message(USERNAME_RULE_MESSAGE)
        .custom((value: string, helpers) => {
          if (value === username) return helpers.message({ custom: 'username already exists' })
          return value
        }),
      fullName: Joi.string().required().trim().min(5).max(30)
    })
    validateSchema(schema, req, next, 'body')
  },
  login(req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object<LoginReqBody>({
      email: Joi.string().required().trim().email(),
      password: Joi.string().required().trim().min(6)
    })
    validateSchema(schema, req, next, 'body')
  },
  refreshToken(req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
      refreshToken: Joi.string().required().trim()
    })
    validateSchema(schema, req, next, 'body')
  }
}

export default authValidation
