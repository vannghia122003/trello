import { NextFunction, Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ObjectSchema } from 'joi'
import ApiError, { ErrorsType } from './ApiError'

export const OBJECT_ID_RULE = /^[0-9a-fA-F]{24}$/
export const OBJECT_ID_RULE_MESSAGE = 'value must be a object id'
export const USERNAME_RULE = /^[a-z0-9_]+$/
export const USERNAME_RULE_MESSAGE = 'username only lowercase letters, underscores, and numbers are allowed'
export const HEX_COLOR_RULE = /^#([0-9a-f]{3}){1,2}$/i
export const HEX_COLOR_MESSAGE = 'value is not valid'

export const validateSchema = (
  schema: ObjectSchema,
  req: Request<any, any, any, any>,
  next: NextFunction,
  type: 'body' | 'params' | 'query'
) => {
  let data
  let errorType = 'validation error'
  if (type === 'body') data = req.body

  if (type === 'params') {
    data = req.params
    errorType = 'parameters  error'
  }
  if (type === 'query') {
    data = req.query
    errorType = 'query parameters error'
  }

  const { error, value } = schema.validate(data, { abortEarly: false })
  if (error) {
    const errors: ErrorsType = {}
    error.details.forEach(({ message, path }) => {
      errors[path[0]] = message.replace(/"/g, '')
    })

    return next(
      new ApiError({
        message: errorType,
        status: StatusCodes.UNPROCESSABLE_ENTITY,
        errors
      })
    )
  } else {
    if (type === 'body') req.body = value
    if (type === 'params') req.params = value
    if (type === 'query') req.query = value
    next()
  }
}
