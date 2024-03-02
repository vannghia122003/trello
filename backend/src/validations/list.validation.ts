import { NextFunction, Request, Response } from 'express'
import Joi from 'joi'
import { ListStatus } from '~/types'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE, validateSchema } from '~/utils/validators'

const listValidation = {
  createList(req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
      boardId: Joi.string().required().trim().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      title: Joi.string().required().max(50).trim()
    })
    validateSchema(schema, req, next, 'body')
  },
  updateList(req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
      boardId: Joi.string().required().trim().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      title: Joi.string().required().max(50).trim(),
      cardOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).required()
    })
    validateSchema(schema, req, next, 'body')
  },
  getListsQuery(req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
      status: Joi.string()
        .required()
        .valid(...Object.values(ListStatus)),
      boardId: Joi.string().required().trim().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    })
    validateSchema(schema, req, next, 'query')
  }
}

export default listValidation
