import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import db from '~/config/mongodb'
import { DeleteType } from '~/types'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE, validateSchema } from '~/utils/validators'

export const checkUsernameExist = async (username: string) => {
  const user = await db.users.findOne({ username: username.trim() })
  if (user) {
    throw new ApiError({
      message: 'Validation error',
      status: StatusCodes.UNPROCESSABLE_ENTITY,
      errors: {
        username: 'username already exists'
      }
    })
  }
}

export const deleteQueryParams = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    deleteType: Joi.string()
      .required()
      .valid(...Object.values(DeleteType))
  })
  validateSchema(schema, req, next, 'query')
}

export const validateObjectIdParams = (fields: string[]) => (req: Request, res: Response, next: NextFunction) => {
  const objectSchema: { [key: string]: Joi.SchemaLike | Joi.SchemaLike[] | undefined } = {}
  for (const key of fields) {
    objectSchema[key] = Joi.string().required().trim().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  }
  const schema = Joi.object(objectSchema)
  validateSchema(schema, req, next, 'params')
}
