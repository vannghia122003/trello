import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import omit from 'lodash/omit'
import env from '~/config/environment'
import ApiError from '~/utils/ApiError'

export const errorHandler = (err: ApiError, req: Request, res: Response, next: NextFunction) => {
  if (!err.status) err.status = StatusCodes.INTERNAL_SERVER_ERROR

  const response = {
    status: err.status,
    message: err.message || StatusCodes[err.status],
    errors: err.errors,
    stack: err.stack
  }

  if (env.BUILD_MODE !== 'dev') delete response.stack
  res.status(response.status).json(omit(response, ['status']))
}
