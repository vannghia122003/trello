import { NextFunction, Request, Response } from 'express'
import Joi from 'joi'
import { AttachmentType, CardStatus } from '~/types'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE, validateSchema } from '~/utils/validators'

const cardValidation = {
  createCard(req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
      boardId: Joi.string().required().trim().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      listId: Joi.string().required().trim().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      title: Joi.string().required().trim()
    })
    validateSchema(schema, req, next, 'body')
  },
  updateCard(req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
      title: Joi.string().optional().trim(),
      cover: Joi.string().optional().trim().allow(''),
      description: Joi.string().optional().trim().allow('')
    })
    validateSchema(schema, req, next, 'body')
  },
  getCards(req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
      status: Joi.string()
        .required()
        .valid(...Object.values(CardStatus)),
      boardId: Joi.string().required().trim().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    })
    validateSchema(schema, req, next, 'query')
  },

  createAttachment(req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
      type: Joi.string()
        .required()
        .valid(...Object.values(AttachmentType)),
      name: Joi.alternatives().conditional('type', {
        is: AttachmentType.Link,
        then: Joi.string().required().allow(''),
        otherwise: Joi.string().required()
      }),
      url: Joi.string().required().uri().trim()
    })
    validateSchema(schema, req, next, 'body')
  },

  updateAttachment(req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
      name: Joi.string().required().trim(),
      url: Joi.string().required().uri().trim()
    })
    validateSchema(schema, req, next, 'body')
  },

  createComment(req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
      content: Joi.string().required().trim()
    })
    validateSchema(schema, req, next, 'body')
  },
  updateComment(req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
      content: Joi.string().required().trim()
    })
    validateSchema(schema, req, next, 'body')
  },

  addMember(req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
      memberId: Joi.string().required().trim()
    })
    validateSchema(schema, req, next, 'body')
  },

  addLabel(req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
      labelId: Joi.string().required().trim()
    })
    validateSchema(schema, req, next, 'body')
  }
}

export default cardValidation
